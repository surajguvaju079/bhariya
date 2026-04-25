import express from "express";
//import userRoutes from "@/routes/user.routes";
import { requestLogger } from "@/middlewares/logger.middleware";
import { errorHandler } from "@/middlewares/errror.middleware";

const app = express();

app.use(express.json());

app.use(requestLogger);

//app.use("/api/users", userRoutes);

app.use(errorHandler);

export default app;
