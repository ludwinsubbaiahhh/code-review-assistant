// File: app/review/[id]/page.tsx
import prisma from "@/lib/prisma";
import { AdvancedReviewReport } from "@/lib/llm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Code, FileText, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

// Helper to safely parse and handle both old and new report formats
function parseReport(report: any): AdvancedReviewReport | null {
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
    
    return parsedReport as AdvancedReviewReport;
  } catch (e) {
    console.error("Failed to parse report:", e);
    return null;
  }
}

// Helper to determine badge color based on severity
const getBadgeVariant = (severity: 'HIGH' | 'MEDIUM' | 'LOW'): "destructive" | "default" | "secondary" => {
  switch (severity) {
    case 'HIGH': return 'destructive';
    case 'MEDIUM': return 'default';
    case 'LOW': return 'secondary';
  }
};

export default async function ReviewDetailPage({ params }: { params: { id: string } }) {
  const review = await prisma.review.findUnique({
    where: { id: params.id },
  });

  if (!review) {
    notFound(); // If no review is found, show a 404 page
  }

  const report = parseReport(review.report);

  if (!report) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold">Report Error</h1>
        <p className="text-slate-600">The review report data is corrupted or in an old format.</p>
        <Link href="/dashboard" className="text-purple-600 hover:underline mt-4 inline-block">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link href="/dashboard" className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>

      <div className="flex items-baseline gap-4">
        <FileText className="h-8 w-8 text-purple-600" />
        <div>
          <h1 className="text-3xl font-bold">{review.fileName}</h1>
          <p className="text-slate-500">Analysis performed on {new Date(review.createdAt).toLocaleString()}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Overall Score</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold">{report.overallScore}<span className="text-xl text-slate-500">/100</span></div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Issues Found</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold">{report.issuesFound}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Language</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold">{report.language}</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">Improvement Suggestions</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {report.improvementSuggestions.length > 0 ? (
            report.improvementSuggestions.map((issue, index) => (
              <div key={index} className="flex items-start gap-4 p-4 border rounded-md">
                <div className="flex-shrink-0"><Badge variant={getBadgeVariant(issue.severity)}>{issue.severity}</Badge></div>
                <div>
                  <h3 className="font-semibold">{issue.title}</h3>
                  <p className="text-sm text-slate-600 mb-1">{issue.description}</p>
                  <div className="flex items-center gap-1 text-xs text-slate-500"><Code className="h-3 w-3" /><span>Line {issue.lineNumber}</span></div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-slate-500 text-center py-4">No specific improvement suggestions found.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}