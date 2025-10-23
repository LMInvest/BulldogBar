import { Router, type Request, type Response } from "express";
import passport from "passport";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import { db } from "../db.js";
import { users, activityLog } from "../../shared/schemas/index.js";
import { insertUserSchema, loginSchema } from "../../shared/schemas/index.js";
import { asyncHandler, AppError } from "../middleware/errorHandler.js";
import { isAuthenticated, hasRole } from "../middleware/auth.js";
import type { LoginRequest, LoginResponse } from "../../shared/types/index.js";

const router = Router();

// Login
router.post("/login", (req: Request, res: Response, next) => {
  // Validate request body
  const result = loginSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      success: false,
      error: "Validation Error",
      details: result.error.errors,
    });
  }

  passport.authenticate("local", (err: any, user: Express.User | false, info: any) => {
    if (err) {
      return next(err);
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        error: info?.message || "Authentication failed",
      });
    }

    req.logIn(user, async (err) => {
      if (err) {
        return next(err);
      }

      // Log activity
      try {
        await db.insert(activityLog).values({
          userId: user.id,
          activityType: "login",
          description: `User ${user.username} logged in`,
          ipAddress: req.ip,
        });
      } catch (error) {
        console.error("Failed to log activity:", error);
      }

      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            location: user.location,
          },
        },
      });
    });
  })(req, res, next);
});

// Logout
router.post("/logout", isAuthenticated, asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;

  // Log activity
  if (userId) {
    try {
      await db.insert(activityLog).values({
        userId,
        activityType: "logout",
        description: `User logged out`,
        ipAddress: req.ip,
      });
    } catch (error) {
      console.error("Failed to log activity:", error);
    }
  }

  req.logout((err) => {
    if (err) {
      throw new AppError(500, "Failed to logout");
    }

    res.json({
      success: true,
      message: "Logged out successfully",
    });
  });
}));

// Get current user
router.get("/me", isAuthenticated, (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      user: req.user,
    },
  });
});

// Register new user (admin only)
router.post(
  "/register",
  isAuthenticated,
  hasRole("admin"),
  asyncHandler(async (req: Request, res: Response) => {
    const result = insertUserSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: "Validation Error",
        details: result.error.errors,
      });
    }

    const { password, ...userData } = result.data;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const [newUser] = await db
      .insert(users)
      .values({
        ...userData,
        password: hashedPassword,
      })
      .returning();

    // Log activity
    if (req.user) {
      await db.insert(activityLog).values({
        userId: req.user.id,
        activityType: "create",
        entityType: "user",
        entityId: newUser.id,
        description: `Created new user: ${newUser.username}`,
        ipAddress: req.ip,
      });
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser;

    res.status(201).json({
      success: true,
      data: { user: userWithoutPassword },
      message: "User created successfully",
    });
  })
);

// Change password
router.post(
  "/change-password",
  isAuthenticated,
  asyncHandler(async (req: Request, res: Response) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      throw new AppError(400, "Current password and new password are required");
    }

    if (newPassword.length < 8) {
      throw new AppError(400, "New password must be at least 8 characters long");
    }

    if (!req.user) {
      throw new AppError(401, "Unauthorized");
    }

    // Get user with password
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, req.user.id))
      .limit(1);

    if (!user) {
      throw new AppError(404, "User not found");
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      throw new AppError(401, "Current password is incorrect");
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await db
      .update(users)
      .set({ password: hashedPassword, updatedAt: new Date() })
      .where(eq(users.id, req.user.id));

    // Log activity
    await db.insert(activityLog).values({
      userId: req.user.id,
      activityType: "update",
      entityType: "user",
      entityId: req.user.id,
      description: "Changed password",
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: "Password changed successfully",
    });
  })
);

export default router;
