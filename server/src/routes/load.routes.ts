import express from "express";
import { asyncHandler } from "@/middlewares/asyncHandler.middleware";
import { validate } from "@/middlewares/validate.middleware";
import { loadController } from "@/controllers/load.controller";
import {
  acceptLoadSchema,
  createLoadSchema,
} from "@/validations/load.validation";

const router = express.Router();

router.get("/", asyncHandler(loadController.getLoads));

router.post(
  "/",
  validate(createLoadSchema),
  asyncHandler(loadController.createLoad),
);

router.patch(
  "/:id/accept",
  validate(acceptLoadSchema),
  asyncHandler(loadController.acceptLoad),
);

export default router;
