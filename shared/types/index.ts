// Re-export all schema types
export type {
  User,
  InsertUser,
  InsertProduct,
  WarehouseInventory,
  BarInventory,
  Delivery,
  InsertDelivery,
  DeliveryItem,
  InsertDeliveryItem,
  StockTransfer,
  InsertStockTransfer,
  Report,
  InsertReport,
  ActivityLog,
  StockAlert,
} from "../schemas/index.js";

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

// Authentication types
export interface AuthUser {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  location?: Location;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  user: AuthUser;
  token: string;
}

// Enums as TypeScript types
export type UserRole = "admin" | "bar_manager" | "warehouse_manager" | "barman";
export type Location = "duzy_bulldog" | "maly_bulldog" | "gin_bar";
export type ProductCategory = "spirits" | "beer" | "wine" | "soft_drinks" | "mixers" | "garnishes" | "other";
export type DeliveryStatus = "pending" | "in_transit" | "delivered" | "cancelled";
export type ReportType = "daily" | "shift" | "inventory" | "usage" | "delivery" | "forecast" | "custom";
export type ActivityType = "login" | "logout" | "create" | "update" | "delete" | "stock_change" | "delivery" | "report_generated";

// Inventory types
export interface InventoryItem {
  id: number;
  product: Product;
  quantity: number;
  location?: Location;
  lastRestocked?: Date;
  status: "low" | "normal" | "high";
}

export interface StockLevel {
  productId: number;
  warehouseQuantity: number;
  barQuantities: {
    [key in Location]?: number;
  };
  totalQuantity: number;
  minStockLevel: number;
  reorderPoint: number;
  needsReorder: boolean;
}

// Dashboard statistics
export interface DashboardStats {
  totalProducts: number;
  lowStockItems: number;
  pendingDeliveries: number;
  activeUsers: number;
  todayActivity: number;
  locations: {
    [key in Location]: {
      totalItems: number;
      lowStockItems: number;
      recentTransfers: number;
    };
  };
}

// Report data structures
export interface DailyReportData {
  date: string;
  location: Location;
  sales: {
    productId: number;
    productName: string;
    quantity: number;
    revenue: number;
  }[];
  stockChanges: {
    productId: number;
    productName: string;
    startQuantity: number;
    endQuantity: number;
    difference: number;
  }[];
  totalRevenue: number;
  totalItems: number;
}

export interface ShiftReportData {
  shiftStart: string;
  shiftEnd: string;
  location: Location;
  bartender: string;
  sales: number;
  transactions: number;
  notes: string;
}

export interface InventoryReportData {
  date: string;
  location?: Location;
  items: {
    productId: number;
    productName: string;
    category: ProductCategory;
    currentStock: number;
    minStock: number;
    value: number;
    status: "low" | "normal" | "high";
  }[];
  totalValue: number;
  lowStockCount: number;
}

export interface ForecastData {
  productId: number;
  productName: string;
  historicalUsage: number[];
  predictedUsage: number;
  recommendedOrder: number;
  confidence: number;
}

// WebSocket message types
export interface WebSocketMessage {
  type: "stock_update" | "delivery_update" | "alert" | "user_activity" | "notification";
  data: any;
  timestamp: string;
}

export interface StockUpdateMessage {
  productId: number;
  location?: Location;
  oldQuantity: number;
  newQuantity: number;
  changedBy: string;
}

export interface AlertMessage {
  id: number;
  type: "low_stock" | "delivery" | "system";
  severity: "info" | "warning" | "error";
  message: string;
  productId?: number;
  location?: Location;
}

// Form types
export interface ProductFormData {
  name: string;
  category: ProductCategory;
  barcode?: string;
  sku?: string;
  unit: string;
  minStockLevel: number;
  reorderPoint: number;
  cost?: string;
  price?: string;
  supplier?: string;
  description?: string;
}

export interface DeliveryFormData {
  supplier: string;
  location: Location;
  expectedDate?: Date;
  items: {
    productId: number;
    quantity: number;
    unitCost?: string;
  }[];
  notes?: string;
}

export interface StockTransferFormData {
  productId: number;
  toLocation: Location;
  quantity: number;
  notes?: string;
}

export interface UserFormData {
  username: string;
  email: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  location?: Location;
}

// Filter and sort types
export interface ProductFilters {
  category?: ProductCategory;
  supplier?: string;
  isActive?: boolean;
  search?: string;
  lowStock?: boolean;
}

export interface DeliveryFilters {
  status?: DeliveryStatus;
  location?: Location;
  supplier?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface SortOption {
  field: string;
  direction: "asc" | "desc";
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

// Utility types
export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<T, Exclude<keyof T, Keys>> &
  {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
  }[Keys];

export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type Product = {
  id: number;
  name: string;
  category: ProductCategory;
  barcode?: string | null;
  sku?: string | null;
  unit: string;
  minStockLevel: number;
  reorderPoint: number;
  cost?: string | null;
  price?: string | null;
  supplier?: string | null;
  description?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};
