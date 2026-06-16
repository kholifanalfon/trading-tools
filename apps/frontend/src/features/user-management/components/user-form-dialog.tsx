import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateUserFormSchema, UpdateUserFormSchema } from "../user-management.schema";
import { User } from "../types/user-management.types";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Field, FieldGroup, FieldLabel } from "@/shared/components/ui/field";
import { ErrorDisplay } from "@/shared/components/ui/error-display";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";

export interface UserFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  user?: User | null;
  isLoading: boolean;
  error: unknown;
}

export function UserFormDialog({ isOpen, onClose, onSubmit, user, isLoading, error }: UserFormDialogProps) {
  const isEdit = !!user;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(isEdit ? UpdateUserFormSchema : CreateUserFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "user",
      isActive: true,
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (user) {
        reset({
          name: user.fullName,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
        });
      } else {
        reset({
          name: "",
          email: "",
          password: "",
          role: "user",
          isActive: true,
        });
      }
    }
  }, [isOpen, user, reset]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit User Record" : "Register New User"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Modify the selected user's details and active state below." : "Provide details to register a new user in the workspace."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <FieldGroup>
            <ErrorDisplay error={error} />

            {/* Name */}
            <Field>
              <FieldLabel htmlFor="name">Full Name</FieldLabel>
              <Input id="name" type="text" placeholder="John Doe" disabled={isLoading} {...register("name")} />
              {errors.name && <p className="text-xs text-destructive font-semibold mt-1">{errors.name.message as string}</p>}
            </Field>

            {/* Email */}
            <Field>
              <FieldLabel htmlFor="email">Email Address</FieldLabel>
              <Input id="email" type="email" placeholder="john@example.com" disabled={isLoading} {...register("email")} />
              {errors.email && <p className="text-xs text-destructive font-semibold mt-1">{errors.email.message as string}</p>}
            </Field>

            {/* Password - Only for Create */}
            {!isEdit && (
              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input id="password" type="password" placeholder="••••••••" disabled={isLoading} {...register("password")} />
                {errors.password && <p className="text-xs text-destructive font-semibold mt-1">{errors.password.message as string}</p>}
              </Field>
            )}

            {/* Role */}
            <Field>
              <FieldLabel htmlFor="role">System Role</FieldLabel>
              <select
                id="role"
                disabled={isLoading}
                {...register("role")}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 text-foreground"
              >
                <option value="user" className="bg-card text-foreground">
                  User
                </option>
                <option value="admin" className="bg-card text-foreground">
                  Admin
                </option>
              </select>
              {errors.role && <p className="text-xs text-destructive font-semibold mt-1">{errors.role.message as string}</p>}
            </Field>

            {/* Status - Only for Edit */}
            {isEdit && (
              <div className="flex items-center gap-3">
                <input id="isActive" type="checkbox" disabled={isLoading} {...register("isActive")} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                <FieldLabel htmlFor="isActive" className="cursor-pointer select-none">
                  Account Status: Active
                </FieldLabel>
              </div>
            )}
          </FieldGroup>

          {/* Footer buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button variant="outline" type="button" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving changes..." : isEdit ? "Save Changes" : "Create User"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
