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

  const allIssues = report.detailedAnalysis?.flatMap(section =>
    section.issues.map(issue => ({ ...issue, category: section.category }))
  ) || [];
  const totalIssues = allIssues.length;

  return (
    <div className="flex flex-col items-center p-8 font-sans bg-gradient-to-br from-indigo-50 to-purple-50 min-h-screen">
      <div className="w-full max-w-6xl">
        <Link href="/dashboard" className="flex items-center gap-2 text-sm text-slate-600 hover:text-purple-700 mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" />Back to Dashboard
        </Link>
        
        <div className="flex items-baseline gap-4 mb-8 bg-white p-6 rounded-lg shadow-md border-b-4 border-purple-400">
          <FileText className="h-10 w-10 text-purple-600" />
          <div>
            <h1 className="text-4xl font-extrabold text-slate-800">{review.fileName}</h1>
            <p className="text-slate-500">Analysis performed on {new Date(review.createdAt).toLocaleString()}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white rounded-lg shadow-md border-b-4 border-purple-500"><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium text-slate-600">Overall Score</CardTitle></CardHeader><CardContent><div className="text-4xl font-bold text-purple-700">{report.overallScore}<span className="text-xl text-slate-500">/100</span></div></CardContent></Card>
          <Card className="bg-white rounded-lg shadow-md border-b-4 border-indigo-500"><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium text-slate-600">Issues Found</CardTitle></CardHeader><CardContent><div className="text-4xl font-bold text-indigo-700">{totalIssues}</div></CardContent></Card>
          <Card className="bg-white rounded-lg shadow-md border-b-4 border-pink-500"><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium text-slate-600">Language</CardTitle></CardHeader><CardContent><div className="text-4xl font-bold text-pink-700">{report.language}</div></CardContent></Card>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="lg:col-span-1 bg-white rounded-lg shadow-md"><CardHeader className="bg-purple-100 rounded-t-lg p-4"><CardTitle className="text-lg font-semibold text-purple-800">Reviewed Code</CardTitle></CardHeader><CardContent className="p-4"><pre className="bg-slate-50 p-4 rounded-md text-xs font-mono max-h-[80vh] overflow-y-auto border border-slate-200">{review.code}</pre></CardContent></Card>
          <div className="space-y-6 lg:col-span-1">
            {report.detailedAnalysis?.map((section) => (
              <Card key={section.category} className="bg-white rounded-lg shadow-md">
                <CardHeader className="bg-indigo-50 rounded-t-lg p-4">
                  <CardTitle className="text-lg font-semibold text-indigo-800">{section.category}</CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  {section.issues && section.issues.length > 0 ? (
                    section.issues.map((issue, index) => (
                      <div key={index} className="flex items-start gap-4 p-4 border border-indigo-200 bg-indigo-50 rounded-md shadow-sm">
                        <Badge variant={getBadgeVariant(issue.severity)} className="min-w-[70px] justify-center shadow-sm">{issue.severity}</Badge>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-slate-800">{issue.title}</h3>
                          <p className="text-sm text-slate-600 mb-1 break-words">{issue.description}</p>
                          <div className="text-xs text-slate-500 flex items-center gap-1"><Code className="h-3 w-3" /><span>Line {issue.lineNumber}</span></div>
                        </div>
                      </div>
                    ))
                  ) : ( <p className="text-slate-500 text-center py-4">No issues found in this category.</p> )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Card className="bg-white rounded-lg shadow-md">
          <CardHeader className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-t-lg p-4">
            <CardTitle className="text-lg font-semibold text-purple-800">Consolidated Improvement Suggestions</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            {allIssues.length > 0 ? (
              allIssues.map((issue, index) => (
                <div key={index} className="p-4 border border-purple-200 bg-purple-50 rounded-md shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-slate-800">{issue.title}</h3>
                    <Badge variant={getBadgeVariant(issue.severity)} className="min-w-[70px] justify-center shadow-sm">{issue.severity}</Badge>
                  </div>
                  <p className="text-sm text-slate-600 mb-2 break-words">{issue.description}</p>
                  <div className="text-xs text-slate-500 mb-2 flex items-center gap-1"><Code className="h-3 w-3" /><span>Line {issue.lineNumber}</span></div>
                  <pre className="bg-purple-100 p-3 rounded-md text-sm font-mono whitespace-pre-wrap break-words border border-purple-200">
                    {issue.recommendation}
                  </pre>
                </div>
              ))
            ) : ( <p className="text-slate-500 text-center py-4">No specific improvement suggestions found.</p> )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}