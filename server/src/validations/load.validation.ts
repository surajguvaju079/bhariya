import { z } from "zod";

const coordsSchema = z.object({
  type: z.literal("Point"),
  coordinates: z.tuple([
    z.number().min(-180).max(180),
    z.number().min(-90).max(90),
  ]),
});

// ─── GET /loads ───────────────────────────────────────────────────────────────
export const getLoadsSchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    lat: z.string().optional(),
    lng: z.string().optional(),
    radius: z.string().optional(),
  }),
});

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
    originCoords: coordsSchema,
    destination: z.string().min(1),
    destinationCoords: coordsSchema,
    weight: z.number().positive(),
    status: z.enum(["PENDING", "ACCEPTED", "REJECTED"]).default("PENDING"),
    vehicleTypeRequired: z.string().min(1),
    price: z.number().positive(),
    driverId: z.string().optional(),
  }),
});

export type AcceptLoadInput = z.infer<typeof acceptLoadSchema>["body"];
export type CreateLoadInput = z.infer<typeof createLoadSchema>["body"];
export type GetLoadsQuery = z.infer<typeof getLoadsSchema>["query"];
