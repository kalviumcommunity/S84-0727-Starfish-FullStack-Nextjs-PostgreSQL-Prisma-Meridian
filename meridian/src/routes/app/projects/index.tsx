import { useState } from "react";
import { createFileRoute, useRouter, Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createProjectFn, listOrganizationsFn, listProjectsFn } from "@/server/app.functions";

export const Route = createFileRoute("/app/projects/")({
  loader: async () => {
    const [organizations, projects] = await Promise.all([listOrganizationsFn(), listProjectsFn()]);
    return { organizations, projects };
  },
  component: ProjectsPage,
});

function ProjectsPage() {
  const { organizations, projects } = Route.useLoaderData();
  const router = useRouter();
  const [organizationId, setOrganizationId] = useState(organizations[0]?.id ?? "");
  const [name, setName] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setPending(true);
    try {
      await createProjectFn({
        data: {
          organizationId,
          name,
          githubUrl: githubUrl || undefined,
        },
      });
      setName("");
      setGithubUrl("");
      await router.invalidate();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create project");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Projects</h1>
        <p className="mt-2 text-muted-foreground">
          Link a repository to prepare for deployment correlation.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Create project</CardTitle>
            <CardDescription>
              {organizations.length === 0
                ? "Create an organization first."
                : "Add a project under an organization."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label>Organization</Label>
                <Select
                  value={organizationId}
                  onValueChange={setOrganizationId}
                  disabled={organizations.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select organization" />
                  </SelectTrigger>
                  <SelectContent>
                    {organizations.map((org) => (
                      <SelectItem key={org.id} value={org.id}>
                        {org.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="project-name">Project name</Label>
                <Input
                  id="project-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Payments API"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="github-url">GitHub URL (optional)</Label>
                <Input
                  id="github-url"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/org/repo"
                  type="url"
                />
              </div>
              {error ? <p className="text-sm text-destructive">{error}</p> : null}
              <Button
                type="submit"
                disabled={pending || !name.trim() || !organizationId || organizations.length === 0}
              >
                {pending ? "Creating..." : "Create project"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {projects.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-muted-foreground">
                No projects yet. Create one after setting up an organization.
              </CardContent>
            </Card>
          ) : (
            projects.map((project) => (
              <Link key={project.id} to="/app/projects/$id" params={{ id: project.id }}>
                <Card className="transition-all hover:border-primary/50 hover:shadow-md cursor-pointer">
                  <CardHeader>
                    <CardTitle>{project.name}</CardTitle>
                    <CardDescription>
                      {project.organization.name}
                      {project.githubUrl ? ` · ${project.githubUrl}` : ""}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex gap-6 text-sm">
                    <div>
                      <span className="text-muted-foreground">Deployments: </span>
                      <span className="font-semibold">{project._count.deployments}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Billing: </span>
                      <span className="font-semibold">{project._count.billingRecords}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Insights: </span>
                      <span className="font-semibold">{project._count.insights}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
