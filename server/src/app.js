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
<<<<<<< HEAD
import paymentRoutes from "./routes/paymentRoutes.js";
=======
import paymentRoutes from "./routes/paymentRoutes.js"; 
>>>>>>> 069492ce3c0bc8cf5e3cb111710bc5ab803a2593
import errorMiddleware from "./middlewares/errorMiddleware.js";

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CORS configuration
<<<<<<< HEAD
app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

// API Routes
=======
app.use(cors({ 
    origin: true, 
    credentials: true 
}));

// Root Route 
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "eBangla Identity API is running"
    });
});

// API Routes  
>>>>>>> 069492ce3c0bc8cf5e3cb111710bc5ab803a2593
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/medical", medicalRoutes);
app.use("/api/police", policeRoutes);
app.use("/api/tax", taxRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/education", educationRoutes);
app.use("/api/report", reportRoutes);
app.use("/api/score", scoreRoutes);
<<<<<<< HEAD
app.use("/api/payment", paymentRoutes);
=======
app.use("/api/payment", paymentRoutes); 
>>>>>>> 069492ce3c0bc8cf5e3cb111710bc5ab803a2593


app.use(errorMiddleware); 

export default app;