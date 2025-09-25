import { Router } from "express";
import { supabaseService } from "../supabaseClient.js";

const router = Router();

/**
 * Flutterwave webhook
 * Header: verif-hash: <FLW_HASH>
 * Body: event payload
 */
router.post("/flutterwave", async (req, res) => {
  try {
    const signature = req.header("verif-hash");
    if (!signature || signature !== process.env.FLW_HASH) {
      return res.status(401).json({ error: "Invalid signature" });
    }

    const event = req.body;
    // Expected successful charge event
    if (event?.data?.status === "successful") {
      const tx_ref = event?.data?.tx_ref;
      const order_id = event?.data?.meta?.order_id;

      if (!order_id && !tx_ref) {
        return res.status(200).json({ ok: true, note: "No order reference" });
      }

      // Mark order paid if pending
      const { error } = await supabaseService
        .from("orders")
        .update({ status: "paid", payment_ref: tx_ref })
        .eq("id", order_id);

      if (error) {
        console.error("Order update error:", error);
        return res.status(500).json({ error: error.message });
      }
    }

    res.json({ received: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
