import { Router, type Request, type Response } from "express";
import { db } from "../db.js";
import { users, activityLog } from "../../shared/schemas/index.js";
import { asyncHandler, AppError } from "../middleware/errorHandler.js";
import { isAuthenticated, hasRole } from "../middleware/auth.js";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

const router = Router();

// Get all users
router.get(
  "/",
  isAuthenticated,
  hasRole("admin", "bar_manager", "warehouse_manager"),
  asyncHandler(async (req: Request, res: Response) => {
    const allUsers = await db.select().from(users);

    // Remove passwords
    const usersWithoutPasswords = allUsers.map(({ password, ...user }) => user);

    res.json({
      success: true,
      data: usersWithoutPasswords,
    });
  })
);

// Get user by ID
router.get(
  "/:id",
  isAuthenticated,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = parseInt(req.params.id);

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      throw new AppError(404, "User not found");
    }

    const { password, ...userWithoutPassword } = user;

    res.json({
      success: true,
      data: userWithoutPassword,
    });
  })
);

// Update user
router.put(
  "/:id",
  isAuthenticated,
  hasRole("admin"),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = parseInt(req.params.id);
    const { password, ...updateData } = req.body;

    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!existingUser) {
      throw new AppError(404, "User not found");
    }

    const dataToUpdate: any = {
      ...updateData,
      updatedAt: new Date(),
    };

    // If password is being updated, hash it
    if (password) {
      dataToUpdate.password = await bcrypt.hash(password, 10);
    }

    const [updated] = await db
      .update(users)
      .set(dataToUpdate)
      .where(eq(users.id, userId))
      .returning();

    const { password: _, ...userWithoutPassword } = updated;

    // Log activity
    if (req.user) {
      await db.insert(activityLog).values({
        userId: req.user.id,
        activityType: "update",
        entityType: "user",
        entityId: userId,
        description: `Updated user: ${updated.username}`,
        ipAddress: req.ip,
      });
    }

    res.json({
      success: true,
      data: { user: userWithoutPassword },
      message: "User updated successfully",
    });
  })
);

// Deactivate user
router.delete(
  "/:id",
  isAuthenticated,
  hasRole("admin"),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = parseInt(req.params.id);

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      throw new AppError(404, "User not found");
    }

    await db
      .update(users)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(users.id, userId));

    // Log activity
    if (req.user) {
      await db.insert(activityLog).values({
        userId: req.user.id,
        activityType: "delete",
        entityType: "user",
        entityId: userId,
        description: `Deactivated user: ${user.username}`,
        ipAddress: req.ip,
      });
    }

    res.json({
      success: true,
      message: "User deactivated successfully",
    });
  })
);

export default router;
