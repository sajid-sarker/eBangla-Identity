import express from "express";
import cors from "cors";
import path from "path";
import { deflate } from "zlib";

// Route imports
// e.g import propertyRoutes from "./routes/propertyRoutes.js";

const app = express();

// CORS middleware
app.use(cors());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization",
  );
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

//API Routes

// e.g app.use("/api/users", authRoutes);

export default app;
