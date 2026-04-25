import express from "express";
import loadRouter from "@/routes/load.routes";
import { requestLogger } from "@/middlewares/logger.middleware";
import { errorHandler } from "@/middlewares/errror.middleware";
import cors from "cors";

const app = express();

app.use(cors({ origin: true, credentials: true }));

app.use(express.json());

app.use(requestLogger);

app.use("/bhariya/api/loads", loadRouter);

app.use(errorHandler);

export default app;
