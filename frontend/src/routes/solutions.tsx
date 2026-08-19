import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/SiteShell";

export const Route = createFileRoute("/solutions")({
  head: () => ({
    meta: [
      { title: "Solutions — Meridian for Finance, FinOps, and Engineering" },
      {
        name: "description",
        content:
          "How Meridian serves Finance analysts, FinOps leads, SREs, engineering managers, and executives — with the same source of truth.",
      },
      { property: "og:title", content: "Meridian Solutions" },
      {
        property: "og:description",
        content: "One correlation platform. Five roles. One source of truth.",
      },
    ],
  }),
  component: SolutionsPage,
});

function SolutionsPage() {
  const roles = [
    {
      role: "Finance & FinOps",
      job: "Close the books faster",
      bullets: [
        "Attribute every line to a team, service, and release",
        "Reserved / Savings normalization built in",
        "Audit-ready PDF and CSV exports",
      ],
    },
    {
      role: "SRE & Platform",
      job: "Catch cost regressions like reliability regressions",
      bullets: [
        "Deployment-aware anomaly detection",
        "Alerts routed to PagerDuty with full context",
        "Kubernetes namespace attribution",
      ],
    },
    {
      role: "Engineering Managers",
      job: "Ship efficiency, not just features",
      bullets: [
        "Per-team, per-repo cost delta on every release",
        "Weekly digest of top offenders and top optimizers",
        "Coaching signals for cost-aware code review",
      ],
    },
    {
      role: "CTO & Executive",
      job: "Forecast with confidence",
      bullets: [
        "Predictive budgets, rebuilt hourly",
        "Executive dashboards by business unit",
        "Board-ready commentary from AI Insights",
      ],
    },
  ];
  return (
    <SiteShell>
      <section className="relative border-b border-border/60">
        <div className="pointer-events-none absolute inset-0 grid-bg" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-6 py-24 text-center">
          <span className="mono-eyebrow text-primary">Solutions</span>
          <h1 className="mt-4 font-display text-5xl font-semibold tracking-tight md:text-6xl">
            One platform. Five roles.
            <br />
            One source of truth.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-muted-foreground">
            Finance sees the invoice. Engineering sees the diff. Meridian is the layer where they
            see the same story.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-4 md:grid-cols-2">
          {roles.map((r) => (
            <div key={r.role} className="card-elev p-8">
              <div className="mono-eyebrow text-primary">{r.role}</div>
              <h3 className="mt-3 font-display text-2xl font-semibold">{r.job}</h3>
              <ul className="mt-6 space-y-2.5">
                {r.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-3 text-sm text-foreground/90">
                    <span className="mt-2 inline-block h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_var(--primary)]" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 pb-24 text-center">
        <Link
          to="/contact"
          className="inline-flex rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground ring-signal"
        >
          See it on your data →
        </Link>
      </section>
    </SiteShell>
  );
}
