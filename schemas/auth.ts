// /schemas/auth.ts
import * as z from "zod";

// Login form validation
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Register form validation (if you have a register page)
export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6),
  role: z.enum(["admin", "developer", "qa", "superadmin"] as const, "Role must be admin, developer, qa, or superadmin"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords must match",
  path: ["confirmPassword"],
});

// Type inference for TypeScript
export type LoginFormInputs = z.infer<typeof loginSchema>;
export type RegisterFormInputs = z.infer<typeof registerSchema>;
