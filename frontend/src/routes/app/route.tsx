import { Link, Outlet, createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { Cloud } from "lucide-react";

import { Button } from "@/components/ui/button";
import { logoutFn } from "@/server/app.functions";

export const Route = createFileRoute("/app")({
  beforeLoad: async () => {
    const { getMeFn } = await import("@/server/app.functions");
    const user = await getMeFn();
    if (!user) {
      throw redirect({ to: "/auth/login" });
    }
    return { user };
  },
  component: AppLayout,
});

function AppLayout() {
  const { user } = Route.useRouteContext();
  const router = useRouter();

  async function handleLogout() {
    await logoutFn();
    await router.invalidate();
    await router.navigate({ to: "/auth/login" });
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur sticky top-0 z-50">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-6">
            <Link to="/app" className="font-display text-lg font-bold tracking-tight flex items-center gap-2">
              <Cloud className="h-6 w-6 text-primary" />
              CloudLens AI
            </Link>
            <nav className="hidden items-center gap-4 text-sm md:flex">
              <Link
                to="/app"
                className="text-muted-foreground transition-colors hover:text-foreground"
                activeProps={{ className: "text-foreground font-medium" }}
              >
                Dashboard
              </Link>
              <Link
                to="/app/organizations"
                className="text-muted-foreground transition-colors hover:text-foreground"
                activeProps={{ className: "text-foreground font-medium" }}
              >
                Organizations
              </Link>
              <Link
                to="/app/projects"
                className="text-muted-foreground transition-colors hover:text-foreground"
                activeProps={{ className: "text-foreground font-medium" }}
              >
                Projects
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-muted-foreground sm:inline">{user.email}</span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Log out
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
