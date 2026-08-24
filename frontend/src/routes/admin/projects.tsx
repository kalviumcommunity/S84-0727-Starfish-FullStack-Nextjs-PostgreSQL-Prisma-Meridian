import { createFileRoute } from "@tanstack/react-router";
import { listAllProjectsFn, deleteProjectAdminFn } from "@/server/admin.functions";
import { useState } from "react";
import { Loader2, Trash2, FolderKanban, MoreVertical, DollarSign, Activity, Github, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody as Body,
  TableCell as Cell,
  TableHead as Head,
  TableHeader as Header,
  TableRow as Row,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/admin/projects")({
  loader: async () => {
    return listAllProjectsFn();
  },
  pendingComponent: () => (
    <div className="flex h-[50vh] flex-col items-center justify-center space-y-4">
      <Loader2 className="h-8 w-8 animate-spin text-red-500" />
      <p className="text-sm text-muted-foreground animate-pulse">Loading projects...</p>
    </div>
  ),
  component: AdminProjectsPage,
});

function AdminProjectsPage() {
  const initialProjects = Route.useLoaderData();
  const [projects, setProjects] = useState(initialProjects);
  
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDeleteConfirm() {
    if (!projectToDelete) return;
    setIsDeleting(true);
    try {
      const res = await deleteProjectAdminFn({ data: { projectId: projectToDelete } });
      if (res.success) {
        setProjects(projects.filter(p => p.id !== projectToDelete));
        toast.success("Project deleted successfully");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to delete project");
    } finally {
      setIsDeleting(false);
      setProjectToDelete(null);
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Project Governance</h1>
        <p className="text-muted-foreground mt-1">
          Monitor all repositories, their deployments, and associated cloud costs.
        </p>
      </div>

      <div className="border rounded-md bg-card">
        <Table>
          <Header>
            <Row>
              <Head>Project Name</Head>
              <Head>Organization</Head>
              <Head>Total Cost</Head>
              <Head>Deployments</Head>
              <Head>AI Insights</Head>
              <Head>Created</Head>
              <Head className="w-[80px]"></Head>
            </Row>
          </Header>
          <Body>
            {projects.map((project) => (
              <Row key={project.id}>
                <Cell className="font-medium">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <FolderKanban className="h-4 w-4 text-muted-foreground" />
                      <span>{project.name}</span>
                    </div>
                    {project.githubUrl && (
                      <a 
                        href={project.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-muted-foreground flex items-center gap-1 hover:text-foreground mt-1 ml-6"
                      >
                        <Github className="h-3 w-3" />
                        {project.githubUrl.replace("https://github.com/", "")}
                      </a>
                    )}
                  </div>
                </Cell>
                <Cell>
                  <Badge variant="outline" className="bg-slate-50 dark:bg-slate-900">
                    {project.organizationName}
                  </Badge>
                </Cell>
                <Cell>
                  <div className="flex items-center gap-1 font-semibold">
                    <DollarSign className="h-3 w-3 text-muted-foreground" />
                    {project.totalSpend.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </div>
                </Cell>
                <Cell>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Activity className="h-3 w-3" />
                    {project.deploymentsCount}
                  </div>
                </Cell>
                <Cell>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Brain className="h-3 w-3" />
                    {project.insightsCount}
                  </div>
                </Cell>
                <Cell>{new Date(project.createdAt).toLocaleDateString('en-US')}</Cell>
                <Cell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      
                      <DropdownMenuItem 
                        className="text-destructive focus:text-destructive"
                        onClick={() => setProjectToDelete(project.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Project
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </Cell>
              </Row>
            ))}
            {projects.length === 0 && (
              <Row>
                <Cell colSpan={7} className="text-center py-6 text-muted-foreground">
                  No projects found.
                </Cell>
              </Row>
            )}
          </Body>
        </Table>
      </div>

      <AlertDialog open={!!projectToDelete} onOpenChange={(open) => !open && setProjectToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the project,
              all of its billing records, deployments, and insights.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => { e.preventDefault(); handleDeleteConfirm(); }}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete Project"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
