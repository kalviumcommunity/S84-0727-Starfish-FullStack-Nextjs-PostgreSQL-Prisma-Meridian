import { Link } from "@tanstack/react-router";
import { ThemeToggle } from "./ThemeToggle";

const links = [
  { to: "/platform", label: "Platform" },
  { to: "/solutions", label: "Solutions" },
  { to: "/pricing", label: "Pricing" },
  { to: "/company", label: "Company" },
] as const;

export function SiteNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="relative inline-flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <span className="font-mono text-[13px] font-bold">◈</span>
          </span>
          <span className="font-display text-[15px] font-semibold tracking-tight">
            Meridian<span className="text-primary">.</span>
          </span>
          <span className="mono-eyebrow ml-2 hidden sm:inline">FinOps Intelligence</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground [&.active]:text-foreground"
              activeProps={{ className: "active" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            to="/contact"
            className="hidden rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
          >
            Sign in
          </Link>
          <Link
            to="/contact"
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3.5 py-1.5 text-sm font-medium text-primary-foreground transition-transform hover:-translate-y-px"
          >
            Book a demo <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
