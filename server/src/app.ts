import express from "express";
import loadRouter from "@/routes/load.routes";
import { requestLogger } from "@/middlewares/logger.middleware";
import { errorHandler } from "@/middlewares/errror.middleware";

const app = express();

app.use(express.json());

app.use(requestLogger);

app.use("/bhariya/api/loads", loadRouter);

app.use(errorHandler);

export default app;
