import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/SiteShell";
import platformImg from "@/assets/platform-viz.jpg";

export const Route = createFileRoute("/platform")({
  head: () => ({
    meta: [
      { title: "Platform — Meridian Cost Attribution Engine" },
      {
        name: "description",
        content:
          "Correlation engine, deployment intelligence, AI root-cause analysis, and forecasts — the technical building blocks of Meridian.",
      },
      { property: "og:title", content: "Meridian Platform" },
      {
        property: "og:description",
        content: "Correlation engine, deployment intelligence, AI insights, and forecasts.",
      },
    ],
  }),
  component: PlatformPage,
});

function PlatformPage() {
  const modules = [
    {
      k: "Correlation Engine",
      d: "Streams billing, metrics, deploy, and log events onto a unified timeline with sub-minute resolution.",
      bullets: [
        "Streaming Kafka ingest",
        "Elasticsearch-backed lookup",
        "Per-second cost bucketing",
      ],
    },
    {
      k: "Billing Import",
      d: "Native CUR, GCP BQ export, and Azure EA importers with automatic reprocessing on late-arriving data.",
      bullets: ["Multi-account", "Multi-currency", "Reserved / Savings normalization"],
    },
    {
      k: "Deployment Intelligence",
      d: "Ingests deploys from GitHub Actions, GitLab, Jenkins, and Argo CD — attributed to commit, PR, and author.",
      bullets: ["Blue/green aware", "Kubernetes rollout tracking", "Terraform plan diffs"],
    },
    {
      k: "AI Insights",
      d: "LLM investigator with structured tool-use across your billing, telemetry, and code index.",
      bullets: ["Natural-language queries", "Cited evidence", "Auto-generated reports"],
    },
    {
      k: "Cost Explorer",
      d: "Fast pivots by team, service, tag, and commit — with per-view RBAC and shareable snapshots.",
      bullets: ["Saved views", "PDF / CSV export", "Public share tokens"],
    },
    {
      k: "Alerts & Workflows",
      d: "Route anomalies to Slack, Teams, PagerDuty, Jira, and webhooks with rich attribution payloads.",
      bullets: ["Threshold + ML alerts", "On-call escalation", "Signed webhooks"],
    },
  ];

  return (
    <SiteShell>
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="pointer-events-none absolute inset-0 grid-bg" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-6 pb-20 pt-20 lg:pt-28">
          <div className="grid items-center gap-14 lg:grid-cols-2">
            <div>
              <span className="mono-eyebrow text-primary">The platform</span>
              <h1 className="mt-4 font-display text-5xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
                Built by engineers.
                <br />
                Trusted by finance.
              </h1>
              <p className="mt-5 max-w-xl text-lg text-muted-foreground">
                Meridian is a stream-processing correlation engine wrapped in a FinOps interface.
                Under the hood: Kafka, Postgres, Elasticsearch, and an LLM planner. On top:
                dashboards your CFO can actually read.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/contact"
                  className="rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground ring-signal"
                >
                  Book a demo
                </Link>
                <Link
                  to="/pricing"
                  className="rounded-md border border-border bg-surface/60 px-5 py-3 text-sm"
                >
                  See pricing
                </Link>
              </div>
            </div>
            <div className="card-elev overflow-hidden ring-signal">
              <img
                src={platformImg}
                alt="Meridian platform architecture visualized as connected cloud nodes"
                width={1600}
                height={1000}
                loading="lazy"
                className="w-full"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="mx-auto max-w-3xl text-center">
          <span className="mono-eyebrow text-primary">Modules</span>
          <h2 className="mt-4 font-display text-4xl font-semibold tracking-tight md:text-5xl">
            Nine services. One coherent surface.
          </h2>
        </div>

        <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {modules.map((m) => (
            <div key={m.k} className="card-elev p-7 hover:border-primary/40 transition-colors">
              <div className="flex items-center gap-2.5">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary font-mono">
                  ◇
                </span>
                <h3 className="text-lg font-semibold">{m.k}</h3>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{m.d}</p>
              <ul className="mt-5 space-y-2">
                {m.bullets.map((b) => (
                  <li
                    key={b}
                    className="flex items-center gap-2.5 font-mono text-xs text-foreground/80"
                  >
                    <span className="h-1 w-1 rounded-full bg-primary" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-border/60 bg-surface/40">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="grid gap-14 lg:grid-cols-[1fr_1.2fr] lg:items-center">
            <div>
              <span className="mono-eyebrow text-primary">Architecture</span>
              <h2 className="mt-4 font-display text-4xl font-semibold tracking-tight md:text-5xl">
                Horizontal by default. Observable by design.
              </h2>
              <p className="mt-5 text-muted-foreground">
                Every ingest path, every correlation shard, every dashboard query is horizontally
                scalable, instrumented with OpenTelemetry, and deployed via immutable Kubernetes
                rollouts.
              </p>
            </div>
            <div className="card-elev p-6 font-mono text-xs leading-relaxed text-foreground/80">
              <div className="mono-eyebrow mb-4 text-primary">stack.yaml</div>
              <pre className="whitespace-pre-wrap">
                {`ingest:
  billing:    aws-cur | gcp-bq | azure-ea
  deploys:    github-actions | gitlab | jenkins | argo
  telemetry:  prometheus | datadog | otlp

pipeline:
  stream:    kafka  →  correlator  →  postgres
  search:    elasticsearch
  cache:     redis
  storage:   s3

compute:
  runtime:   kubernetes  (multi-region)
  api:       node.js / nestjs
  ai:        llm-gateway  (bring-your-own)

security:
  auth:      oauth2 + sso + mfa
  data:      aes-256 at rest · tls 1.3 in transit
  policy:    rbac · audit logs · gdpr`}
              </pre>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24 text-center">
        <h2 className="font-display text-4xl font-semibold tracking-tight md:text-5xl">
          Ready for the technical deep-dive?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          We'll walk your platform team through the correlation model on a shared screen.
        </p>
        <Link
          to="/contact"
          className="mt-8 inline-flex rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground ring-signal"
        >
          Talk to an engineer →
        </Link>
      </section>
    </SiteShell>
  );
}
