import { z } from "zod";

export const ORDER_TYPES = [
  "Large Quantity",
  "Event Stall",
  "Custom Cake / Dessert",
  "Pre Order",
  "Other",
] as const;

export const preOrderSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Please enter your full name")
    .max(80, "Name is too long"),
  phone: z
    .string()
    .trim()
    .min(7, "Enter a valid phone number")
    .max(20, "Enter a valid phone number")
    .regex(/^[+\d][\d\s()-]*$/, "Only digits and + - ( ) are allowed"),
  email: z.email("Enter a valid email address"),
  orderType: z.enum(ORDER_TYPES),
  description: z
    .string()
    .trim()
    .min(10, "Please tell us a little more")
    .max(1000, "Description is too long"),
});

export type PreOrderValues = z.infer<typeof preOrderSchema>;
