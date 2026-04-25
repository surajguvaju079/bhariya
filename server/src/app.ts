import express from "express";
import userRoutes from "./routes/user.routes";
import { errorHandler } from "./middlewares/error.middleware";

const app = express();

app.use(express.json());

app.use("/api/users", userRoutes);

// Error middleware (LAST)
app.use(errorHandler);

export default app;
