import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteShell } from "@/components/site/SiteShell";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Book a Meridian demo" },
      {
        name: "description",
        content:
          "Book a 30-minute working session with the Meridian team. Bring your last cloud invoice.",
      },
      { property: "og:title", content: "Contact Meridian" },
      {
        property: "og:description",
        content: "Book a 30-minute working session with the Meridian team.",
      },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  return (
    <SiteShell>
      <section className="relative border-b border-border/60">
        <div className="pointer-events-none absolute inset-0 grid-bg" aria-hidden />
        <div className="relative mx-auto grid max-w-7xl gap-14 px-6 py-24 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <span className="mono-eyebrow text-primary">Contact</span>
            <h1 className="mt-4 font-display text-5xl font-semibold tracking-tight md:text-6xl">
              Book a working session.
            </h1>
            <p className="mt-5 max-w-lg text-muted-foreground">
              30 minutes with an engineer and a FinOps lead. Bring your last invoice — we'll build a
              correlation model on it live.
            </p>
            <div className="mt-10 space-y-4 text-sm">
              {[
                ["Sales", "sales@meridian.app"],
                ["Support", "help@meridian.app"],
                ["Security", "security@meridian.app"],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center gap-6">
                  <span className="mono-eyebrow w-20">{k}</span>
                  <span className="font-mono">{v}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card-elev p-8">
            {submitted ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-primary text-xl">
                  ✓
                </div>
                <h3 className="mt-6 font-display text-2xl font-semibold">
                  Thanks — we'll be in touch.
                </h3>
                <p className="mt-3 max-w-sm text-muted-foreground">
                  A member of the Meridian team will reach out within one business day to schedule
                  your session.
                </p>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setSubmitted(true);
                }}
                className="space-y-5"
              >
                <Field
                  label="Work email"
                  name="email"
                  type="email"
                  placeholder="you@company.com"
                  required
                />
                <Field label="Full name" name="name" placeholder="Jane Doe" required />
                <Field label="Company" name="company" placeholder="Acme Cloud" required />
                <div>
                  <label className="mono-eyebrow mb-2 block">Approximate monthly cloud spend</label>
                  <select
                    name="spend"
                    className="w-full rounded-md border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-primary"
                    defaultValue=""
                    required
                  >
                    <option value="" disabled>
                      Select a range
                    </option>
                    <option>Less than $100k</option>
                    <option>$100k – $500k</option>
                    <option>$500k – $5M</option>
                    <option>$5M+</option>
                  </select>
                </div>
                <div>
                  <label className="mono-eyebrow mb-2 block">
                    What's the biggest attribution pain?
                  </label>
                  <textarea
                    name="notes"
                    rows={4}
                    placeholder="Tell us what you're trying to figure out."
                    className="w-full resize-none rounded-md border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-primary"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground ring-signal"
                >
                  Request demo →
                </button>
                <p className="mono-eyebrow text-center">We reply within 1 business day.</p>
              </form>
            )}
          </div>
        </div>
      </section>
    </SiteShell>
  );
}



function Field({
  label,
  name,
  type = "text",
  placeholder,
  required,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={name} className="mono-eyebrow mb-2 block">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-md border border-border bg-surface px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground/60 focus:border-primary"
      />
    </div>
  );
}
