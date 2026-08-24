import { createFileRoute, redirect, Outlet, Link, useRouter } from "@tanstack/react-router";
import { getMeFn, logoutFn } from "@/server/app.functions";
import { LogOut, LayoutDashboard, Users, Building2, ShieldAlert, FolderKanban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export const Route = createFileRoute("/admin")({
  beforeLoad: async () => {
    const user = await getMeFn();
    if (!user) {
      throw redirect({ to: "/auth/login" });
    }
    if (user.role !== "ADMIN") {
      throw redirect({ to: "/app" });
    }
    return { user };
  },
  component: AdminLayout,
});

function AdminLayout() {
  const { user } = Route.useRouteContext();
  const router = useRouter();

  async function handleLogout() {
    await logoutFn();
    router.invalidate();
    window.location.href = "/auth/login";
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Sidebar */}
      <aside className="hidden w-64 border-r bg-slate-900 text-slate-300 md:block">
        <div className="flex h-14 items-center border-b border-slate-800 px-4">
          <Link to="/admin" className="flex items-center gap-2 font-display font-semibold text-white">
            <ShieldAlert className="h-5 w-5 text-red-500" />
            <span>Meridian Admin</span>
          </Link>
        </div>
        
        <nav className="flex-1 space-y-1 p-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4 mt-2">
            Platform
          </div>
          
          <Link
            to="/admin"
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-slate-800 hover:text-white"
            activeProps={{ className: "bg-slate-800 text-white" }}
            activeOptions={{ exact: true }}
          >
            <LayoutDashboard className="h-4 w-4" />
            Overview
          </Link>
          <Link
            to="/admin/users"
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-slate-800 hover:text-white"
            activeProps={{ className: "bg-slate-800 text-white" }}
          >
            <Users className="h-4 w-4" />
            Users
          </Link>
          <Link
            to="/admin/organizations"
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-slate-800 hover:text-white"
            activeProps={{ className: "bg-slate-800 text-white" }}
          >
            <Building2 className="h-4 w-4" />
            Organizations
          </Link>
          <Link
            to="/admin/projects"
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-slate-800 hover:text-white"
            activeProps={{ className: "bg-slate-800 text-white" }}
          >
            <FolderKanban className="h-4 w-4" />
            Projects
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b bg-background px-4 lg:px-6 shadow-sm">
          <div className="flex items-center gap-2">
            <Badge variant="destructive" className="md:hidden">Admin</Badge>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild className="hidden md:inline-flex">
              <Link to="/app">Exit Admin</Link>
            </Button>
            
            <div className="flex items-center gap-3 border-l pl-4">
              <Avatar className="h-8 w-8 ring-2 ring-red-500/20">
                <AvatarFallback className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">
                  {user.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="hidden flex-col md:flex">
                <span className="text-sm font-medium">{user.name}</span>
                <span className="text-xs text-muted-foreground">{user.email}</span>
              </div>
              <Button variant="ghost" size="icon" onClick={handleLogout} className="ml-2">
                <LogOut className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                <span className="sr-only">Log out</span>
              </Button>
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

import { Badge } from "@/components/ui/badge";
