import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency in PLN
 */
export function formatCurrency(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "0,00 zł";
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
    minimumFractionDigits: 2,
  }).format(num);
}

/**
 * Format date to Polish locale
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("pl-PL", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d);
}

/**
 * Format datetime to Polish locale
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("pl-PL", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

/**
 * Format time only
 */
export function formatTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("pl-PL", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

/**
 * Get relative time (e.g., "2 hours ago")
 */
export function getRelativeTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffInSeconds < 60) return "przed chwilą";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min temu`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} godz. temu`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} dni temu`;
  return formatDate(d);
}

/**
 * Format location name for display
 */
export function formatLocation(location: string): string {
  const locationMap: Record<string, string> = {
    duzy_bulldog: "Duży Bulldog",
    maly_bulldog: "Mały Bulldog",
    gin_bar: "Gin Bar",
    warehouse: "Magazyn",
  };
  return locationMap[location] || location;
}

/**
 * Format user role for display
 */
export function formatRole(role: string): string {
  const roleMap: Record<string, string> = {
    admin: "Administrator",
    bar_manager: "Menedżer Baru",
    warehouse_manager: "Menedżer Magazynu",
    barman: "Barman",
  };
  return roleMap[role] || role;
}

/**
 * Format product category for display
 */
export function formatCategory(category: string): string {
  const categoryMap: Record<string, string> = {
    spirits: "Alkohole Wysokoprocentowe",
    beer: "Piwo",
    wine: "Wino",
    soft_drinks: "Napoje Bezalkoholowe",
    mixers: "Miksery",
    garnishes: "Dodatki",
    other: "Inne",
  };
  return categoryMap[category] || category;
}

/**
 * Format delivery status for display
 */
export function formatDeliveryStatus(status: string): string {
  const statusMap: Record<string, string> = {
    pending: "Oczekująca",
    in_transit: "W Drodze",
    delivered: "Dostarczona",
    cancelled: "Anulowana",
  };
  return statusMap[status] || status;
}

/**
 * Get stock status based on quantity and thresholds
 */
export function getStockStatus(
  quantity: number,
  minStock: number,
  reorderPoint: number
): "low" | "normal" | "high" {
  if (quantity <= minStock) return "low";
  if (quantity <= reorderPoint) return "normal";
  return "high";
}

/**
 * Calculate percentage
 */
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.substring(0, length) + "...";
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Generate random ID
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

/**
 * Validate email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Sleep utility for async operations
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Safe JSON parse
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}

/**
 * Group array by key
 */
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((result, item) => {
    const groupKey = String(item[key]);
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {} as Record<string, T[]>);
}

/**
 * Remove duplicates from array
 */
export function unique<T>(array: T[]): T[] {
  return Array.from(new Set(array));
}

/**
 * Sort array by key
 */
export function sortBy<T>(array: T[], key: keyof T, direction: "asc" | "desc" = "asc"): T[] {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    if (aVal < bVal) return direction === "asc" ? -1 : 1;
    if (aVal > bVal) return direction === "asc" ? 1 : -1;
    return 0;
  });
}

/**
 * Check if value is empty (null, undefined, empty string, empty array)
 */
export function isEmpty(value: any): boolean {
  if (value == null) return true;
  if (typeof value === "string") return value.trim() === "";
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "object") return Object.keys(value).length === 0;
  return false;
}

/**
 * Capitalize first letter
 */
export function capitalize(text: string): string {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Convert snake_case to Title Case
 */
export function snakeToTitle(text: string): string {
  return text
    .split("_")
    .map((word) => capitalize(word))
    .join(" ");
}
