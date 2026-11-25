import { z } from "zod";

const passwordPolicy = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .max(128, "Password must be 128 characters or fewer.")
  .refine(
    (val) => /[A-Za-z]/.test(val) && /\d/.test(val),
    "Password must include at least one letter and one number."
  );

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, "Full name must be at least 2 characters.")
      .max(120, "Full name is too long."),
    email: z.string().trim().email("Please enter a valid email address.").max(160),
    companyName: z.string().trim().max(120).optional().or(z.literal("")),
    password: passwordPolicy,
    confirmPassword: z.string().min(1, "Please confirm your password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address.").max(160),
  password: z.string().min(1, "Password is required.").max(128),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address.").max(160),
});

export const resetPasswordSchema = z
  .object({
    password: passwordPolicy,
    confirmPassword: z.string().min(1, "Please confirm your new password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const updateProfileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters.")
    .max(120, "Full name is too long."),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  companyName: z.string().trim().max(120).optional().or(z.literal("")),
  jobTitle: z.string().trim().max(120).optional().or(z.literal("")),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

