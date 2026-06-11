import { z } from "zod";

export const ProfileSchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name must be at most 50 characters"),
  email: z.string().email("Invalid email address"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain alphanumeric characters and underscores"),
  avatar: z.string().optional(),
  bio: z.string().max(160, "Bio must be at most 160 characters").optional(),
});

export type ProfileInput = z.infer<typeof ProfileSchema>;
