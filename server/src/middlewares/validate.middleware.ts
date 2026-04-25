import { AnyZodObject } from "zod";
import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/apiError";
import { StatusCodes } from "../utils/statusCodes";

export const validate =
  (schema: AnyZodObject) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error: any) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        error.errors?.[0]?.message || "Validation error",
      );
    }
  };
