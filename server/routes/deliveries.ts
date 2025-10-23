import { Router, type Request, type Response } from "express";
import { db } from "../db.js";
import { deliveries, deliveryItems, products, activityLog } from "../../shared/schemas/index.js";
import { insertDeliverySchema, insertDeliveryItemSchema } from "../../shared/schemas/index.js";
import { asyncHandler, AppError } from "../middleware/errorHandler.js";
import { isAuthenticated, hasRole } from "../middleware/auth.js";
import { eq, and } from "drizzle-orm";

const router = Router();

// Get all deliveries
router.get("/", isAuthenticated, asyncHandler(async (req: Request, res: Response) => {
  const allDeliveries = await db
    .select()
    .from(deliveries)
    .orderBy(deliveries.createdAt);

  res.json({
    success: true,
    data: allDeliveries,
  });
}));

// Get delivery by ID with items
router.get("/:id", isAuthenticated, asyncHandler(async (req: Request, res: Response) => {
  const deliveryId = parseInt(req.params.id);

  const [delivery] = await db
    .select()
    .from(deliveries)
    .where(eq(deliveries.id, deliveryId))
    .limit(1);

  if (!delivery) {
    throw new AppError(404, "Delivery not found");
  }

  const items = await db
    .select({
      id: deliveryItems.id,
      productId: deliveryItems.productId,
      productName: products.name,
      orderedQuantity: deliveryItems.orderedQuantity,
      receivedQuantity: deliveryItems.receivedQuantity,
      unitCost: deliveryItems.unitCost,
      notes: deliveryItems.notes,
    })
    .from(deliveryItems)
    .innerJoin(products, eq(deliveryItems.productId, products.id))
    .where(eq(deliveryItems.deliveryId, deliveryId));

  res.json({
    success: true,
    data: {
      delivery,
      items,
    },
  });
}));

// Create delivery
router.post(
  "/",
  isAuthenticated,
  hasRole("admin", "warehouse_manager"),
  asyncHandler(async (req: Request, res: Response) => {
    const { items, ...deliveryData } = req.body;

    if (!req.user) {
      throw new AppError(401, "Unauthorized");
    }

    const [newDelivery] = await db
      .insert(deliveries)
      .values({
        ...deliveryData,
        createdBy: req.user.id,
      })
      .returning();

    // Add items
    if (items && items.length > 0) {
      await db.insert(deliveryItems).values(
        items.map((item: any) => ({
          deliveryId: newDelivery.id,
          ...item,
        }))
      );
    }

    // Log activity
    await db.insert(activityLog).values({
      userId: req.user.id,
      activityType: "create",
      entityType: "delivery",
      entityId: newDelivery.id,
      description: `Created delivery from ${newDelivery.supplier}`,
      ipAddress: req.ip,
    });

    res.status(201).json({
      success: true,
      data: { delivery: newDelivery },
      message: "Delivery created successfully",
    });
  })
);

// Update delivery status
router.patch(
  "/:id/status",
  isAuthenticated,
  hasRole("admin", "warehouse_manager"),
  asyncHandler(async (req: Request, res: Response) => {
    const deliveryId = parseInt(req.params.id);
    const { status } = req.body;

    const [updated] = await db
      .update(deliveries)
      .set({ status, updatedAt: new Date() })
      .where(eq(deliveries.id, deliveryId))
      .returning();

    if (!updated) {
      throw new AppError(404, "Delivery not found");
    }

    res.json({
      success: true,
      data: { delivery: updated },
      message: "Delivery status updated",
    });
  })
);

export default router;
