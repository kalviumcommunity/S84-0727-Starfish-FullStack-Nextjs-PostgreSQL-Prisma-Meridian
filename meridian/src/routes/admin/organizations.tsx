import { createFileRoute } from "@tanstack/react-router";
import { listAllOrganizationsFn, deleteOrganizationFn } from "@/server/admin.functions";
import { useState } from "react";
import { Loader2, Trash2, Building2, MoreVertical, DollarSign } from "lucide-react";
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

export const Route = createFileRoute("/admin/organizations")({
  loader: async () => {
    return listAllOrganizationsFn();
  },
  pendingComponent: () => (
    <div className="flex h-[50vh] flex-col items-center justify-center space-y-4">
      <Loader2 className="h-8 w-8 animate-spin text-red-500" />
      <p className="text-sm text-muted-foreground animate-pulse">Loading organizations...</p>
    </div>
  ),
  component: AdminOrgsPage,
});

function AdminOrgsPage() {
  const initialOrgs = Route.useLoaderData();
  const [orgs, setOrgs] = useState(initialOrgs);

  const [orgToDelete, setOrgToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDeleteConfirm() {
    if (!orgToDelete) return;
    setIsDeleting(true);
    try {
      const res = await deleteOrganizationFn({ data: { orgId: orgToDelete } });
      if (res.success) {
        setOrgs(orgs.filter((o) => o.id !== orgToDelete));
        toast.success("Organization deleted successfully");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to delete organization");
    } finally {
      setIsDeleting(false);
      setOrgToDelete(null);
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Organization Governance</h1>
        <p className="text-muted-foreground mt-1">
          Monitor workspaces, project limits, and cloud spend.
        </p>
      </div>

      <div className="border rounded-md bg-card">
        <Table>
          <Header>
            <Row>
              <Head>Organization Name</Head>
              <Head>Owner</Head>
              <Head>Projects</Head>
              <Head>Total Tracked Spend</Head>
              <Head>Created</Head>
              <Head className="w-[80px]"></Head>
            </Row>
          </Header>
          <Body>
            {orgs.map((org) => (
              <Row key={org.id}>
                <Cell className="font-medium">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    {org.name}
                  </div>
                </Cell>
                <Cell>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{org.owner.name}</span>
                    <span className="text-xs text-muted-foreground">{org.owner.email}</span>
                  </div>
                </Cell>
                <Cell>{org.projectCount}</Cell>
                <Cell>
                  <div className="flex items-center gap-1 font-semibold">
                    <DollarSign className="h-3 w-3 text-muted-foreground" />
                    {org.totalSpend.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </div>
                </Cell>
                <Cell>{new Date(org.createdAt).toLocaleDateString()}</Cell>
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
                        onClick={() => setOrgToDelete(org.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Organization
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </Cell>
              </Row>
            ))}
            {orgs.length === 0 && (
              <Row>
                <Cell colSpan={6} className="text-center py-6 text-muted-foreground">
                  No organizations found.
                </Cell>
              </Row>
            )}
          </Body>
        </Table>
      </div>

      <AlertDialog open={!!orgToDelete} onOpenChange={(open) => !open && setOrgToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the organization, all of
              its projects, billing records, deployments, and insights.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDeleteConfirm();
              }}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete Organization"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
