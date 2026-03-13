import express from "express";
import cors from "cors";
import path from "path";
import cookieParser from "cookie-parser";

// Route imports
import authRoutes from "./routes/authRoutes.js";
// e.g import propertyRoutes from "./routes/propertyRoutes.js";

const app = express();

// CORS middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//API Routes
app.use("/api/auth", authRoutes);

// e.g app.use("/api/users", userRoutes);

export default app;
