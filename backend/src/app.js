import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";

// Route Imports - Ensure these files exist and use .js extensions
import authRoutes from "./routes/auth.routes.js";
import mainRoutes from "./routes/index.js";

const app = express();

// 1. CORS Configuration
// Allow frontend domains and local development ports
const allowedOrigins = [
  // Local development
  "http://localhost:3000", 
  "http://localhost:5173", 
  "http://localhost:8080",
  "http://127.0.0.1:5173",
  // Production frontend URL
  "https://your-frontend-domain.com"
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// 2. Global Middleware
// cookieParser MUST come before routes to handle auth tokens
app.use(cookieParser()); 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Health Check Endpoint
// Use this to verify if the 502 is gone (visit /api/health in your browser)
app.get("/api/health", (_req, res) => {
  const states = ["disconnected", "connected", "connecting", "disconnecting"];
  res.status(200).json({
    ok: true,
    status: "Backend is running on Railway",
    timestamp: new Date().toISOString(),
    dbState: states[mongoose.connection.readyState] || "unknown"
  });
});

// 4. API Routes
app.use("/api/auth", authRoutes);
app.use("/api", mainRoutes);

// 5. 404 Handler (Optional but helpful)
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

export default app;
