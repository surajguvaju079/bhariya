import { z } from "zod";

export const acceptLoadSchema = z.object({
  body: z.object({
    driverId: z.string().min(1),
  }),
  params: z.object({
    id: z.string(),
  }),
});
