import { createFileRoute } from "@tanstack/react-router";
import { getDb } from "@/server/db";
import { requireAuth } from "@/server/require-auth";
import { errorResponse } from "@/server/http";
import { getProjectAnalysis, getProjectCorrelations } from "@/server/project.functions";
import PDFDocument from "pdfkit";
import { stringify } from "csv-stringify/sync";

export const Route = createFileRoute("/api/projects/$projectId/export")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        try {
          const user = await requireAuth(request);
          const url = new URL(request.url);
          const format = url.searchParams.get("format") || "csv";

          const db = getDb();
          const project = await db.project.findFirst({
            where: {
              id: params.projectId,
              organization: {
                ownerId: user.id,
              },
            },
            include: {
              billingRecords: {
                orderBy: { date: "desc" },
              },
            },
          });

          if (!project) {
            return errorResponse("Project not found", 404);
          }

          if (format === "csv") {
            const records = project.billingRecords.map((r) => ({
              Date: r.date.toISOString().split("T")[0],
              Service: r.service,
              Cost: r.cost.toNumber().toFixed(2),
            }));
            const csv = stringify(records, { header: true });

            return new Response(csv, {
              headers: {
                "Content-Type": "text/csv",
                "Content-Disposition": `attachment; filename="${project.name.replace(/\s+/g, "_")}-billing.csv"`,
              },
            });
          } else if (format === "pdf") {
            const analysis = await getProjectAnalysis({ data: project.id });
            const correlations = await getProjectCorrelations({ data: project.id });

            return new Promise((resolve, reject) => {
              const doc = new PDFDocument({ margin: 50 });
              const buffers: Buffer[] = [];

              doc.on("data", buffers.push.bind(buffers));
              doc.on("end", () => {
                const pdfData = Buffer.concat(buffers);
                resolve(
                  new Response(pdfData, {
                    headers: {
                      "Content-Type": "application/pdf",
                      "Content-Disposition": `attachment; filename="${project.name.replace(/\s+/g, "_")}-report.pdf"`,
                    },
                  }),
                );
              });

              // Construct PDF
              doc.fontSize(20).text(`CloudLens AI Report: ${project.name}`, { align: "center" });
              doc.moveDown();

              if (analysis) {
                doc.fontSize(14).text("Cost Overview");
                doc.fontSize(10).text(`Total Cost: $${analysis.totalCost.toFixed(2)}`);
                doc.text(`Average Daily Cost: $${analysis.averageDailyCost.toFixed(2)}`);
                doc.moveDown();

                doc.fontSize(12).text("Service Breakdown");
                analysis.costByService.forEach((s: any) => {
                  doc
                    .fontSize(10)
                    .text(`- ${s.service}: $${s.cost.toFixed(2)} (${s.percentage.toFixed(1)}%)`);
                });
                doc.moveDown();
              }

              if (correlations?.correlations) {
                doc.fontSize(14).text("Correlated Anomalies");
                doc.moveDown(0.5);
                correlations.correlations.forEach((c: any) => {
                  doc
                    .fontSize(10)
                    .fillColor("red")
                    .text(
                      `Spike: ${c.spike.service} increased ${c.spike.percentageIncrease.toFixed(1)}%`,
                    );
                  doc.fillColor("black").text(c.reason);
                  doc.moveDown(0.5);
                });
              }

              doc.end();
            });
          }

          return errorResponse("Invalid format", 400);
        } catch (error: any) {
          if (error instanceof Response) return error;
          return errorResponse(error.message, 400);
        }
      },
    },
  },
});
