import express from "express";
import * as userController from "../controllers/user.controller";
import { asyncHandler } from "../middlewares/asyncHandler";
import { validate } from "../middlewares/validate.middleware";
import { createUserSchema } from "../validations/user.validation";

const router = express.Router();

router.post(
  "/",
  validate(createUserSchema),
  asyncHandler(userController.createUser),
);

router.get("/", asyncHandler(userController.getUsers));

export default router;
