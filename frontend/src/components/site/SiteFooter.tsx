import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-background">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground font-mono text-[13px] font-bold">◈</span>
              <span className="font-display text-[15px] font-semibold">Meridian<span className="text-primary">.</span></span>
            </div>
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              Cost attribution and deployment intelligence for engineering-driven organizations.
            </p>
            <p className="mono-eyebrow mt-6">SOC 2 · ISO 27001 · GDPR</p>
          </div>

          <FooterCol
            heading="Product"
            items={[
              { to: "/platform", label: "Platform" },
              { to: "/solutions", label: "Solutions" },
              { to: "/pricing", label: "Pricing" },
            ]}
          />
          <FooterCol
            heading="Company"
            items={[
              { to: "/company", label: "About" },
              { to: "/contact", label: "Contact" },
              { to: "/company", label: "Security" },
            ]}
          />
          <FooterCol
            heading="Resources"
            items={[
              { to: "/platform", label: "Documentation" },
              { to: "/platform", label: "Changelog" },
              { to: "/platform", label: "API reference" },
            ]}
          />
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-3 border-t border-border/60 pt-6 text-xs text-muted-foreground md:flex-row md:items-center">
          <p>© {new Date().getFullYear()} Meridian FinOps, Inc. All rights reserved.</p>
          <p className="font-mono">v2.0 · build.a7f3c</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  heading,
  items,
}: {
  heading: string;
  items: { to: string; label: string }[];
}) {
  return (
    <div>
      <h4 className="mono-eyebrow mb-4">{heading}</h4>
      <ul className="space-y-2.5 text-sm">
        {items.map((i, idx) => (
          <li key={idx}>
            <Link to={i.to} className="text-muted-foreground transition-colors hover:text-foreground">
              {i.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
