import { createFileRoute } from "@tanstack/react-router";
import { listAllUsersFn, updateUserRoleFn, deleteUserFn } from "@/server/admin.functions";
import { useState } from "react";
import { Loader2, Trash2, ShieldAlert, Shield, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

export const Route = createFileRoute("/admin/users")({
  loader: async () => {
    return listAllUsersFn();
  },
  pendingComponent: () => (
    <div className="flex h-[50vh] flex-col items-center justify-center space-y-4">
      <Loader2 className="h-8 w-8 animate-spin text-red-500" />
      <p className="text-sm text-muted-foreground animate-pulse">Loading users...</p>
    </div>
  ),
  component: AdminUsersPage,
});

function AdminUsersPage() {
  const initialUsers = Route.useLoaderData();
  const [users, setUsers] = useState(initialUsers);

  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleRoleChange(userId: string, newRole: "ADMIN" | "USER") {
    try {
      const res = await updateUserRoleFn({ data: { userId, role: newRole } });
      if (res.success) {
        setUsers(users.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
        toast.success(`User role updated to ${newRole}`);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update role");
    }
  }

  async function handleDeleteConfirm() {
    if (!userToDelete) return;
    setIsDeleting(true);
    try {
      const res = await deleteUserFn({ data: { userId: userToDelete } });
      if (res.success) {
        setUsers(users.filter((u) => u.id !== userToDelete));
        toast.success("User deleted successfully");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to delete user");
    } finally {
      setIsDeleting(false);
      setUserToDelete(null);
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground mt-1">
          Manage platform users, assign roles, and handle access control.
        </p>
      </div>

      <div className="border rounded-md bg-card">
        <Table>
          <Header>
            <Row>
              <Head>Name</Head>
              <Head>Email</Head>
              <Head>Role</Head>
              <Head>Organizations</Head>
              <Head>Joined</Head>
              <Head className="w-[80px]"></Head>
            </Row>
          </Header>
          <Body>
            {users.map((user) => (
              <Row key={user.id}>
                <Cell className="font-medium">{user.name}</Cell>
                <Cell>{user.email}</Cell>
                <Cell>
                  {user.role === "ADMIN" ? (
                    <Badge
                      variant="destructive"
                      className="gap-1 bg-red-100 text-red-700 hover:bg-red-200 border-red-200"
                    >
                      <ShieldAlert className="h-3 w-3" />
                      Super Admin
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="gap-1">
                      <Shield className="h-3 w-3" />
                      User
                    </Badge>
                  )}
                </Cell>
                <Cell>{user.orgCount}</Cell>
                <Cell>{new Date(user.createdAt).toLocaleDateString()}</Cell>
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

                      {user.role === "USER" ? (
                        <DropdownMenuItem onClick={() => handleRoleChange(user.id, "ADMIN")}>
                          Promote to Admin
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem onClick={() => handleRoleChange(user.id, "USER")}>
                          Demote to User
                        </DropdownMenuItem>
                      )}

                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => setUserToDelete(user.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete User
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </Cell>
              </Row>
            ))}
            {users.length === 0 && (
              <Row>
                <Cell colSpan={6} className="text-center py-6 text-muted-foreground">
                  No users found.
                </Cell>
              </Row>
            )}
          </Body>
        </Table>
      </div>

      <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user account and remove
              their data from our servers.
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
              {isDeleting ? "Deleting..." : "Delete Account"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
