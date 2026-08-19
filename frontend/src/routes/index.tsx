import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/SiteShell";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Meridian — Explain every dollar. Attribute every deploy." },
      {
        name: "description",
        content:
          "Meridian correlates AWS, GCP, and Azure billing with deployments and telemetry so finance and engineering finally speak the same language.",
      },
      { property: "og:title", content: "Meridian — Cloud Cost Attribution Platform" },
      {
        property: "og:description",
        content:
          "Correlate billing, deployments, and telemetry. Attribute every dollar to a team, service, and release.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <SiteShell>
      <Hero />
      <ValueGrid />
      <TimelineShowcase />
      <PillarSection />
      <AISection />
      <StatsBand />
      <IntegrationsGrid />
      <CTASection />
    </SiteShell>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 grid-bg" aria-hidden />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[700px]"
        style={{ background: "var(--gradient-hero)" }}
        aria-hidden
      />
      <div className="relative mx-auto max-w-7xl px-6 pb-20 pt-20 lg:pt-28">
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_420px]">
          {/* Left copy */}
          <div className="animate-fade-in-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-[11px] font-mono text-primary tracking-widest uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              v2.0 · Correlation Engine GA
            </span>
            <h1 className="mt-5 font-display text-5xl font-bold leading-[1.04] tracking-tight md:text-6xl lg:text-7xl">
              Cloud spend,
              <br />
              <span className="relative">
                <span className="bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent">
                  finally explained.
                </span>
              </span>
            </h1>
            <p className="mt-5 max-w-lg text-[17px] text-muted-foreground leading-relaxed">
              Connect AWS, GCP, and Azure billing to your deploys, metrics, and commits. Know
              exactly which team, service, and PR caused every cost change.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/auth/register"
                className="group inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:-translate-y-0.5 hover:shadow-primary/40"
              >
                Get started
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  className="transition-transform group-hover:translate-x-0.5"
                >
                  <path
                    d="M1 7h12M8 2l5 5-5 5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
              <Link
                to="/platform"
                className="inline-flex items-center gap-2 rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                See how it works
              </Link>
            </div>
            <div className="mt-8 flex items-center gap-4">
              <div className="flex -space-x-2">
                {["SC", "MR", "AK", "JP", "TW"].map((i) => (
                  <div
                    key={i}
                    className="h-7 w-7 rounded-full border-2 border-background bg-gradient-to-br from-primary/60 to-accent/60 flex items-center justify-center text-[9px] font-bold text-primary-foreground"
                  >
                    {i}
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">140+ FinOps teams</span> trust
                Meridian in production
              </p>
            </div>
          </div>

          {/* Right: Terminal mockup */}
          <div className="animate-fade-in-up [animation-delay:150ms]">
            <div className="card-elev overflow-hidden font-mono text-sm">
              <div className="flex items-center gap-2 border-b border-border bg-muted/60 px-4 py-2.5">
                <div className="flex gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-red-400/70" />
                  <span className="h-3 w-3 rounded-full bg-yellow-400/70" />
                  <span className="h-3 w-3 rounded-full bg-green-400/70" />
                </div>
                <span className="ml-2 text-[11px] text-muted-foreground">
                  Terminal — meridian connect
                </span>
              </div>
              <div className="space-y-1.5 p-5 text-[13px] leading-relaxed">
                <div className="flex gap-3">
                  <span className="text-accent shrink-0">$</span>
                  <span className="text-foreground">npx @meridian/cli connect aws</span>
                </div>
                <div className="text-muted-foreground pl-5">
                  ✓ AWS credentials found (us-east-1)
                </div>
                <div className="text-muted-foreground pl-5">
                  ✓ CUR bucket detected: s3://acme-billing-reports
                </div>
                <div className="text-muted-foreground pl-5">
                  ↻ Syncing 47 days of billing data...
                </div>
                <div className="flex gap-3 mt-2">
                  <span className="text-accent shrink-0">$</span>
                  <span className="text-foreground">meridian attribute --pr 2841</span>
                </div>
                <div className="text-muted-foreground pl-5">Scanning deploy history...</div>
                <div className="mt-2 rounded-md border border-primary/25 bg-primary/5 p-3">
                  <div className="text-primary font-semibold">⚡ Cost delta found</div>
                  <div className="mt-1 text-muted-foreground text-[12px]">
                    PR #2841 → <span className="text-danger font-semibold">+$4,120/day</span> RDS
                    I/O
                  </div>
                  <div className="text-muted-foreground text-[12px]">
                    Unindexed query on <span className="text-foreground">orders.created_at</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-muted-foreground text-[11px]">
                    Meridian watching 23 services
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ValueGrid() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <div className="mb-12">
        <p className="font-mono text-xs tracking-widest uppercase text-primary">Why Meridian</p>
        <h2 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-5xl">
          The missing correlation layer
        </h2>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          Cloud billing, CI/CD history, and monitoring live in silos. Meridian is the correlation
          layer that unifies them.
        </p>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {/* Tall card: Slack alert mockup */}
        <div className="card-elev group col-span-1 md:col-span-1 lg:col-span-2 row-span-2 flex flex-col overflow-hidden hover:-translate-y-1 hover:shadow-xl hover:border-primary/20 transition-all duration-300">
          <div className="border-b border-border bg-muted/40 px-4 py-3 flex items-center gap-2">
            <span className="text-[13px] font-semibold text-foreground">meridian-alerts</span>
            <span className="ml-auto font-mono text-[10px] text-muted-foreground">#finops-eng</span>
          </div>
          <div className="flex-1 p-4 space-y-4 text-sm">
            {/* Slack message 1 */}
            <div className="flex gap-3">
              <div className="h-8 w-8 shrink-0 rounded-lg bg-gradient-to-br from-red-500/80 to-orange-500/80 flex items-center justify-center text-white text-[10px] font-bold">
                M
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-[13px] font-semibold">Meridian</span>
                  <span className="font-mono text-[10px] text-muted-foreground">09:31 AM</span>
                </div>
                <div className="mt-1 rounded-lg border-l-4 border-danger bg-danger/5 p-3">
                  <p className="font-semibold text-danger text-[12px]">🚨 Cost Anomaly Detected</p>
                  <p className="mt-1 text-[12px] text-foreground/80">
                    <span className="font-mono">payments-prod</span> RDS spend ↑{" "}
                    <span className="font-semibold text-danger">+$4,120/day</span>
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Correlated → deploy <span className="font-mono text-foreground">v4.21.0</span>{" "}
                    (09:14 AM)
                  </p>
                  <div className="mt-2 flex gap-2">
                    <button className="rounded px-2.5 py-1 bg-primary text-primary-foreground text-[11px] font-semibold">
                      View root cause
                    </button>
                    <button className="rounded px-2.5 py-1 border border-border text-[11px]">
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            </div>
            {/* Slack reply */}
            <div className="flex gap-3">
              <div className="h-8 w-8 shrink-0 rounded-lg bg-gradient-to-br from-blue-500/80 to-violet-500/80 flex items-center justify-center text-white text-[10px] font-bold">
                SC
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-[13px] font-semibold">Sarah Chen</span>
                  <span className="font-mono text-[10px] text-muted-foreground">09:33 AM</span>
                </div>
                <p className="mt-1 text-[12px] text-foreground/80">
                  Looking — it's the unindexed sort in PR #2841. Rolling back now.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="h-8 w-8 shrink-0 rounded-lg bg-gradient-to-br from-green-500/70 to-teal-500/70 flex items-center justify-center text-white text-[10px] font-bold">
                M
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-[13px] font-semibold">Meridian</span>
                  <span className="font-mono text-[10px] text-muted-foreground">09:41 AM</span>
                </div>
                <div className="mt-1 rounded-lg border-l-4 border-primary bg-primary/5 p-3">
                  <p className="font-semibold text-primary text-[12px]">✅ Cost normalizing</p>
                  <p className="mt-1 text-[12px] text-foreground/80">
                    RDS I/O returning to baseline.{" "}
                    <span className="text-primary font-semibold">$0/day saved.</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-border px-4 py-2.5">
            <p className="font-mono text-[10px] text-muted-foreground">
              ↳ Connected via Meridian Slack App
            </p>
          </div>
        </div>

        {/* Attribution accuracy stat */}
        <div className="card-elev col-span-1 md:col-span-1 lg:col-span-2 flex flex-col justify-between p-7 overflow-hidden relative group hover:-translate-y-1 hover:border-primary/20 transition-all duration-300">
          <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/10 blur-2xl animate-pulse-slow" />
          <p className="font-mono text-xs tracking-widest uppercase text-muted-foreground">
            Attribution accuracy
          </p>
          <div>
            <div className="font-display text-6xl font-bold text-primary">
              90<span className="text-4xl">%+</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Even for shared infrastructure, reserved instances, and savings plans — we trace every
              dollar.
            </p>
          </div>
          <div className="mt-4 h-1.5 rounded-full bg-muted overflow-hidden">
            <div className="h-full w-[91%] rounded-full bg-gradient-to-r from-primary to-accent" />
          </div>
        </div>

        {/* Investigation time stat */}
        <div className="card-elev col-span-1 md:col-span-1 lg:col-span-2 flex flex-col justify-between p-7 overflow-hidden relative group hover:-translate-y-1 hover:border-primary/20 transition-all duration-300">
          <div className="pointer-events-none absolute -left-8 -bottom-8 h-32 w-32 rounded-full bg-accent/10 blur-2xl animate-pulse-slow" />
          <p className="font-mono text-xs tracking-widest uppercase text-muted-foreground">
            Investigation time
          </p>
          <div>
            <div className="font-display text-6xl font-bold">
              <span className="text-foreground/40 line-through text-4xl mr-2">3d</span>
              <span className="text-primary">2m</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              From "the bill spiked" to root cause in under 2 minutes, not 3 days of spreadsheet
              archaeology.
            </p>
          </div>
        </div>

        {/* Wide card: deploy attribution flow */}
        <div className="card-elev col-span-1 md:col-span-2 lg:col-span-4 p-6 overflow-hidden hover:-translate-y-1 hover:border-primary/20 transition-all duration-300">
          <p className="font-mono text-xs tracking-widest uppercase text-muted-foreground mb-4">
            Deployment cost attribution
          </p>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            {[
              { label: "GitHub PR #2841", color: "border-border bg-muted text-foreground" },
              {
                label: "→",
                color: "border-transparent bg-transparent text-muted-foreground text-lg",
              },
              { label: "Deploy v4.21.0", color: "border-accent/30 bg-accent/10 text-accent" },
              {
                label: "→",
                color: "border-transparent bg-transparent text-muted-foreground text-lg",
              },
              { label: "RDS I/O spike", color: "border-danger/30 bg-danger/10 text-danger" },
              {
                label: "→",
                color: "border-transparent bg-transparent text-muted-foreground text-lg",
              },
              {
                label: "+$4,120/day",
                color: "border-danger/40 bg-danger/10 text-danger font-bold",
              },
            ].map((step, i) => (
              <span
                key={i}
                className={`rounded-lg border px-3 py-1.5 font-mono text-[12px] ${step.color}`}
              >
                {step.label}
              </span>
            ))}
          </div>
          <div className="mt-5 grid grid-cols-3 gap-3">
            {[
              { k: "Team", v: "checkout-svc" },
              { k: "Author", v: "sarah.chen@acme.co" },
              { k: "Service", v: "payments-prod (EKS)" },
            ].map((d) => (
              <div key={d.k} className="rounded-lg bg-muted/50 border border-border/60 p-3">
                <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
                  {d.k}
                </div>
                <div className="mt-1 text-[13px] font-medium text-foreground truncate">{d.v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function TimelineShowcase() {
  const [activeIndex, setActiveIndex] = useState(3);

  const events = [
    {
      time: "09:14",
      label: "deploy: checkout-svc @ v4.21.0",
      tone: "accent",
      chartTitle: "1. Deployment Event Shipped",
      desc: "Deployment checkout-svc @ v4.21.0 successfully completed on 12 nodes in AWS us-east-1. Cost baseline is normal ($1,240/hr).",
      codeChange: {
        pr: "PR #2841",
        title: "Add orders tracking query sorting",
        author: "Sarah Chen (SRE)",
        diff: [
          { type: "add", text: '+  orders := db.Where("status = ?", "pending").' },
          { type: "add", text: '+     Order("created_at desc").Find(&results)' },
          {
            type: "info",
            text: "Note: sorting field 'created_at' does not have a database index.",
          },
        ],
      },
      metrics: { cpu: 12, cost: 1240, costText: "Normal" },
    },
    {
      time: "09:22",
      label: "metric: db-cpu +38% (rds-prod-01)",
      tone: "muted",
      chartTitle: "2. Database CPU Spike",
      desc: "10 minutes post-deploy, db-cpu spikes +38% on rds-prod-01 due to unindexed sorting queries. RDS I/O rate increases rapidly.",
      codeChange: {
        pr: "PR #2841",
        title: "Add orders tracking query sorting",
        author: "Sarah Chen (SRE)",
        diff: [
          { type: "add", text: '+  orders := db.Where("status = ?", "pending").' },
          { type: "add", text: '+     Order("created_at desc").Find(&results)' },
          {
            type: "info",
            text: "Note: sorting field 'created_at' does not have a database index.",
          },
        ],
      },
      metrics: { cpu: 52, cost: 1350, costText: "Elevated" },
    },
    {
      time: "09:31",
      label: "cost: RDS I/O anomaly detected",
      tone: "danger",
      chartTitle: "3. Anomaly Paged",
      desc: "Cloud cost attribution engine detects severe cost projection spike: +$4,120/day projection jump on AWS RDS I/O line items.",
      codeChange: {
        pr: "PR #2841",
        title: "Add orders tracking query sorting",
        author: "Sarah Chen (SRE)",
        diff: [
          { type: "add", text: '+  orders := db.Where("status = ?", "pending").' },
          { type: "add", text: '+     Order("created_at desc").Find(&results)' },
          {
            type: "info",
            text: "Note: sorting field 'created_at' does not have a database index.",
          },
        ],
      },
      metrics: { cpu: 82, cost: 2950, costText: "+$4,120/day delta" },
    },
    {
      time: "09:33",
      label: "meridian: root cause → PR #2841",
      tone: "primary",
      chartTitle: "4. Automated Causal Link",
      desc: "Meridian correlates the RDS cost anomaly directly to PR #2841 deployment. Unindexed DB query identified as root cause within 120 seconds.",
      codeChange: {
        pr: "PR #2841",
        title: "Add orders tracking query sorting",
        author: "Sarah Chen (SRE)",
        diff: [
          { type: "add", text: '+  orders := db.Where("status = ?", "pending").' },
          { type: "add", text: '+     Order("created_at desc").Find(&results)' },
          {
            type: "info",
            text: "Note: sorting field 'created_at' does not have a database index.",
          },
        ],
      },
      metrics: { cpu: 84, cost: 2950, costText: "+$4,120/day (attributing...)" },
    },
  ] as const;

  const current = events[activeIndex];

  // SVG Chart points based on step
  let pathD = "M 20 160 Q 150 160 200 160 T 350 160 T 480 160";
  let fillD = "M 20 160 Q 150 160 200 160 T 350 160 T 480 160 L 480 200 L 20 200 Z";

  if (activeIndex === 1) {
    pathD = "M 20 160 L 150 160 L 220 150 L 300 130 L 480 120";
    fillD = "M 20 160 L 150 160 L 220 150 L 300 130 L 480 120 L 480 200 L 20 200 Z";
  } else if (activeIndex >= 2) {
    pathD = "M 20 160 L 150 160 L 220 150 L 300 130 L 350 60 L 480 50";
    fillD = "M 20 160 L 150 160 L 220 150 L 300 130 L 350 60 L 480 50 L 480 200 L 20 200 Z";
  }

  return (
    <section
      className="relative border-y border-border/60 bg-surface/30 py-24"
      id="timeline-simulator"
    >
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-stretch gap-14 px-6 lg:grid-cols-12">
        {/* Left explanation column */}
        <div className="lg:col-span-5 flex flex-col justify-center animate-fade-in-up">
          <span className="mono-eyebrow text-primary">The correlation engine</span>
          <h2 className="mt-4 font-display text-4xl font-semibold tracking-tight md:text-5xl">
            One timeline. Deploys, metrics, and cost — aligned to the second.
          </h2>
          <p className="mt-5 text-muted-foreground">
            Every deploy, every metric spike, every billing event lives on the same axis. Filter by
            team, service, or repository and watch causality snap into place.
          </p>
          <ul className="mt-8 space-y-3 text-sm">
            {[
              "Sub-minute event resolution across AWS, GCP, and Azure",
              "Per-service, per-namespace, per-commit granularity",
              "Bidirectional linking to GitHub, GitLab, Jenkins",
            ].map((li) => (
              <li key={li} className="flex items-start gap-3">
                <span className="mt-2 inline-block h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_var(--primary)]" />
                <span className="text-foreground/90">{li}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right Interactive Simulator */}
        <div className="lg:col-span-7 flex flex-col justify-between card-elev overflow-hidden hover:shadow-2xl hover:border-primary/20 transition-all duration-300 animate-fade-in-up [animation-delay:150ms]">
          {/* Simulation Header */}
          <div className="flex flex-wrap items-center justify-between border-b border-border bg-surface/80 px-5 py-3.5">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
                <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
                <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
              </div>
              <span className="mono-eyebrow ml-3 text-[11px] text-muted-foreground">
                Interactive Cost Correlation Simulator
              </span>
            </div>
            <span className="mono-eyebrow text-[11px] text-primary flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              Active step: {activeIndex + 1} / 4
            </span>
          </div>

          <div className="p-6 grid gap-6 md:grid-cols-12 flex-1">
            {/* Steps select sub-panel (col 5) */}
            <div className="md:col-span-5 flex flex-col justify-start gap-3">
              <div className="text-[11px] mono-eyebrow mb-1 text-muted-foreground">
                Incident Timeline
              </div>
              {events.map((e, idx) => (
                <button
                  key={e.time}
                  onClick={() => setActiveIndex(idx)}
                  className={`group w-full relative flex items-start gap-3.5 rounded-lg border p-3 text-left transition-all duration-300 cursor-pointer ${
                    activeIndex === idx
                      ? "border-primary/50 bg-primary/5 ring-1 ring-primary/25"
                      : "border-border bg-surface/50 hover:bg-surface hover:border-foreground/20"
                  }`}
                >
                  <span className="font-mono text-xs text-muted-foreground w-9 pt-0.5 shrink-0">
                    {e.time}
                  </span>
                  <span
                    className={`mt-1.5 h-2 w-2 shrink-0 rounded-full border-2 border-background transition-all duration-300 ${
                      activeIndex === idx
                        ? e.tone === "primary"
                          ? "bg-primary scale-125"
                          : e.tone === "danger"
                            ? "bg-danger"
                            : e.tone === "accent"
                              ? "bg-accent"
                              : "bg-muted-foreground"
                        : "bg-muted-foreground/40"
                    }`}
                  />
                  <span
                    className={`text-[13px] font-mono leading-snug break-all ${activeIndex === idx ? "text-foreground font-semibold" : "text-muted-foreground group-hover:text-foreground"}`}
                  >
                    {e.label}
                  </span>
                </button>
              ))}
            </div>

            {/* SVG graph & Causal display panel (col 7) */}
            <div className="md:col-span-7 flex flex-col justify-between gap-5">
              {/* Dynamic SVG Chart */}
              <div className="relative border border-border/80 rounded-lg p-3 bg-surface/40 overflow-hidden min-h-[140px] flex flex-col justify-between">
                <div className="flex justify-between items-center text-[10px] mono-eyebrow text-muted-foreground pb-2">
                  <span>RDS Cost Index (rds-prod-01)</span>
                  <span className={current.metrics.cost > 1500 ? "text-danger font-semibold" : ""}>
                    {current.metrics.costText}
                  </span>
                </div>
                <div className="relative w-full h-[100px]">
                  <svg className="w-full h-full" viewBox="0 0 500 200" preserveAspectRatio="none">
                    {/* Grid lines */}
                    <line
                      x1="0"
                      y1="50"
                      x2="500"
                      y2="50"
                      stroke="var(--border)"
                      strokeWidth="0.5"
                      strokeDasharray="3 3"
                    />
                    <line
                      x1="0"
                      y1="100"
                      x2="500"
                      y2="100"
                      stroke="var(--border)"
                      strokeWidth="0.5"
                      strokeDasharray="3 3"
                    />
                    <line
                      x1="0"
                      y1="150"
                      x2="500"
                      y2="150"
                      stroke="var(--border)"
                      strokeWidth="0.5"
                      strokeDasharray="3 3"
                    />

                    {/* Shaded Area under curve */}
                    <path
                      d={fillD}
                      fill="url(#chart-glow)"
                      className="transition-all duration-700 ease-out"
                    />

                    {/* Cost curve line */}
                    <path
                      d={pathD}
                      fill="none"
                      stroke={activeIndex >= 2 ? "var(--danger)" : "var(--primary)"}
                      strokeWidth="2.5"
                      className="transition-all duration-700 ease-out"
                    />

                    {/* Gradient Definitions */}
                    <defs>
                      <linearGradient id="chart-glow" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="0%"
                          stopColor={activeIndex >= 2 ? "var(--danger)" : "var(--primary)"}
                          stopOpacity="0.25"
                        />
                        <stop
                          offset="100%"
                          stopColor={activeIndex >= 2 ? "var(--danger)" : "var(--primary)"}
                          stopOpacity="0.0"
                        />
                      </linearGradient>
                    </defs>

                    {/* Deploy moment vertical dashed line (x=150) */}
                    {activeIndex >= 0 && (
                      <>
                        <line
                          x1="150"
                          y1="20"
                          x2="150"
                          y2="180"
                          stroke="var(--accent)"
                          strokeWidth="1.5"
                          strokeDasharray="4 4"
                        />
                        <circle
                          cx="150"
                          cy="160"
                          r="5"
                          fill="var(--accent)"
                          className="animate-ping"
                        />
                        <circle cx="150" cy="160" r="3.5" fill="var(--accent)" />
                      </>
                    )}

                    {/* CPU Spike warning (x=280) */}
                    {activeIndex >= 1 && (
                      <circle
                        cx="280"
                        cy={activeIndex >= 2 ? "138" : "132"}
                        r="4"
                        fill="var(--muted-foreground)"
                      />
                    )}

                    {/* Anomaly Detection indicator (x=350) */}
                    {activeIndex >= 2 && (
                      <>
                        <line
                          x1="350"
                          y1="20"
                          x2="350"
                          y2="180"
                          stroke="var(--danger)"
                          strokeWidth="1.5"
                          strokeDasharray="4 4"
                        />
                        <circle
                          cx="350"
                          cy="60"
                          r="7"
                          fill="var(--danger)"
                          className="animate-ping"
                        />
                        <circle cx="350" cy="60" r="4" fill="var(--danger)" />
                      </>
                    )}
                  </svg>

                  {/* HTML Overlay Tags inside chart */}
                  {activeIndex >= 0 && (
                    <span className="absolute left-[155px] top-[15px] font-mono text-[9px] px-1.5 py-0.5 rounded bg-accent/10 border border-accent/20 text-accent">
                      Deploy
                    </span>
                  )}
                  {activeIndex >= 2 && (
                    <span className="absolute left-[295px] top-[15px] font-mono text-[9px] px-1.5 py-0.5 rounded bg-danger/10 border border-danger/20 text-danger animate-bounce">
                      Cost Spike
                    </span>
                  )}
                  {activeIndex >= 3 && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="px-3 py-1.5 rounded-full border border-primary/40 bg-primary/95 text-primary-foreground font-mono text-[10px] font-semibold tracking-wide shadow-lg animate-fade-in-up">
                        🔗 100% Causal Link Attributed
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Attributed Details (Git PR Diff panel) */}
              <div className="border border-border/80 rounded-lg bg-surface/50 p-4 min-h-[140px] flex flex-col justify-between transition-all duration-500">
                <div>
                  <div className="flex items-center justify-between text-[11px] mono-eyebrow text-muted-foreground pb-2 border-b border-border/60">
                    <span>Causal Root Cause Analysis</span>
                    <span className="text-primary font-semibold font-mono">
                      {current.codeChange.pr}
                    </span>
                  </div>
                  <p className="mt-2.5 text-[12px] leading-relaxed text-foreground/90 font-medium">
                    {current.desc}
                  </p>

                  {/* Committer & Diff display (shows detailed Git code diff if index >= 3) */}
                  {activeIndex >= 3 ? (
                    <div className="mt-3.5 rounded bg-muted/65 border border-border/60 p-2.5 font-mono text-[11px] leading-normal text-muted-foreground animate-fade-in-up">
                      <div className="text-[10px] text-foreground font-semibold mb-1 flex justify-between">
                        <span>Commit: {current.codeChange.title}</span>
                        <span className="text-[9px] text-muted-foreground">
                          by {current.codeChange.author}
                        </span>
                      </div>
                      {current.codeChange.diff.map((line, lIdx) => (
                        <div
                          key={lIdx}
                          className={
                            line.type === "add"
                              ? "text-emerald-600 dark:text-emerald-400 font-semibold"
                              : "text-amber-600 dark:text-amber-400"
                          }
                        >
                          {line.text}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-3.5 border border-dashed border-border/80 rounded p-4 text-center text-xs text-muted-foreground/60 italic font-mono flex items-center justify-center gap-2">
                      <span>Attribution metadata loading...</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PillarSection() {
  const pillars = [
    {
      icon: "📊",
      t: "Cost Explorer",
      d: "Slice spend by team, service, env, or commit. One-click PDF exports for finance reviews.",
    },
    {
      icon: "🚀",
      t: "Deploy Intelligence",
      d: "Every release inherits its exact cost delta. Know which teams ship efficiency.",
    },
    {
      icon: "🤖",
      t: "AI Root Cause",
      d: 'Ask "why did costs spike?" in plain English. Get a cited, audit-ready answer in seconds.',
    },
    {
      icon: "📈",
      t: "Forecasts & Budgets",
      d: "Predictive budgets rebuilt every hour from real engineering signals — not spreadsheets.",
    },
    {
      icon: "🔔",
      t: "Alerts & Workflows",
      d: "Route anomalies to Slack, PagerDuty, or Jira with full attribution attached.",
    },
    {
      icon: "🔒",
      t: "Governance",
      d: "RBAC, SSO, org-scoped API keys. SOC 2 Type II certified. GDPR-ready.",
    },
  ];
  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <div className="mb-12 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-mono text-xs tracking-widest uppercase text-primary">Platform</p>
          <h2 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-5xl">
            Every FinOps workflow,
            <br />
            covered out of the box.
          </h2>
        </div>
        <Link
          to="/platform"
          className="shrink-0 inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-muted"
        >
          See full platform →
        </Link>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {pillars.map((p) => (
          <div
            key={p.t}
            className="group rounded-xl border border-border bg-surface/60 p-6 transition-all duration-300 hover:border-primary/30 hover:bg-surface hover:-translate-y-0.5 hover:shadow-lg cursor-default"
          >
            <div className="text-2xl mb-4">{p.icon}</div>
            <h3 className="font-semibold text-[15px]">{p.t}</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{p.d}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function AISection() {
  const messages = [
    {
      role: "user",
      initials: "AK",
      name: "Alex Kim",
      text: "Why did payments-prod costs spike 142% on Tuesday afternoon?",
    },
    { role: "ai", text: null },
  ];
  return (
    <section className="relative overflow-hidden border-y border-border/60 py-24">
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-50" aria-hidden />
      <div className="relative mx-auto max-w-7xl px-6">
        <div className="grid items-center gap-14 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <p className="font-mono text-xs tracking-widest uppercase text-primary">AI Insights</p>
            <h2 className="mt-4 font-display text-4xl font-bold tracking-tight md:text-5xl">
              Ask in plain English.
              <br />
              <span className="text-muted-foreground">Get audit-ready answers.</span>
            </h2>
            <p className="mt-5 max-w-lg text-muted-foreground leading-relaxed">
              Meridian's AI investigates anomalies with the same context a senior SRE would have —
              deploys, metrics, code diffs — and returns a cited, written root cause.
            </p>
            <ul className="mt-7 space-y-3">
              {[
                "Knows your deploy history, not just your metrics",
                "Cites specific PRs, authors, and line changes",
                "Generates shareable investigation reports",
              ].map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm">
                  <span className="h-5 w-5 rounded-full bg-primary/15 flex items-center justify-center text-primary text-xs flex-shrink-0">
                    ✓
                  </span>
                  <span className="text-foreground/80">{f}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Chat client mockup */}
          <div className="card-elev overflow-hidden shadow-2xl hover:shadow-primary/10 transition-all duration-500">
            <div className="flex items-center justify-between border-b border-border bg-surface/80 px-5 py-3">
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-primary/80 to-accent/80 flex items-center justify-center text-primary-foreground text-[10px] font-bold">
                  M
                </div>
                <div>
                  <div className="text-[13px] font-semibold">Meridian AI</div>
                  <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    online · investigation #4021
                  </div>
                </div>
              </div>
              <div className="font-mono text-[10px] text-muted-foreground">Tue 09:33 AM</div>
            </div>

            <div className="space-y-5 p-5 bg-background/40">
              {/* User message */}
              <div className="flex items-start gap-3 justify-end">
                <div className="max-w-[75%]">
                  <div className="rounded-2xl rounded-tr-sm bg-primary px-4 py-2.5 text-[13px] text-primary-foreground">
                    Why did payments-prod costs spike 142% on Tuesday afternoon?
                  </div>
                  <div className="mt-1 text-right text-[10px] text-muted-foreground">
                    Alex Kim · 09:31 AM
                  </div>
                </div>
                <div className="h-8 w-8 shrink-0 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white text-[11px] font-bold">
                  AK
                </div>
              </div>

              {/* AI response */}
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 shrink-0 rounded-full bg-gradient-to-br from-primary/80 to-accent/80 flex items-center justify-center text-primary-foreground text-[11px] font-bold">
                  M
                </div>
                <div className="max-w-[85%]">
                  <div className="rounded-2xl rounded-tl-sm border border-border bg-surface px-4 py-3 text-[13px] text-foreground/90 leading-relaxed">
                    <p>
                      Between{" "}
                      <span className="font-mono text-[12px] bg-muted px-1.5 py-0.5 rounded">
                        14:02–16:44 UTC
                      </span>
                      , EKS <span className="font-semibold">payments-prod</span> spend rose{" "}
                      <span className="text-danger font-bold">+142%</span>.
                    </p>
                    <p className="mt-2">
                      Root cause: <span className="font-semibold">PR #3018</span> introduced a
                      retry-loop in{" "}
                      <span className="font-mono text-[12px] bg-muted px-1.5 py-0.5 rounded">
                        stripe-adapter v1.9.3
                      </span>{" "}
                      that made 40× more API calls under load.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {["PR #3018", "+142% EKS spend", "stripe-adapter", "3 affected services"].map(
                        (t) => (
                          <span
                            key={t}
                            className="rounded-full border border-primary/25 bg-primary/8 px-2.5 py-0.5 font-mono text-[10px] text-primary"
                          >
                            {t}
                          </span>
                        ),
                      )}
                    </div>
                  </div>
                  <div className="mt-1 text-[10px] text-muted-foreground">
                    Meridian AI · 09:33 AM · based on 47 signals
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-border bg-surface/60 px-4 py-3 flex items-center gap-3">
              <div className="flex-1 rounded-xl border border-border bg-background px-4 py-2 text-[12px] text-muted-foreground">
                Ask about any spike, service, or PR...
              </div>
              <button className="rounded-xl bg-primary px-4 py-2 text-[12px] font-semibold text-primary-foreground">
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function StatsBand() {
  const stats = [
    { k: "90%+", v: "Cost attribution accuracy" },
    { k: "80%", v: "Faster spike investigations" },
    { k: "<2s", v: "Dashboard load time" },
    { k: "99.95%", v: "Platform uptime SLA" },
  ];
  return (
    <section className="border-y border-border/60 bg-surface/40">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px overflow-hidden md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.v} className="bg-background p-10 text-center">
            <div className="font-display text-4xl font-semibold text-primary md:text-5xl">
              {s.k}
            </div>
            <div className="mono-eyebrow mt-3">{s.v}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function IntegrationsGrid() {
  const all = [
    { name: "AWS", cat: "Cloud" },
    { name: "GCP", cat: "Cloud" },
    { name: "Azure", cat: "Cloud" },
    { name: "GitHub", cat: "CI/CD" },
    { name: "GitLab", cat: "CI/CD" },
    { name: "Jenkins", cat: "CI/CD" },
    { name: "Datadog", cat: "Observability" },
    { name: "Prometheus", cat: "Observability" },
    { name: "Grafana", cat: "Observability" },
    { name: "Slack", cat: "Alerts" },
    { name: "PagerDuty", cat: "Alerts" },
    { name: "Jira", cat: "Alerts" },
    { name: "ArgoCD", cat: "CI/CD" },
    { name: "New Relic", cat: "Observability" },
    { name: "CircleCI", cat: "CI/CD" },
  ];
  const catColors: Record<string, string> = {
    Cloud: "border-blue-400/30 bg-blue-400/8 text-blue-600 dark:text-blue-400",
    "CI/CD": "border-violet-400/30 bg-violet-400/8 text-violet-600 dark:text-violet-400",
    Observability: "border-amber-400/30 bg-amber-400/8 text-amber-600 dark:text-amber-400",
    Alerts: "border-green-400/30 bg-green-400/8 text-green-600 dark:text-green-400",
  };
  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <div className="mb-12 text-center">
        <p className="font-mono text-xs tracking-widest uppercase text-primary">Integrations</p>
        <h2 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-5xl">
          Wired into your stack,
          <br />
          on day one.
        </h2>
        <p className="mt-4 text-muted-foreground">
          No custom connectors. No professional services. Just{" "}
          <span className="font-mono text-foreground">npx @meridian/cli connect aws</span> and
          you're live.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        {all.map(({ name, cat }) => (
          <div
            key={name}
            className={`group flex items-center gap-2.5 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-default ${catColors[cat]}`}
          >
            <span>{name}</span>
            <span className="rounded-full border border-current/20 bg-current/10 px-1.5 py-0.5 font-mono text-[9px] opacity-70">
              {cat}
            </span>
          </div>
        ))}
      </div>
      <p className="mt-8 text-center font-mono text-xs text-muted-foreground">
        + 40 more via REST webhooks & OpenTelemetry
      </p>
    </section>
  );
}

function CTASection() {
  return (
    <section className="relative overflow-hidden border-t border-border/60">
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-60" aria-hidden />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[400px]"
        style={{ background: "var(--gradient-hero)" }}
        aria-hidden
      />
      <div className="relative mx-auto max-w-4xl px-6 py-24 text-center">
        <h2 className="font-display text-4xl font-semibold tracking-tight md:text-6xl">
          Stop guessing what your cloud bill means.
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-muted-foreground">
          See Meridian on your own data in a 30-minute working session. Bring your last invoice.
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground ring-signal"
          >
            Book a demo <span aria-hidden>→</span>
          </Link>
          <Link
            to="/pricing"
            className="inline-flex items-center gap-2 rounded-md border border-border bg-surface/60 px-6 py-3 text-sm font-medium"
          >
            View pricing
          </Link>
        </div>
      </div>
    </section>
  );
}

function SectionHeader({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <span className="mono-eyebrow text-primary">{eyebrow}</span>
      <h2 className="mt-4 font-display text-4xl font-semibold tracking-tight md:text-5xl">
        {title}
      </h2>
      {sub && <p className="mx-auto mt-5 max-w-2xl text-muted-foreground">{sub}</p>}
    </div>
  );
}
