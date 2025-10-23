import { pgTable, text, serial, integer, decimal, timestamp, boolean, pgEnum, varchar, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const userRoleEnum = pgEnum("user_role", ["admin", "bar_manager", "warehouse_manager", "barman"]);
export const locationEnum = pgEnum("location", ["duzy_bulldog", "maly_bulldog", "gin_bar"]);
export const productCategoryEnum = pgEnum("product_category", ["spirits", "beer", "wine", "soft_drinks", "mixers", "garnishes", "other"]);
export const deliveryStatusEnum = pgEnum("delivery_status", ["pending", "in_transit", "delivered", "cancelled"]);
export const reportTypeEnum = pgEnum("report_type", ["daily", "shift", "inventory", "usage", "delivery", "forecast", "custom"]);
export const activityTypeEnum = pgEnum("activity_type", ["login", "logout", "create", "update", "delete", "stock_change", "delivery", "report_generated"]);

// Users Table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: text("password").notNull(),
  firstName: varchar("first_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }),
  role: userRoleEnum("role").notNull().default("barman"),
  location: locationEnum("location"),
  isActive: boolean("is_active").notNull().default(true),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Products Table
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  category: productCategoryEnum("category").notNull(),
  barcode: varchar("barcode", { length: 100 }),
  sku: varchar("sku", { length: 100 }).unique(),
  unit: varchar("unit", { length: 50 }).notNull().default("pieces"),
  minStockLevel: integer("min_stock_level").notNull().default(0),
  reorderPoint: integer("reorder_point").notNull().default(0),
  cost: decimal("cost", { precision: 10, scale: 2 }),
  price: decimal("price", { precision: 10, scale: 2 }),
  supplier: varchar("supplier", { length: 255 }),
  description: text("description"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Warehouse Inventory (Master Stock)
export const warehouseInventory = pgTable("warehouse_inventory", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  quantity: integer("quantity").notNull().default(0),
  lastRestocked: timestamp("last_restocked"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Bar Inventory (Per-location Stock)
export const barInventory = pgTable("bar_inventory", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  location: locationEnum("location").notNull(),
  quantity: integer("quantity").notNull().default(0),
  lastRestocked: timestamp("last_restocked"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Deliveries Table
export const deliveries = pgTable("deliveries", {
  id: serial("id").primaryKey(),
  deliveryNumber: varchar("delivery_number", { length: 100 }).unique(),
  supplier: varchar("supplier", { length: 255 }).notNull(),
  location: locationEnum("location").notNull(),
  status: deliveryStatusEnum("status").notNull().default("pending"),
  orderDate: timestamp("order_date").notNull().defaultNow(),
  expectedDate: timestamp("expected_date"),
  receivedDate: timestamp("received_date"),
  totalCost: decimal("total_cost", { precision: 10, scale: 2 }),
  notes: text("notes"),
  receivedBy: integer("received_by").references(() => users.id),
  createdBy: integer("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Delivery Items Table
export const deliveryItems = pgTable("delivery_items", {
  id: serial("id").primaryKey(),
  deliveryId: integer("delivery_id").notNull().references(() => deliveries.id, { onDelete: "cascade" }),
  productId: integer("product_id").notNull().references(() => products.id),
  orderedQuantity: integer("ordered_quantity").notNull(),
  receivedQuantity: integer("received_quantity"),
  unitCost: decimal("unit_cost", { precision: 10, scale: 2 }),
  notes: text("notes"),
});

// Stock Transfers (Warehouse to Bar)
export const stockTransfers = pgTable("stock_transfers", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull().references(() => products.id),
  fromLocation: varchar("from_location", { length: 50 }).notNull().default("warehouse"),
  toLocation: locationEnum("to_location").notNull(),
  quantity: integer("quantity").notNull(),
  transferredBy: integer("transferred_by").notNull().references(() => users.id),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Reports Table
export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  reportType: reportTypeEnum("report_type").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  location: locationEnum("location"),
  dateFrom: timestamp("date_from").notNull(),
  dateTo: timestamp("date_to").notNull(),
  data: jsonb("data").notNull(),
  generatedBy: integer("generated_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Activity Log Table
export const activityLog = pgTable("activity_log", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  activityType: activityTypeEnum("activity_type").notNull(),
  entityType: varchar("entity_type", { length: 100 }),
  entityId: integer("entity_id"),
  description: text("description"),
  metadata: jsonb("metadata"),
  ipAddress: varchar("ip_address", { length: 50 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Stock Alerts Table
export const stockAlerts = pgTable("stock_alerts", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull().references(() => products.id),
  location: varchar("location", { length: 50 }),
  alertType: varchar("alert_type", { length: 50 }).notNull(),
  currentQuantity: integer("current_quantity").notNull(),
  threshold: integer("threshold").notNull(),
  isResolved: boolean("is_resolved").notNull().default(false),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Sessions Table (for authentication)
export const sessions = pgTable("sessions", {
  sid: varchar("sid", { length: 255 }).primaryKey(),
  sess: jsonb("sess").notNull(),
  expire: timestamp("expire").notNull(),
});

// ====== Zod Schemas for Validation ======

// User schemas
export const insertUserSchema = createInsertSchema(users, {
  email: z.string().email(),
  username: z.string().min(3).max(50),
  password: z.string().min(8),
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
});

export const selectUserSchema = createSelectSchema(users);

export const loginSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(8),
});

// Product schemas
export const insertProductSchema = createInsertSchema(products, {
  name: z.string().min(1).max(255),
  sku: z.string().max(100).optional(),
  minStockLevel: z.number().int().nonnegative(),
  reorderPoint: z.number().int().nonnegative(),
});

export const selectProductSchema = createSelectSchema(products);

// Delivery schemas
export const insertDeliverySchema = createInsertSchema(deliveries, {
  supplier: z.string().min(1).max(255),
  totalCost: z.string().optional(),
});

export const selectDeliverySchema = createSelectSchema(deliveries);

// Delivery item schemas
export const insertDeliveryItemSchema = createInsertSchema(deliveryItems, {
  orderedQuantity: z.number().int().positive(),
  receivedQuantity: z.number().int().nonnegative().optional(),
});

export const selectDeliveryItemSchema = createSelectSchema(deliveryItems);

// Stock transfer schemas
export const insertStockTransferSchema = createInsertSchema(stockTransfers, {
  quantity: z.number().int().positive(),
});

export const selectStockTransferSchema = createSelectSchema(stockTransfers);

// Report schemas
export const insertReportSchema = createInsertSchema(reports, {
  title: z.string().min(1).max(255),
});

export const selectReportSchema = createSelectSchema(reports);

// Activity log schemas
export const insertActivityLogSchema = createInsertSchema(activityLog);
export const selectActivityLogSchema = createSelectSchema(activityLog);

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;
export type WarehouseInventory = typeof warehouseInventory.$inferSelect;
export type BarInventory = typeof barInventory.$inferSelect;
export type Delivery = typeof deliveries.$inferSelect;
export type InsertDelivery = typeof deliveries.$inferInsert;
export type DeliveryItem = typeof deliveryItems.$inferSelect;
export type InsertDeliveryItem = typeof deliveryItems.$inferInsert;
export type StockTransfer = typeof stockTransfers.$inferSelect;
export type InsertStockTransfer = typeof stockTransfers.$inferInsert;
export type Report = typeof reports.$inferSelect;
export type InsertReport = typeof reports.$inferInsert;
export type ActivityLog = typeof activityLog.$inferSelect;
export type StockAlert = typeof stockAlerts.$inferSelect;
