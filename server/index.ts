import express, { type Request, Response, NextFunction } from "express";
import cors from "cors";
import session from "express-session";
import passport from "passport";
import path from "path";
import { fileURLToPath } from "url";
import { db, testDatabaseConnection } from "./db.js";
import { setupAuth } from "./middleware/auth.js";
import { errorHandler } from "./middleware/errorHandler.js";
import authRoutes from "./routes/auth.js";
import productsRoutes from "./routes/products.js";
import inventoryRoutes from "./routes/inventory.js";
import deliveriesRoutes from "./routes/deliveries.js";
import reportsRoutes from "./routes/reports.js";
import usersRoutes from "./routes/users.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// Serve static files from the dist/public directory in production
if (process.env.NODE_ENV === "production") {
  const publicPath = path.join(__dirname, "public");
  app.use(express.static(publicPath));
}

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

// SPA fallback - serve index.html for all non-API routes (must be after API routes)
if (process.env.NODE_ENV === "production") {
  app.get("*", (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
  });
} else {
  // In development, return 404 for non-API routes
  app.use((req: Request, res: Response) => {
    res.status(404).json({ error: "Not Found", path: req.path });
  });
}

// Error handling middleware (must be last)
app.use(errorHandler);

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
