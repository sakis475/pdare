import * as dotenv from "dotenv";
dotenv.config();

import express from "express";
import { Request, Response } from "express";
import { catchWrapper, errorHandler } from "./error_handler/error-handler";
import cors from "cors";
import { api } from "./routes/api.routes";
import morgan from "morgan";

const app = express();

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(cors());
app.use(morgan("tiny"));

app.use("/api/v1", api);

//express custom error handler
app.use(errorHandler);

export { app };
