import { Router, type Request, type Response } from "express";
import { db } from "../db.js";
import {
  products,
  warehouseInventory,
  barInventory,
  stockTransfers,
  stockAlerts,
  activityLog,
} from "../../shared/schemas/index.js";
import { insertStockTransferSchema } from "../../shared/schemas/index.js";
import { asyncHandler, AppError } from "../middleware/errorHandler.js";
import { isAuthenticated, hasRole } from "../middleware/auth.js";
import { eq, and, sql } from "drizzle-orm";
import type { Location } from "../../shared/types/index.js";

const router = Router();

// Get warehouse inventory
router.get("/warehouse", isAuthenticated, asyncHandler(async (req: Request, res: Response) => {
  const inventory = await db
    .select({
      id: warehouseInventory.id,
      productId: products.id,
      productName: products.name,
      category: products.category,
      unit: products.unit,
      quantity: warehouseInventory.quantity,
      minStockLevel: products.minStockLevel,
      reorderPoint: products.reorderPoint,
      lastRestocked: warehouseInventory.lastRestocked,
    })
    .from(warehouseInventory)
    .innerJoin(products, eq(warehouseInventory.productId, products.id))
    .where(eq(products.isActive, true));

  res.json({
    success: true,
    data: inventory,
  });
}));

// Get bar inventory by location
router.get("/bar/:location", isAuthenticated, asyncHandler(async (req: Request, res: Response) => {
  const location = req.params.location as Location;

  const inventory = await db
    .select({
      id: barInventory.id,
      productId: products.id,
      productName: products.name,
      category: products.category,
      unit: products.unit,
      quantity: barInventory.quantity,
      minStockLevel: products.minStockLevel,
      reorderPoint: products.reorderPoint,
      lastRestocked: barInventory.lastRestocked,
      location: barInventory.location,
    })
    .from(barInventory)
    .innerJoin(products, eq(barInventory.productId, products.id))
    .where(and(eq(barInventory.location, location), eq(products.isActive, true)));

  res.json({
    success: true,
    data: inventory,
  });
}));

// Get all inventory (combined)
router.get("/all", isAuthenticated, asyncHandler(async (req: Request, res: Response) => {
  const warehouseStock = await db
    .select({
      productId: products.id,
      productName: products.name,
      category: products.category,
      warehouseQuantity: warehouseInventory.quantity,
    })
    .from(warehouseInventory)
    .innerJoin(products, eq(warehouseInventory.productId, products.id))
    .where(eq(products.isActive, true));

  const barStocks = await db
    .select({
      productId: products.id,
      location: barInventory.location,
      quantity: barInventory.quantity,
    })
    .from(barInventory)
    .innerJoin(products, eq(barInventory.productId, products.id))
    .where(eq(products.isActive, true));

  // Combine data
  const combined = warehouseStock.map((item) => {
    const bars = barStocks.filter((bar) => bar.productId === item.productId);
    const barQuantities = bars.reduce((acc, bar) => {
      acc[bar.location] = bar.quantity;
      return acc;
    }, {} as Record<Location, number>);

    return {
      ...item,
      barQuantities,
      totalQuantity:
        item.warehouseQuantity +
        bars.reduce((sum, bar) => sum + bar.quantity, 0),
    };
  });

  res.json({
    success: true,
    data: combined,
  });
}));

