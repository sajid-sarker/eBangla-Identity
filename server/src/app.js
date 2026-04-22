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
import paymentRoutes from "./routes/paymentRoutes.js";
import errorMiddleware from "./middlewares/errorMiddleware.js";

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CORS — allow only known origins so cross-origin cookies are accepted
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, Postman)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin '${origin}' not allowed`));
      }
    },
    credentials: true,
  }),
);

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/medical", medicalRoutes);
app.use("/api/police", policeRoutes);
app.use("/api/tax", taxRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/education", educationRoutes);
app.use("/api/report", reportRoutes);
app.use("/api/score", scoreRoutes);
app.use("/api/payment", paymentRoutes);

app.use(errorMiddleware);

export default app;
