import { z } from "zod";

export const contactEnquirySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Please enter your full name (at least 2 characters).")
    .max(120, "Name must be 120 characters or fewer."),
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address.")
    .max(160, "Email address is too long."),
  phone: z
    .string()
    .trim()
    .max(30, "Phone number must be 30 characters or fewer.")
    .optional()
    .or(z.literal("")),
  company: z
    .string()
    .trim()
    .max(120, "Company name must be 120 characters or fewer.")
    .optional()
    .or(z.literal("")),
  serviceInterest: z
    .string()
    .trim()
    .max(320, "Service selection is too long.")
    .optional()
    .or(z.literal("")),
  subject: z
    .string()
    .trim()
    .min(3, "Please add a brief subject (at least 3 characters).")
    .max(160, "Subject must be 160 characters or fewer."),
  message: z
    .string()
    .trim()
    .min(20, "Please share at least 20 characters about your project or enquiry.")
    .max(3000, "Message must be 3,000 characters or fewer."),
  website: z.string().max(0, "Spam check failed.").optional().or(z.literal("")),
});

export type ContactEnquiryInput = z.infer<typeof contactEnquirySchema>;
