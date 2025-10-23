import { Router, type Request, type Response } from "express";
import { db } from "../db.js";
import { reports, activityLog } from "../../shared/schemas/index.js";
import { insertReportSchema } from "../../shared/schemas/index.js";
import { asyncHandler, AppError } from "../middleware/errorHandler.js";
import { isAuthenticated, hasRole } from "../middleware/auth.js";
import { eq } from "drizzle-orm";

const router = Router();

// Get all reports
router.get("/", isAuthenticated, asyncHandler(async (req: Request, res: Response) => {
  const allReports = await db
    .select()
    .from(reports)
    .orderBy(reports.createdAt);

  res.json({
    success: true,
    data: allReports,
  });
}));

// Get report by ID
router.get("/:id", isAuthenticated, asyncHandler(async (req: Request, res: Response) => {
  const reportId = parseInt(req.params.id);

  const [report] = await db
    .select()
    .from(reports)
    .where(eq(reports.id, reportId))
    .limit(1);

  if (!report) {
    throw new AppError(404, "Report not found");
  }

  res.json({
    success: true,
    data: report,
  });
}));

// Create report
router.post(
  "/",
  isAuthenticated,
  hasRole("admin", "bar_manager", "warehouse_manager"),
  asyncHandler(async (req: Request, res: Response) => {
    const result = insertReportSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: "Validation Error",
        details: result.error.errors,
      });
    }

    if (!req.user) {
      throw new AppError(401, "Unauthorized");
    }

    const [newReport] = await db
      .insert(reports)
      .values({
        ...result.data,
        generatedBy: req.user.id,
      })
      .returning();

    // Log activity
    await db.insert(activityLog).values({
      userId: req.user.id,
      activityType: "report_generated",
      entityType: "report",
      entityId: newReport.id,
      description: `Generated ${newReport.reportType} report: ${newReport.title}`,
      ipAddress: req.ip,
    });

    res.status(201).json({
      success: true,
      data: { report: newReport },
      message: "Report generated successfully",
    });
  })
);

export default router;
