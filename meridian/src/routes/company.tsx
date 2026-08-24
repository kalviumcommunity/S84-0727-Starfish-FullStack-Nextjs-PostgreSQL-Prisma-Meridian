import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/SiteShell";

export const Route = createFileRoute("/company")({
  head: () => ({
    meta: [
      { title: "Company — Meridian FinOps" },
      {
        name: "description",
        content:
          "Meridian is the FinOps intelligence company. We build the correlation layer between engineering and finance.",
      },
      { property: "og:title", content: "About Meridian" },
      {
        property: "og:description",
        content: "The correlation layer between engineering and finance.",
      },
    ],
  }),
  component: CompanyPage,
});

function CompanyPage() {
  return (
    <SiteShell>
      <section className="relative border-b border-border/60">
        <div className="pointer-events-none absolute inset-0 grid-bg" aria-hidden />
        <div className="relative mx-auto max-w-4xl px-6 py-24 text-center">
          <span className="mono-eyebrow text-primary">The company</span>
          <h1 className="mt-4 font-display text-5xl font-semibold tracking-tight md:text-6xl">
            The correlation layer between engineering and finance.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-muted-foreground">
            Meridian was founded by platform engineers and FinOps practitioners who spent too many
            quarters arguing about cloud bills in spreadsheets. We built the tool we wished existed.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-14 px-6 py-24 lg:grid-cols-3">
        {[
          {
            k: "Principle 01",
            t: "Attribution before optimization",
            d: "You cannot optimize what you cannot attribute. Meridian starts with correctness — 90%+ attribution accuracy — before it recommends anything.",
          },
          {
            k: "Principle 02",
            t: "Engineering signals are truth",
            d: "Budgets built from spreadsheets drift. Budgets built from deploys, commits, and telemetry stay honest.",
          },
          {
            k: "Principle 03",
            t: "Explainable by default",
            d: "Every recommendation, every alert, every AI answer ships with linked evidence. If we cannot show you why, we do not show you at all.",
          },
        ].map((p) => (
          <div key={p.k} className="card-elev p-8">
            <div className="mono-eyebrow text-primary">{p.k}</div>
            <h3 className="mt-4 font-display text-2xl font-semibold">{p.t}</h3>
            <p className="mt-3 text-muted-foreground">{p.d}</p>
          </div>
        ))}
      </section>

      <section className="border-y border-border/60 bg-surface/40">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="mono-eyebrow text-primary">Security & compliance</div>
          <div className="mt-6 grid gap-4 md:grid-cols-4">
            {["SOC 2 Type II", "ISO 27001", "GDPR", "HIPAA (Enterprise)"].map((c) => (
              <div key={c} className="card-elev p-6 text-center font-display text-lg font-semibold">
                {c}
              </div>
            ))}
          </div>
          <p className="mt-8 max-w-3xl text-sm text-muted-foreground">
            Encryption at rest and in transit. RBAC, MFA, and audit logs across every surface. OWASP
            Top 10 mitigations verified quarterly. Disaster recovery drills quarterly.
          </p>
        </div>
      </section>
    </SiteShell>
  );
}
