import { Link, Outlet, createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { Cloud } from "lucide-react";
import { useMemo } from "react";

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

const AVATAR_COLORS = [
  "bg-red-500",
  "bg-orange-500",
  "bg-green-500",
  "bg-teal-500",
  "bg-blue-500",
  "bg-indigo-500",
  "bg-purple-500",
  "bg-pink-500",
];

function AppLayout() {
  const { user } = Route.useRouteContext();
  const router = useRouter();

  async function handleLogout() {
    await logoutFn();
    await router.invalidate();
    await router.navigate({ to: "/auth/login" });
  }

  const avatarColor = useMemo(() => {
    let hash = 0;
    for (let i = 0; i < user.email.length; i++) {
      hash = user.email.charCodeAt(i) + ((hash << 5) - hash);
    }
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
  }, [user.email]);

  const initial = user.email.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur sticky top-0 z-50">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-6">
            <Link
              to="/app"
              className="font-display text-lg font-bold tracking-tight flex items-center gap-2"
            >
              <Cloud className="h-6 w-6 text-primary" />
              CloudLens AI
            </Link>
            <nav className="hidden items-center gap-4 text-sm md:flex">
              <Link
                to="/app"
                activeOptions={{ exact: true }}
                className="text-muted-foreground transition-all hover:text-foreground px-3 py-1.5 rounded-md"
                activeProps={{
                  className: "text-foreground font-medium bg-primary/10 text-primary",
                }}
              >
                Dashboard
              </Link>
              <Link
                to="/app/organizations"
                className="text-muted-foreground transition-all hover:text-foreground px-3 py-1.5 rounded-md"
                activeProps={{
                  className: "text-foreground font-medium bg-primary/10 text-primary",
                }}
              >
                Organizations
              </Link>
              <Link
                to="/app/projects"
                className="text-muted-foreground transition-all hover:text-foreground px-3 py-1.5 rounded-md"
                activeProps={{
                  className: "text-foreground font-medium bg-primary/10 text-primary",
                }}
              >
                Projects
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold text-white ${avatarColor}`}
              title={user.email}
            >
              {initial}
            </div>
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
