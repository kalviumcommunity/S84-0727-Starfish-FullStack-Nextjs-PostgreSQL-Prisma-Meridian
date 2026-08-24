import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/SiteShell";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — Meridian" },
      {
        name: "description",
        content:
          "Transparent, usage-based pricing for Meridian. Three tiers: Team, Business, Enterprise.",
      },
      { property: "og:title", content: "Meridian Pricing" },
      {
        property: "og:description",
        content: "Team, Business, Enterprise — pick the tier that fits.",
      },
    ],
  }),
  component: PricingPage,
});

const tiers = [
  {
    name: "Team",
    price: "$1,200",
    unit: "/ month",
    tag: "Up to $500k monthly cloud spend",
    features: [
      "AWS, GCP, or Azure",
      "GitHub Actions & GitLab",
      "Cost Explorer & alerts",
      "3 seats included",
      "Community support",
    ],
    cta: "Start with Team",
    highlight: false,
  },
  {
    name: "Business",
    price: "$4,800",
    unit: "/ month",
    tag: "Up to $5M monthly cloud spend",
    features: [
      "All clouds + all CI/CD",
      "Datadog / Prometheus / Grafana",
      "AI Root Cause Insights",
      "SSO, RBAC, audit logs",
      "20 seats included",
      "Priority support · 99.95% SLA",
    ],
    cta: "Talk to sales",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    unit: "",
    tag: "Unlimited scale · dedicated infra",
    features: [
      "Everything in Business",
      "VPC / self-hosted option",
      "Custom integrations",
      "Dedicated CSM & SRE",
      "Custom DPA / MSA",
      "24/7 support · 99.99% SLA",
    ],
    cta: "Contact us",
    highlight: false,
  },
];

function PricingPage() {
  return (
    <SiteShell>
      <section className="relative border-b border-border/60">
        <div className="pointer-events-none absolute inset-0 grid-bg" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-6 py-24 text-center animate-fade-in-up">
          <span className="mono-eyebrow text-primary">Pricing</span>
          <h1 className="mt-4 font-display text-5xl font-semibold tracking-tight md:text-6xl">
            Priced against savings, not seats.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-muted-foreground">
            Meridian customers typically recoup the platform fee inside the first quarter of
            deployment. Every tier includes unlimited data ingest.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-6 lg:grid-cols-3 animate-fade-in-up [animation-delay:150ms]">
          {tiers.map((t) => (
            <div
              key={t.name}
              className={
                "card-elev relative flex flex-col p-8 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 " +
                (t.highlight ? "ring-signal border-primary/50" : "hover:border-primary/20")
              }
            >
              {t.highlight && (
                <span className="mono-eyebrow absolute -top-3 left-8 rounded-full bg-primary px-3 py-1 text-primary-foreground">
                  Most chosen
                </span>
              )}
              <h3 className="font-display text-2xl font-semibold">{t.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{t.tag}</p>
              <div className="mt-6 flex items-baseline gap-2">
                <span className="font-display text-5xl font-semibold">{t.price}</span>
                <span className="text-muted-foreground">{t.unit}</span>
              </div>
              <ul className="mt-8 flex-1 space-y-3 text-sm">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-3">
                    <span className="mt-1.5 inline-block h-1.5 w-1.5 rounded-full bg-primary" />
                    <span className="text-foreground/90">{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/contact"
                className={
                  "mt-10 inline-flex items-center justify-center rounded-md px-5 py-3 text-sm font-semibold transition-colors " +
                  (t.highlight
                    ? "bg-primary text-primary-foreground hover:-translate-y-px"
                    : "border border-border bg-surface hover:bg-muted")
                }
              >
                {t.cta}
              </Link>
            </div>
          ))}
        </div>

        <p className="mono-eyebrow mt-12 text-center">
          All prices in USD. Annual contracts available with 15% discount.
        </p>
      </section>
    </SiteShell>
  );
}
