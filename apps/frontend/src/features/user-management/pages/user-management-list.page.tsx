import { useState, useEffect } from "react";
import { useGetUsers } from "../hooks/use-get-users";
import { useCreateUser } from "../hooks/use-create-user";
import { useUpdateUser } from "../hooks/use-update-user";
import { useDeleteUser } from "../hooks/use-delete-user";
import { UserTable } from "../components/user-table";
import { UserFormDialog } from "../components/user-form-dialog";
import { User } from "../types/user-management.types";

export function UserManagementListPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset page to 1 when search query changes
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  // TanStack Query & Mutations
  const { data, isLoading } = useGetUsers({
    page,
    limit: 10,
    search: debouncedSearch || undefined,
  });

  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();

  const handleAddClick = () => {
    setSelectedUser(null);
    setIsDialogOpen(true);
  };

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setIsDialogOpen(true);
  };

  const handleDeleteClick = async (user: User) => {
    if (confirm(`Are you sure you want to delete user ${user.fullName}?`)) {
      try {
        await deleteUserMutation.mutateAsync(user.id);
      } catch (err) {
        console.error("Failed to delete user:", err);
      }
    }
  };

  const handleFormSubmit = async (formData: any) => {
    try {
      if (selectedUser) {
        await updateUserMutation.mutateAsync({
          id: selectedUser.id,
          data: formData,
        });
      } else {
        await createUserMutation.mutateAsync(formData);
      }
      setIsDialogOpen(false);
    } catch (err) {
      console.error("Form submit failed:", err);
    }
  };

  const activeMutation = selectedUser ? updateUserMutation : createUserMutation;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">User Management</h1>
        <p className="text-sm text-muted-foreground">
          View, register, modify, and delete user profiles within the workspace.
        </p>
      </div>

      <UserTable
        users={data?.items || []}
        total={data?.total || 0}
        page={page}
        totalPages={data?.totalPages || 1}
        search={search}
        onSearchChange={setSearch}
        onPageChange={setPage}
        onAddClick={handleAddClick}
        onEditClick={handleEditClick}
        onDeleteClick={handleDeleteClick}
        isLoading={isLoading}
      />

      <UserFormDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSubmit={handleFormSubmit}
        user={selectedUser}
        isLoading={activeMutation.isPending}
        error={activeMutation.error}
      />
    </div>
  );
}
