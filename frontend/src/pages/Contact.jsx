// src/pages/Contact.jsx
import { useState } from "react";

export default function Contact() {
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error
  const [err, setErr] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setStatus("sending");

    const formEl = e.currentTarget;         // <--- capture before await
    const form = new FormData(formEl);
    const payload = {
      name: (form.get("name") || "").trim(),
      email: (form.get("email") || "").trim(),
      message: (form.get("message") || "").trim(),
      website: form.get("website") || "",   // honeypot
    };

    if (!payload.name || !payload.email || !payload.message) {
      setStatus("idle");
      setErr("Please fill out all fields.");
      return;
    }

    try {
      const r = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // Try to read a message if server sends one (optional)
      let data = {};
      try { data = await r.json(); } catch (_) {}

      if (r.ok) {
        setStatus("sent");
        formEl.reset();                     // <--- use the saved element
      } else {
        setStatus("error");
        setErr(data?.error || "Could not send. Please try again.");
      }
    } catch (err) {
      setStatus("error");
      setErr(err?.message || "Network error. Please try again.");
      console.error("Contact submit failed:", err);
    }
  }

  return (
    <section className="container" style={{ padding: "64px 0" }}>
      <h1 className="h2" style={{ color: "#fff", marginBottom: 24 }}>Contact</h1>

      <form className="card" onSubmit={onSubmit} style={{ gap: 12, display: "grid" }}>
        <input type="text" name="website" tabIndex="-1" autoComplete="off" style={{ display: "none" }} />
        <input className="input" name="name" placeholder="Your name" required />
        <input className="input" type="email" name="email" placeholder="Your email" required />
        <textarea className="input" name="message" rows={6} placeholder="Your message…" required />
        <button className="btn btn-solid" disabled={status === "sending"}>
          {status === "sending" ? "Sending…" : "Send"}
        </button>

        {status === "sent" && <div style={{ color: "#84ffa8" }}>Thanks — your message was sent!</div>}
        {status === "error" && <div style={{ color: "#ff8080" }}>{err}</div>}
      </form>
    </section>
  );
}
