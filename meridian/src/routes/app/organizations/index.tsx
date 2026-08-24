import { useState } from "react";
import { createFileRoute, useRouter } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createOrganizationFn, listOrganizationsFn } from "@/server/app.functions";

export const Route = createFileRoute("/app/organizations/")({
  loader: () => listOrganizationsFn(),
  component: OrganizationsPage,
});

function OrganizationsPage() {
  const organizations = Route.useLoaderData();
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setPending(true);
    try {
      await createOrganizationFn({ data: { name } });
      setName("");
      await router.invalidate();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create organization");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Organizations</h1>
        <p className="mt-2 text-muted-foreground">Group projects under your team or company.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Create organization</CardTitle>
            <CardDescription>Each organization can contain multiple projects.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="org-name">Name</Label>
                <Input
                  id="org-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Acme Engineering"
                  required
                />
              </div>
              {error ? <p className="text-sm text-destructive">{error}</p> : null}
              <Button type="submit" disabled={pending || !name.trim()}>
                {pending ? "Creating..." : "Create organization"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {organizations.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-muted-foreground">
                No organizations yet. Create your first one to get started.
              </CardContent>
            </Card>
          ) : (
            organizations.map((org) => (
              <Card key={org.id}>
                <CardHeader>
                  <CardTitle>{org.name}</CardTitle>
                  <CardDescription>
                    {org._count.projects} project{org._count.projects === 1 ? "" : "s"}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