// Update warehouse inventory
router.put(
  "/warehouse/:productId",
  isAuthenticated,
  hasRole("admin", "warehouse_manager"),
  asyncHandler(async (req: Request, res: Response) => {
    const productId = parseInt(req.params.productId);
    const { quantity, adjustment } = req.body;

    if (quantity === undefined && adjustment === undefined) {
      throw new AppError(400, "Either quantity or adjustment is required");
    }

    // Get current inventory
    const [current] = await db
      .select()
      .from(warehouseInventory)
      .where(eq(warehouseInventory.productId, productId))
      .limit(1);

    if (!current) {
      // Initialize if doesn't exist
      const [newInventory] = await db
        .insert(warehouseInventory)
        .values({
          productId,
          quantity: quantity || 0,
          lastRestocked: new Date(),
        })
        .returning();

      return res.json({
        success: true,
        data: { inventory: newInventory },
        message: "Warehouse inventory initialized",
      });
    }

    const newQuantity = adjustment !== undefined
      ? current.quantity + adjustment
      : quantity;

    if (newQuantity < 0) {
      throw new AppError(400, "Quantity cannot be negative");
    }

    const [updated] = await db
      .update(warehouseInventory)
      .set({
        quantity: newQuantity,
        lastRestocked: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(warehouseInventory.productId, productId))
      .returning();

    // Log activity
    if (req.user) {
      await db.insert(activityLog).values({
        userId: req.user.id,
        activityType: "stock_change",
        entityType: "warehouse_inventory",
        entityId: updated.id,
        description: `Updated warehouse stock: ${current.quantity} → ${newQuantity}`,
        metadata: { productId, oldQuantity: current.quantity, newQuantity },
        ipAddress: req.ip,
      });
    }

    res.json({
      success: true,
      data: { inventory: updated },
      message: "Warehouse inventory updated successfully",
    });
  })
);

// Transfer stock from warehouse to bar
router.post(
  "/transfer",
  isAuthenticated,
  hasRole("admin", "warehouse_manager", "bar_manager"),
  asyncHandler(async (req: Request, res: Response) => {
    const result = insertStockTransferSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: "Validation Error",
        details: result.error.errors,
      });
    }

    const { productId, toLocation, quantity, notes } = result.data;

    // Check warehouse stock
    const [warehouseStock] = await db
      .select()
      .from(warehouseInventory)
      .where(eq(warehouseInventory.productId, productId))
      .limit(1);

    if (!warehouseStock || warehouseStock.quantity < quantity) {
      throw new AppError(400, "Insufficient warehouse stock");
    }

    // Reduce warehouse stock
    await db
      .update(warehouseInventory)
      .set({
        quantity: warehouseStock.quantity - quantity,
        updatedAt: new Date(),
      })
      .where(eq(warehouseInventory.productId, productId));

    // Increase bar stock
    const [existingBarStock] = await db
      .select()
      .from(barInventory)
      .where(
        and(
          eq(barInventory.productId, productId),
          eq(barInventory.location, toLocation)
        )
      )
      .limit(1);

    if (existingBarStock) {
      await db
        .update(barInventory)
        .set({
          quantity: existingBarStock.quantity + quantity,
          lastRestocked: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(barInventory.id, existingBarStock.id));
    } else {
      await db.insert(barInventory).values({
        productId,
        location: toLocation,
        quantity,
        lastRestocked: new Date(),
      });
    }

    // Record transfer
    if (!req.user) {
      throw new AppError(401, "Unauthorized");
    }

    const [transfer] = await db
      .insert(stockTransfers)
      .values({
        productId,
        toLocation,
        quantity,
        transferredBy: req.user.id,
        notes,
      })
      .returning();

    // Log activity
    await db.insert(activityLog).values({
      userId: req.user.id,
      activityType: "stock_change",
      entityType: "stock_transfer",
      entityId: transfer.id,
      description: `Transferred ${quantity} units to ${toLocation}`,
      metadata: { productId, toLocation, quantity },
      ipAddress: req.ip,
    });

    res.status(201).json({
      success: true,
      data: { transfer },
      message: "Stock transferred successfully",
    });
  })
);

// Get stock transfers
router.get("/transfers", isAuthenticated, asyncHandler(async (req: Request, res: Response) => {
  const transfers = await db
    .select({
      id: stockTransfers.id,
      productId: stockTransfers.productId,
      productName: products.name,
      fromLocation: stockTransfers.fromLocation,
      toLocation: stockTransfers.toLocation,
      quantity: stockTransfers.quantity,
      transferredBy: stockTransfers.transferredBy,
      notes: stockTransfers.notes,
      createdAt: stockTransfers.createdAt,
    })
    .from(stockTransfers)
    .innerJoin(products, eq(stockTransfers.productId, products.id))
    .orderBy(stockTransfers.createdAt);

  res.json({
    success: true,
    data: transfers,
  });
}));

// Get stock alerts
router.get("/alerts", isAuthenticated, asyncHandler(async (req: Request, res: Response) => {
  const alerts = await db
    .select({
      id: stockAlerts.id,
      productId: stockAlerts.productId,
      productName: products.name,
      location: stockAlerts.location,
      alertType: stockAlerts.alertType,
      currentQuantity: stockAlerts.currentQuantity,
      threshold: stockAlerts.threshold,
      isResolved: stockAlerts.isResolved,
      createdAt: stockAlerts.createdAt,
    })
    .from(stockAlerts)
    .innerJoin(products, eq(stockAlerts.productId, products.id))
    .where(eq(stockAlerts.isResolved, false))
    .orderBy(stockAlerts.createdAt);

  res.json({
    success: true,
    data: alerts,
  });
}));

export default router;
