// api/contact.js
import { Router } from "express";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const { name = "Anonymous", email = "", message = "" } = req.body || {};

    // Parse recipient list
    const toList = (process.env.CONTACT_TO || "")
      .split(",")
      .map(s => s.trim())
      .filter(Boolean);

    const from = process.env.CONTACT_FROM;
    const resendKey = process.env.RESEND_API_KEY;
    const isProd = process.env.NODE_ENV === "production";

    // Validate config (be strict in prod, forgiving in dev)
    if (!toList.length || !from) {
      const reason = "CONTACT_TO or CONTACT_FROM missing";
      if (isProd) return res.status(500).json({ error: reason });
      console.warn(`[contact] ${reason} — skipping send`);
      return res.json({ ok: true, skipped: true, reason });
    }

    if (!resendKey) {
      const reason = "RESEND_API_KEY not set";
      if (isProd) return res.status(500).json({ error: reason });
      console.warn(`[contact] ${reason} — skipping send`);
      return res.json({ ok: true, skipped: true, reason });
    }

    // Lazy import & instantiate only when we actually send
    const { Resend } = await import("resend");
    const resend = new Resend(resendKey);

    const { data, error } = await resend.emails.send({
      from: `${process.env.CONTACT_FROM_NAME || "Website"} <${from}>`,
      to: toList,
      subject: process.env.CONTACT_SUBJECT || `New message from ${name}`,
      text: `From: ${name}${email ? ` <${email}>` : ""}\n\n${message}`,
      ...(email ? { reply_to: email } : {}),
    });

    if (error) return res.status(502).json({ error: error.message || "Email send failed" });
    return res.status(200).json({ ok: true, id: data?.id });
  } catch (e) {
    console.error("Contact route exception:", e);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
