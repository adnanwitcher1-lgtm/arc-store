import { useState } from "react";
import { Mail, MapPin, Clock, MessageCircle, CheckCircle2 } from "lucide-react";
import Container from "../components/common/Container";
import Button from "../components/common/Button";
import Field from "../components/common/Field";
import PageFade from "../components/common/PageTransition";
import { sendContactMessage } from "../api/contact";
import { SITE } from "../lib/site";

const EMPTY = { name: "", email: "", phone: "", subject: "", message: "" };

export default function Contact() {
  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await sendContactMessage(form);
      setSent(true);
      setForm(EMPTY);
    } catch (err) {
      setError(
        err.response?.status === 429
          ? "You've sent a few messages already. Please try again later or message us on WhatsApp."
          : "Something went wrong sending your message. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  const info = [
    { icon: Mail, label: "Email", value: SITE.email, href: `mailto:${SITE.email}` },
    {
      icon: MessageCircle,
      label: "WhatsApp",
      value: "Chat with us",
      href: `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent("Hi! I have a question.")}`,
    },
    { icon: Clock, label: "Working hours", value: SITE.hours },
    { icon: MapPin, label: "Location", value: SITE.address },
  ];

  return (
    <PageFade>
      <section className="border-b border-ink/10 bg-paper-dim/50">
        <Container className="py-12 sm:py-16">
          <p className="text-sm font-medium uppercase tracking-widest text-pine">Contact us</p>
          <h1 className="mt-3 text-4xl font-semibold text-ink sm:text-5xl">We're here to help.</h1>
          <p className="mt-4 max-w-xl text-ink-soft">
            Questions about a product, your order or delivery? Send us a message and we'll reply as soon as we can.
          </p>
        </Container>
      </section>

      <Container className="grid gap-12 py-14 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-2">
          {info.map(({ icon: Icon, label, value, href }) => {
            const body = (
              <div className="flex items-start gap-4 rounded-2xl border border-ink/10 p-5 transition-colors hover:border-pine/40">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-pine/10 text-pine">
                  <Icon size={20} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-stone">{label}</p>
                  <p className="break-words font-medium text-ink">{value}</p>
                </div>
              </div>
            );
            return href ? (
              <a key={label} href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="block">
                {body}
              </a>
            ) : (
              <div key={label}>{body}</div>
            );
          })}
        </div>

        <div className="lg:col-span-3">
          {sent ? (
            <div className="rounded-2xl border border-pine/30 bg-pine/5 p-10 text-center">
              <CheckCircle2 size={44} className="mx-auto text-pine" />
              <h2 className="mt-4 text-2xl font-semibold text-ink">Message sent</h2>
              <p className="mt-2 text-ink-soft">Thanks for reaching out — we'll get back to you by email soon.</p>
              <Button variant="secondary" className="mt-6" onClick={() => setSent(false)}>
                Send another message
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-ink/10 p-6 sm:p-8">
              <h2 className="text-xl font-semibold text-ink">Send us a message</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Your name" value={form.name} onChange={set("name")} required />
                <Field label="Email" type="email" value={form.email} onChange={set("email")} required />
                <Field label="Phone (optional)" type="tel" value={form.phone} onChange={set("phone")} />
                <Field label="Subject" value={form.subject} onChange={set("subject")} />
              </div>
              <Field label="Message" value={form.message} onChange={set("message")} textarea required />
              {error && <p className="text-sm text-brick">{error}</p>}
              <Button type="submit" variant="primary" size="lg" disabled={submitting}>
                {submitting ? "Sending…" : "Send message"}
              </Button>
            </form>
          )}
        </div>
      </Container>
    </PageFade>
  );
}
