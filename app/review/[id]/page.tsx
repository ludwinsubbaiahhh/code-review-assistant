// File: app/review/[id]/page.tsx
import prisma from "@/lib/prisma";
import { DetailedReviewReport } from "@/lib/llm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Code, FileText, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

const getBadgeVariant = (severity: 'HIGH' | 'MEDIUM' | 'LOW'): "destructive" | "default" | "secondary" => {
  switch (severity) {
    case 'HIGH': return 'destructive';
    case 'MEDIUM': return 'default';
    case 'LOW': return 'secondary';
  }
};

export default async function ReviewDetailPage({ params }: { params: { id: string } }) {
  const review = await prisma.review.findUnique({ where: { id: params.id } });
  if (!review) notFound();
  
  const report = review.report as any as DetailedReviewReport;
  if (!report) {
      return <div>Error: Report data is missing or corrupted.</div>;
  }

  const totalIssues = report.detailedAnalysis?.reduce((acc, section) => acc + (section.issues?.length || 0), 0) || 0;

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
      
      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Overall Score</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">{report.overallScore}<span className="text-xl text-slate-500">/100</span></div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Issues Found</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">{totalIssues}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Language</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">{report.language}</div></CardContent></Card>
      </div>
      
      {/* --- THIS IS THE NEW PART --- */}
      {/* New Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Code Display */}
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle className="text-lg">Reviewed Code</CardTitle></CardHeader>
          <CardContent>
            <pre className="bg-slate-100 p-4 rounded-md text-xs font-mono max-h-[80vh] overflow-y-auto">{review.code}</pre>
          </CardContent>
        </Card>

        {/* Right Column: Detailed Analysis */}
        <div className="space-y-6 lg:col-span-1">
          {report.detailedAnalysis?.map((section) => (
            <Card key={section.category}>
              <CardHeader><CardTitle className="text-lg">{section.category}</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {section.issues && section.issues.length > 0 ? (
                  section.issues.map((issue, index) => (
                    <div key={index} className="flex items-start gap-4 p-4 border rounded-md">
                      <Badge variant={getBadgeVariant(issue.severity)}>{issue.severity}</Badge>
                      <div className="min-w-0">
                        <h3 className="font-semibold">{issue.title}</h3>
                        <p className="text-sm text-slate-600 mb-2 break-words">{issue.description}</p>
                        <div className="text-xs text-slate-500 mb-2 flex items-center gap-1"><Code className="h-3 w-3" /><span>Line {issue.lineNumber}</span></div>
                        <pre className="bg-slate-100 p-2 rounded-md text-xs font-mono whitespace-pre-wrap break-words">{issue.recommendation}</pre>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 text-center py-4">No issues found in this category.</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}