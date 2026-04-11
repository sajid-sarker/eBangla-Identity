import express from "express";
import cors from "cors";
import path from "path";
import cookieParser from "cookie-parser";

// Route imports
import authRoutes from "./routes/authRoutes.js";
import medicalRoutes from "./routes/medicalRoutes.js";
import policeRoutes from "./routes/policeRoutes.js";
import statsRoutes from "./routes/statsRoutes.js";
import taxRoutes from "./routes/taxRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import educationRoutes from "./routes/educationRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import scoreRoutes from "./routes/scoreRoutes.js";
import errorMiddleware from "./middlewares/errorMiddleware.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(errorMiddleware);

// CORS middleware
app.use(cors({ origin: true, credentials: true }));

//API Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/medical", medicalRoutes);
app.use("/api/police", policeRoutes);
app.use("/api/tax", taxRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/education", educationRoutes);
app.use("/api/report", reportRoutes);
app.use("/api/score", scoreRoutes);

export default app;
