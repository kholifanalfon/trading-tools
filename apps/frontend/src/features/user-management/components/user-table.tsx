import { User } from "../types/user-management.types";
import { Edit2Icon, Trash2Icon, UserPlusIcon, SearchIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";

export interface UserTableProps {
  users: User[];
  total: number;
  page: number;
  totalPages: number;
  search: string;
  onSearchChange: (search: string) => void;
  onPageChange: (page: number) => void;
  onAddClick: () => void;
  onEditClick: (user: User) => void;
  onDeleteClick: (user: User) => void;
  isLoading: boolean;
}

export function UserTable({
  users,
  total,
  page,
  totalPages,
  search,
  onSearchChange,
  onPageChange,
  onAddClick,
  onEditClick,
  onDeleteClick,
  isLoading,
}: UserTableProps) {
  return (
    <div className="space-y-4">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="relative flex-1 max-w-xs">
          <SearchIcon className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search name or email..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8 h-8 text-xs"
          />
        </div>
        <Button onClick={onAddClick} className="flex items-center gap-1.5 h-8 text-xs px-3">
          <UserPlusIcon className="h-3.5 w-3.5" />
          Add User
        </Button>
      </div>

      {/* Table Card Container */}
      <div className="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead className="h-8 px-4 text-xs font-semibold">Name</TableHead>
              <TableHead className="h-8 px-4 text-xs font-semibold">Email</TableHead>
              <TableHead className="h-8 px-4 text-xs font-semibold">Role</TableHead>
              <TableHead className="h-8 px-4 text-xs font-semibold">Status</TableHead>
              <TableHead className="h-8 px-4 text-xs font-semibold">Created At</TableHead>
              <TableHead className="h-8 px-4 text-xs font-semibold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-xs text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-1.5">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    <span>Loading...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-xs text-muted-foreground">
                  No records found.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id} className="hover:bg-muted/20">
                  <TableCell className="py-2 px-4 font-medium text-xs text-foreground">{user.fullName}</TableCell>
                  <TableCell className="py-2 px-4 text-xs text-muted-foreground">{user.email}</TableCell>
                  <TableCell className="py-2 px-4">
                    <Badge variant={user.role === "admin" ? "indigo" : "outline"} className="text-[10px] px-1.5 py-0">
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-2 px-4">
                    <Badge variant={user.isActive ? "emerald" : "destructive"} className="text-[10px] px-1.5 py-0">
                      {user.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-2 px-4 text-xs text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="py-2 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditClick(user)}
                        className="h-7 w-7 p-0"
                        title="Edit User"
                      >
                        <Edit2Icon className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteClick(user)}
                        className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                        title="Delete User"
                      >
                        <Trash2Icon className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination Info Footer */}
        {!isLoading && totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border px-4 py-2 bg-muted/5">
            <span className="text-[10px] text-muted-foreground">
              Page {page} of {totalPages} ({total} users)
            </span>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(page - 1)}
                disabled={page === 1}
                className="h-7 px-2 text-xs"
              >
                <ChevronLeftIcon className="h-3 w-3 mr-0.5" />
                Prev
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(page + 1)}
                disabled={page === totalPages}
                className="h-7 px-2 text-xs"
              >
                Next
                <ChevronRightIcon className="h-3 w-3 ml-0.5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
