import { z } from "zod";

export const acceptLoadSchema = z.object({
  body: z.object({
    driverId: z.string().min(1),
  }),
  params: z.object({
    id: z.string(),
  }),
});

export const createLoadSchema = z.object({
  body: z.object({
    origin: z.string().min(1),
    destination: z.string().min(1),
    weight: z.number().positive(),
    status: z.enum(["PENDING", "ACCEPTED", "REJECTED"]).default("PENDING"),
    vehicleTypeRequired: z.string().min(1),
    price: z.number().positive(),
    driverId: z.string().optional(),
  }),
});

export type AcceptLoadInput = z.infer<typeof acceptLoadSchema>["body"];
export type CreateLoadInput = z.infer<typeof createLoadSchema>["body"];
