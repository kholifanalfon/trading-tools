import { z } from "zod";

export const CreateUserFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().min(1, { message: "Email is required" }).email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  role: z.enum(["user", "admin"]),
});

export const UpdateUserFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().min(1, { message: "Email is required" }).email({ message: "Invalid email address" }),
  role: z.enum(["user", "admin"]),
  isActive: z.boolean(),
});

export type CreateUserFormInput = z.infer<typeof CreateUserFormSchema>;
export type UpdateUserFormInput = z.infer<typeof UpdateUserFormSchema>;
