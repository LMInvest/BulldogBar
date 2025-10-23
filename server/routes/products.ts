import { Router, type Request, type Response } from "express";
import { db } from "../db.js";
import { products, warehouseInventory, barInventory, activityLog } from "../../shared/schemas/index.js";
import { insertProductSchema } from "../../shared/schemas/index.js";
import { asyncHandler, AppError } from "../middleware/errorHandler.js";
import { isAuthenticated, hasRole } from "../middleware/auth.js";
import { eq, ilike, or, and, sql } from "drizzle-orm";

const router = Router();

// Get all products
router.get("/", isAuthenticated, asyncHandler(async (req: Request, res: Response) => {
  const {
    search,
    category,
    supplier,
    isActive,
    lowStock,
    page = "1",
    pageSize = "50",
  } = req.query;

  let query = db.select().from(products).$dynamic();

  // Apply filters
  const conditions = [];

  if (search) {
    conditions.push(
      or(
        ilike(products.name, `%${search}%`),
        ilike(products.sku, `%${search}%`),
        ilike(products.barcode, `%${search}%`)
      )
    );
  }

  if (category) {
    conditions.push(eq(products.category, category as any));
  }

  if (supplier) {
    conditions.push(ilike(products.supplier, `%${supplier}%`));
  }

  if (isActive !== undefined) {
    conditions.push(eq(products.isActive, isActive === "true"));
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  const allProducts = await query;

  // Calculate pagination
  const pageNum = parseInt(page as string);
  const pageSizeNum = parseInt(pageSize as string);
  const start = (pageNum - 1) * pageSizeNum;
  const end = start + pageSizeNum;

  const paginatedProducts = allProducts.slice(start, end);

  res.json({
    success: true,
    data: paginatedProducts,
    pagination: {
      page: pageNum,
      pageSize: pageSizeNum,
      total: allProducts.length,
      totalPages: Math.ceil(allProducts.length / pageSizeNum),
    },
  });
}));

// Get product by ID
router.get("/:id", isAuthenticated, asyncHandler(async (req: Request, res: Response) => {
  const productId = parseInt(req.params.id);

  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.id, productId))
    .limit(1);

  if (!product) {
    throw new AppError(404, "Product not found");
  }

  // Get inventory levels
  const [warehouse] = await db
    .select()
    .from(warehouseInventory)
    .where(eq(warehouseInventory.productId, productId))
    .limit(1);

  const barStocks = await db
    .select()
    .from(barInventory)
    .where(eq(barInventory.productId, productId));

  res.json({
    success: true,
    data: {
      product,
      inventory: {
        warehouse: warehouse?.quantity || 0,
        bars: barStocks.reduce((acc, stock) => {
          acc[stock.location] = stock.quantity;
          return acc;
        }, {} as Record<string, number>),
      },
    },
  });
}));

// Create product
router.post(
  "/",
  isAuthenticated,
  hasRole("admin", "warehouse_manager"),
  asyncHandler(async (req: Request, res: Response) => {
    const result = insertProductSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: "Validation Error",
        details: result.error.errors,
      });
    }

    const [newProduct] = await db
      .insert(products)
      .values(result.data)
      .returning();

    // Initialize warehouse inventory
    await db.insert(warehouseInventory).values({
      productId: newProduct.id,
      quantity: 0,
    });

    // Log activity
    if (req.user) {
      await db.insert(activityLog).values({
        userId: req.user.id,
        activityType: "create",
        entityType: "product",
        entityId: newProduct.id,
        description: `Created product: ${newProduct.name}`,
        ipAddress: req.ip,
      });
    }

    res.status(201).json({
      success: true,
      data: { product: newProduct },
      message: "Product created successfully",
    });
  })
);

// Update product
router.put(
  "/:id",
  isAuthenticated,
  hasRole("admin", "warehouse_manager"),
  asyncHandler(async (req: Request, res: Response) => {
    const productId = parseInt(req.params.id);

    const [existingProduct] = await db
      .select()
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);

    if (!existingProduct) {
      throw new AppError(404, "Product not found");
    }

    const result = insertProductSchema.partial().safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: "Validation Error",
        details: result.error.errors,
      });
    }

    const [updatedProduct] = await db
      .update(products)
      .set({ ...result.data, updatedAt: new Date() })
      .where(eq(products.id, productId))
      .returning();

    // Log activity
    if (req.user) {
      await db.insert(activityLog).values({
        userId: req.user.id,
        activityType: "update",
        entityType: "product",
        entityId: productId,
        description: `Updated product: ${updatedProduct.name}`,
        ipAddress: req.ip,
      });
    }

    res.json({
      success: true,
      data: { product: updatedProduct },
      message: "Product updated successfully",
    });
  })
);

// Delete (deactivate) product
router.delete(
  "/:id",
  isAuthenticated,
  hasRole("admin"),
  asyncHandler(async (req: Request, res: Response) => {
    const productId = parseInt(req.params.id);

    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);

    if (!product) {
      throw new AppError(404, "Product not found");
    }

    await db
      .update(products)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(products.id, productId));

    // Log activity
    if (req.user) {
      await db.insert(activityLog).values({
        userId: req.user.id,
        activityType: "delete",
        entityType: "product",
        entityId: productId,
        description: `Deactivated product: ${product.name}`,
        ipAddress: req.ip,
      });
    }

    res.json({
      success: true,
      message: "Product deactivated successfully",
    });
  })
);

export default router;
