import { z } from "zod";

const orderItemSchema = z.object({
  productId: z.string().min(1),
  productName: z.string().min(1),
  quantity: z.number().int().min(1),
  unitPrice: z.number().min(0),
});

/**
 * Server-side validation for POST /api/orders. Also enforces the core
 * checkout rule: online payments must include a screenshot URL.
 */
export const createOrderSchema = z
  .object({
    customer: z.object({
      name: z.string().trim().min(2).max(80),
      phone: z.string().trim().min(7).max(20),
      whatsapp: z.string().trim().min(7).max(20),
      email: z.union([z.literal(""), z.email()]).optional(),
    }),
    delivery: z.object({
      address: z.string().trim().min(5).max(500),
      city: z.string().trim().min(1).max(80),
      notes: z.string().trim().max(500).optional(),
    }),
    items: z.array(orderItemSchema).min(1),
    payment: z.object({
      method: z.enum(["COD", "ONLINE"]),
      screenshotUrl: z.url().optional(),
      screenshotPublicId: z.string().optional(),
    }),
    subtotal: z.number().min(0),
    deliveryFee: z.number().min(0),
    total: z.number().min(0),
  })
  .refine(
    (data) => data.payment.method !== "ONLINE" || !!data.payment.screenshotUrl,
    {
      message: "A payment screenshot is required for online payment.",
      path: ["payment", "screenshotUrl"],
    },
  );

export type CreateOrderBody = z.infer<typeof createOrderSchema>;

export const updateOrderSchema = z.object({
  status: z
    .enum([
      "pending",
      "accepted",
      "preparing",
      "out-for-delivery",
      "delivered",
      "cancelled",
    ])
    .optional(),
  cancellationReason: z.string().trim().max(500).optional(),
  verifyPayment: z.boolean().optional(),
});

export type UpdateOrderBody = z.infer<typeof updateOrderSchema>;
