import { config } from "dotenv";
import express, { Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { APIResponse } from "./utils/apiResponse";
import { APIError } from "./utils/apiError";

// Environment variables
config();
const corsOrigin = process.env.CORS_ORIGIN;

// Express app
const app = express();

// Middlewares
app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root route
app.get("/", (_, res: Response) => {
  res
    .status(200)
    .json(
      new APIResponse(
        200,
        "The backend service for Campus Connect is up and running"
      )
    );
});

// Handle 404 undefined routes
app.use((_, res: Response) => {
  res.status(404).json(new APIError(404, "This route is not defined"));
});

export { app };
