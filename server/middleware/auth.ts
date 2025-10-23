import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcrypt";
import { type Request, type Response, type NextFunction } from "express";
import { db } from "../db.js";
import { users } from "../../shared/schemas/index.js";
import { eq } from "drizzle-orm";
import { AppError } from "./errorHandler.js";
import type { User, UserRole } from "../../shared/types/index.js";

// Extend Express User type
declare global {
  namespace Express {
    interface User {
      id: number;
      username: string;
      email: string;
      firstName: string | null;
      lastName: string | null;
      role: UserRole;
      location: string | null;
      isActive: boolean;
      lastLogin: Date | null;
      createdAt: Date;
      updatedAt: Date;
    }
  }
}

// Setup Passport Local Strategy
export function setupAuth() {
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        // Find user by username
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.username, username))
          .limit(1);

        if (!user) {
          return done(null, false, { message: "Invalid username or password" });
        }

        if (!user.isActive) {
          return done(null, false, { message: "Account is deactivated" });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
          return done(null, false, { message: "Invalid username or password" });
        }

        // Update last login
        await db
          .update(users)
          .set({ lastLogin: new Date() })
          .where(eq(users.id, user.id));

        // Return user without password
        const { password: _, ...userWithoutPassword } = user;
        return done(null, userWithoutPassword);
      } catch (error) {
        return done(error);
      }
    })
  );

  // Serialize user for session
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Deserialize user from session
  passport.deserializeUser(async (id: number, done) => {
    try {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, id))
        .limit(1);

      if (!user) {
        return done(null, false);
      }

      const { password: _, ...userWithoutPassword } = user;
      done(null, userWithoutPassword);
    } catch (error) {
      done(error);
    }
  });
}

// Middleware to check if user is authenticated
export function isAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (req.isAuthenticated()) {
    return next();
  }
  throw new AppError(401, "Unauthorized - Please log in");
}

// Middleware to check user role
export function hasRole(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
      throw new AppError(401, "Unauthorized - Please log in");
    }

    if (!req.user || !roles.includes(req.user.role)) {
      throw new AppError(403, "Forbidden - Insufficient permissions");
    }

    next();
  };
}

// Middleware to check if user belongs to location
export function hasLocation(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    throw new AppError(401, "Unauthorized - Please log in");
  }

  if (!req.user || !req.user.location) {
    throw new AppError(403, "Forbidden - No location assigned");
  }

  next();
}

// Middleware to check if admin or owns resource
export function isAdminOrOwner(userIdParam: string = "userId") {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated() || !req.user) {
      throw new AppError(401, "Unauthorized - Please log in");
    }

    const userId = parseInt(req.params[userIdParam]);
    const isAdmin = req.user.role === "admin";
    const isOwner = req.user.id === userId;

    if (!isAdmin && !isOwner) {
      throw new AppError(403, "Forbidden - Insufficient permissions");
    }

    next();
  };
}
