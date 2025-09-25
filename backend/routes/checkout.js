import { Router } from "express";
import { supabaseService } from "../supabaseClient.js";

const router = Router();

/**
 * POST /api/checkout/session
 * body: { product_id?: number, sku?: string, quantity?: 1, customer?: { email?: string, name?: string } }
 * Creates a PENDING order, creates a Flutterwave payment link, returns checkout_url.
 */
router.post("/session", async (req, res) => {
  try {
    const { product_id, sku, quantity = 1, customer = {} } = req.body || {};
    if ((!product_id && !sku) || quantity < 1)
      return res.status(400).json({ error: "Provide product_id or sku and quantity >= 1" });

    // 1) Find product
    let q = supabaseService
      .from("products")
      .select("id, sku, title, price_cents, kind, media_path, is_active")
      .limit(1);

    if (product_id) q = q.eq("id", product_id);
    else q = q.eq("sku", sku);

    const { data: rows, error: pErr } = await q;
    if (pErr) return res.status(500).json({ error: pErr.message });
    const product = rows?.[0];
    if (!product) return res.status(404).json({ error: "Product not found" });
    if (!product.is_active) return res.status(400).json({ error: "Product inactive" });

    const total = (product.price_cents || 0) * quantity;

    // 2) Create pending order
    const { data: order, error: oErr } = await supabaseService
      .from("orders")
      .insert({
        user_id: null,
        total_cents: total,
        currency: "RWF",
        status: "pending",
      })
      .select("*")
      .single();
    if (oErr) return res.status(500).json({ error: oErr.message });

    // 3) Create order_items (pending)
    const { error: oiErr } = await supabaseService
      .from("order_items")
      .insert([{ order_id: order.id, product_id: product.id, quantity, unit_price_cents: product.price_cents || 0 }]);
    if (oiErr) return res.status(500).json({ error: oiErr.message });

    // 4) Create Flutterwave payment link
    const FLW_SECRET_KEY = process.env.FLW_SECRET_KEY;
    if (!FLW_SECRET_KEY) return res.status(500).json({ error: "FLW_SECRET_KEY not configured" });

    const amount = Math.round(total / 100); // convert cents to currency units
    const tx_ref = `order_${order.id}_${Date.now()}`;
    const redirect_url = `${process.env.SITE_URL || "http://localhost:5173"}/checkout/complete?order_id=${order.id}`;

    const resp = await fetch("https://api.flutterwave.com/v3/payments", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${FLW_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tx_ref,
        amount,
        currency: "RWF",
        redirect_url,
        customer: {
          email: customer.email || "guest@example.com",
          name: customer.name || "Guest",
        },
        meta: {
          order_id: order.id,
          product_id: product.id,
          sku: product.sku,
        },
        customizations: {
          title: "rickypassword.com",
          description: product.title,
        },
      }),
    });

    const json = await resp.json();
    if (!resp.ok || !json?.status || json.status !== "success") {
      return res.status(500).json({ error: json?.message || "Flutterwave init failed" });
    }

    const checkout_url = json.data?.link;

    // 5) Save tx_ref on order
    await supabaseService.from("orders").update({ payment_ref: tx_ref }).eq("id", order.id);

    return res.json({ order_id: order.id, checkout_url, tx_ref });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * POST /api/checkout/dev
 * body: { product_id?: number, sku?: string, quantity?: 1 }
 * Dev-only: instantly creates PAID order and returns a signed download URL.
 */
router.post("/dev", async (req, res) => {
  try {
    const { product_id, sku, quantity = 1 } = req.body || {};
    if ((!product_id && !sku) || quantity < 1) {
      return res.status(400).json({ error: "Provide product_id or sku and quantity >= 1" });
    }

    let q = supabaseService
      .from("products")
      .select("id, sku, title, price_cents, kind, media_path, is_active")
      .limit(1);

    if (product_id) q = q.eq("id", product_id);
    else q = q.eq("sku", sku);

    const { data: rows, error: pErr } = await q;
    if (pErr) return res.status(500).json({ error: pErr.message });
    const product = rows?.[0];
    if (!product) return res.status(404).json({ error: "Product not found" });
    if (!product.is_active) return res.status(400).json({ error: "Product inactive" });

    const total = (product.price_cents || 0) * quantity;

    const { data: order, error: oErr } = await supabaseService
      .from("orders")
      .insert({ user_id: null, total_cents: total, currency: "RWF", status: "paid", payment_ref: "dev" })
      .select("*")
      .single();
    if (oErr) return res.status(500).json({ error: oErr.message });

    const { error: oiErr } = await supabaseService
      .from("order_items")
      .insert([{ order_id: order.id, product_id: product.id, quantity, unit_price_cents: product.price_cents || 0 }]);
    if (oiErr) return res.status(500).json({ error: oiErr.message });

    let download = null;
    if (product.kind === "digital" && product.media_path) {
      const { data: signed, error: sErr } = await supabaseService
        .storage.from("audio")
        .createSignedUrl(product.media_path, 3600);
      if (sErr) return res.status(500).json({ error: sErr.message });
      download = { url: signed.signedUrl, expires_in: 3600 };
    }

    res.json({ order_id: order.id, total_cents: total, product, download });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
