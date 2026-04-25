import { logger } from "@/utils/logger";
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGO_URI as string;
logger.info(`Attempting to connect to MongoDB at ${MONGODB_URI}`);

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI as string);
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error("DB connection failed", error);
    process.exit(1);
  }
};
