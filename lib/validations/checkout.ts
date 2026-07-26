import { z } from "zod";
import { DEFAULT_DELIVERY_AREA, DELIVERY_AREAS } from "@/lib/constants";

/**
 * Checkout form schema (Zod v4). Shared contract for the form and any future
 * server action / API route.
 *
 * paymentMethod keeps the "cod" | "online" union even though COD isn't
 * offered anymore — narrowing it to a single-value enum would require
 * touching lib/models/order.ts, lib/validations/order.ts and types/order.ts
 * too (they all reference the same COD/ONLINE shape), which is a bigger,
 * separate change. Functionally harmless to leave as-is: the form always
 * submits "online" now.
 */
export const checkoutSchema = z.object({
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
  // Optional — allow an empty string or a valid email.
  email: z
    .union([z.literal(""), z.email("Enter a valid email address")])
    .optional(),
  deliveryArea: z.enum(DELIVERY_AREAS),
  address: z
    .string()
    .trim()
    .min(10, "Please enter your full delivery address")
    .max(300, "Address is too long"),
  notes: z.string().trim().max(500, "Notes are too long").optional(),
  paymentMethod: z.enum(["cod", "online"]),
});

export type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export const checkoutDefaultValues: CheckoutFormValues = {
  fullName: "",
  phone: "",
  email: "",
  deliveryArea: DEFAULT_DELIVERY_AREA,
  address: "",
  notes: "",
  paymentMethod: "online",
};