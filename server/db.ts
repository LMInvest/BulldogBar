import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq } from "drizzle-orm";
import * as schema from "../shared/schemas/index.js";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

const sql = neon(process.env.DATABASE_URL);
export const db = drizzle({ client: sql, schema });

// Helper function to test database connection
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    await sql`SELECT 1`;
    console.log("✅ Database connection successful");
    return true;
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    return false;
  }
}

// Helper function to initialize database with seed data
export async function seedDatabase() {
  try {
    // Check if admin user already exists
    const existingAdmin = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.username, "admin"))
      .limit(1);

    if (existingAdmin.length > 0) {
      console.log("Database already seeded");
      return;
    }

    // Import bcrypt for password hashing
    const bcrypt = await import("bcrypt");
    const hashedPassword = await bcrypt.hash("admin123", 10);

    // Create default admin user
    await db.insert(schema.users).values({
      username: "admin",
      email: "admin@bulldogbar.pl",
      password: hashedPassword,
      firstName: "Admin",
      lastName: "User",
      role: "admin",
      isActive: true,
    });

    console.log("✅ Database seeded successfully");
    console.log("Default admin credentials: admin / admin123");
  } catch (error) {
    console.error("❌ Database seeding failed:", error);
    throw error;
  }
}
