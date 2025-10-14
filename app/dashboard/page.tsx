// File: app/dashboard/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import prisma from "@/lib/prisma";
import { DetailedReviewReport } from "@/lib/llm";
import { FileText, Star, BarChart2 } from "lucide-react";
import Link from "next/link";

// Helper to safely parse and handle both old and new report formats
function parseReport(report: any): DetailedReviewReport | null {
  try {
    let parsedReport: any;
    if (typeof report === 'object' && report !== null) {
      parsedReport = report;
    } else { return null; }

    // This handles both old ("sections") and new ("improvementSuggestions") data
    if (parsedReport.sections && !parsedReport.improvementSuggestions) {
      parsedReport.improvementSuggestions = parsedReport.sections.map((s: any) => ({
        severity: 'MEDIUM',
        title: s.title,
        description: s.feedback,
        lineNumber: 0, // Old format didn't have line numbers
      }));
    }

    if (!Array.isArray(parsedReport.improvementSuggestions)) {
      parsedReport.improvementSuggestions = [];
    }
    
    return parsedReport as DetailedReviewReport;
  } catch (e) {
    console.error("Failed to parse report:", e);
    return null;
  }
}

export default async function DashboardPage() {
  const reviews = await prisma.review.findMany({
    orderBy: {
      createdAt: 'desc', // Show the newest reports first
    },
  });

  // Calculate stats for the top cards
  const totalReviews = reviews.length;
  const averageScore = reviews.length > 0
    ? (reviews.map(r => parseReport(r.report)?.overallScore || 0).reduce((a, b) => a + b, 0) / reviews.length).toFixed(1)
    : 'N/A';

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <p className="text-slate-600">Comprehensive overview of your code review history.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
            <BarChart2 className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalReviews}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <Star className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{averageScore}<span className="text-xl text-slate-500">/100</span></div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Analysis Reports List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Analysis Reports</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {reviews.map((review) => {
            const report = parseReport(review.report);
            if (!report) return null; // Skip rendering if report is invalid

            return (
              <Link key={review.id} href={`/review/${review.id}`} className="block">
                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <FileText className="h-8 w-8 text-purple-500" />
                    <div>
                      <p className="font-semibold text-slate-800">{review.fileName}</p>
                      <p className="text-sm text-slate-500">
                        {report.language || 'N/A'} • {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                      <p className="font-bold text-lg">{report.overallScore.toFixed(0)} <span className="text-sm font-normal text-slate-500">/ 100</span></p>
                      <p className="text-sm text-slate-500">{report.issuesFound} issues</p>
                  </div>
                </div>
              </Link>
            );
          })}
          {reviews.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              <p>No reports found.</p>
              <Link href="/" className="text-purple-600 hover:underline">
                Upload your first file to get started!
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}