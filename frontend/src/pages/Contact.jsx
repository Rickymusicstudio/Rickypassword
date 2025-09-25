// src/pages/Contact.jsx
import { useState } from "react";

export default function Contact() {
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error
  const [err, setErr] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setStatus("sending");

    const formEl = e.currentTarget; // capture before await
    const form = new FormData(formEl);
    const payload = {
      name: (form.get("name") || "").trim(),
      email: (form.get("email") || "").trim(),
      message: (form.get("message") || "").trim(),
      website: form.get("website") || "", // honeypot
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

      let data = {};
      try { data = await r.json(); } catch (_) {}

      if (r.ok) {
        setStatus("sent");
        formEl.reset();
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
    <main className="contact-page">
      {/* Page header aligned to gutters */}
      <header className="page-head">
        <div className="container">
          <h1 className="page-title">Contact</h1>
        </div>
      </header>

      {/* Content */}
      <section>
        <div className="container">
          <form className="card" onSubmit={onSubmit} style={{ gap: 12, display: "grid" }}>
            {/* Honeypot (keep hidden) */}
            <input type="text" name="website" tabIndex="-1" autoComplete="off" style={{ display: "none" }} />

            <label htmlFor="name" style={{ fontSize: 14, opacity: .9 }}>Name</label>
            <input
              id="name"
              className="input"
              name="name"
              placeholder="Your name"
              autoComplete="name"
              required
            />

            <label htmlFor="email" style={{ fontSize: 14, opacity: .9 }}>Email</label>
            <input
              id="email"
              className="input"
              type="email"
              name="email"
              placeholder="you@example.com"
              autoComplete="email"
              required
            />

            <label htmlFor="message" style={{ fontSize: 14, opacity: .9 }}>Message</label>
            <textarea
              id="message"
              className="input"
              name="message"
              rows={6}
              placeholder="Your message…"
              required
            />

            <button className="btn btn-solid" disabled={status === "sending"}>
              {status === "sending" ? "Sending…" : "Send"}
            </button>

            <div aria-live="polite" style={{ minHeight: 22 }}>
              {status === "sent" && <span style={{ color: "#84ffa8" }}>Thanks — your message was sent!</span>}
              {status === "error" && <span style={{ color: "#ff8080" }}>{err}</span>}
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
