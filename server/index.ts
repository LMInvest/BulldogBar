import express, { type Request, Response, NextFunction } from "express";
import cors from "cors";
import session from "express-session";
import passport from "passport";
import { db, testDatabaseConnection } from "./db.js";
import { setupAuth } from "./middleware/auth.js";
import { errorHandler } from "./middleware/errorHandler.js";
import authRoutes from "./routes/auth.js";
import productsRoutes from "./routes/products.js";
import inventoryRoutes from "./routes/inventory.js";
import deliveriesRoutes from "./routes/deliveries.js";
import reportsRoutes from "./routes/reports.js";
import usersRoutes from "./routes/users.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || "bulldogbar-secret-change-in-production",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());
setupAuth();

// Health check endpoint
app.get("/api/health", (req: Request, res: Response) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/deliveries", deliveriesRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/users", usersRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: "Not Found", path: req.path });
});

// Start server
async function startServer() {
  try {
    // Test database connection
    const dbConnected = await testDatabaseConnection();
    if (!dbConnected) {
      console.error("Failed to connect to database. Exiting...");
      process.exit(1);
    }

    // Start Express server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`🔗 API available at http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();

export default app;
