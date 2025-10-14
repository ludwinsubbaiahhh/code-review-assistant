// File: app/page.tsx
'use client';

import { useState } from 'react';
import { DetailedReviewReport } from '../lib/llm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileUp, Code } from 'lucide-react';

const getBadgeVariant = (severity: 'HIGH' | 'MEDIUM' | 'LOW'): "destructive" | "default" | "secondary" => {
  switch (severity) {
    case 'HIGH': return 'destructive';
    case 'MEDIUM': return 'default';
    case 'LOW': return 'secondary';
  }
};

export default function HomePage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [codeContent, setCodeContent] = useState('');
  const [reviewReport, setReviewReport] = useState<DetailedReviewReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) setSelectedFile(event.target.files[0]);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedFile) { setError('Please select a file to review.'); return; }
    setIsLoading(true);
    setError('');
    setReviewReport(null);
    setCodeContent('');
    const reader = new FileReader();
    reader.onload = async (e) => {
      const fileContent = e.target?.result as string;
      setCodeContent(fileContent);
      const fileName = selectedFile.name;
      try {
        const response = await fetch('/api/review', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ fileName, codeContent: fileContent }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Something went wrong');
        setReviewReport(data.report);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    reader.readAsText(selectedFile);
  };

  // --- THIS IS THE FIX ---
  // Correctly create the allIssues array by mapping the category to each issue
  const allIssues = reviewReport?.detailedAnalysis?.flatMap(section => 
    section.issues.map(issue => ({ ...issue, category: section.category }))
  ) || [];
  const totalIssues = allIssues.length;
  // --- END OF FIX ---

  return (
    <main className="flex flex-col items-center p-8 font-sans">
      <div className="w-full max-w-6xl">
        {!reviewReport && (
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-2 text-slate-800">AI-Powered Code Analysis</h1>
            <p className="text-slate-600 mb-8">Upload your source code to get an instant review.</p>
          </div>
        )}
        
        <Card className="mb-8 shadow-lg max-w-4xl mx-auto">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="flex items-center gap-4">
              <label htmlFor="file-upload" className="flex-1">
                <div className="flex items-center gap-2 p-2 border-2 border-dashed rounded-md cursor-pointer hover:bg-slate-50">
                  <FileUp className="h-5 w-5 text-slate-500" />
                  <span className="text-sm text-slate-600">{selectedFile ? selectedFile.name : 'Click to upload a source file'}</span>
                </div>
                <input id="file-upload" type="file" onChange={handleFileChange} required className="hidden" />
              </label>
              <Button type="submit" disabled={isLoading || !selected.File} className="bg-purple-600 hover:bg-purple-700 px-8">
                {isLoading ? 'Analyzing...' : 'Start AI Analysis'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {error && <Card className="bg-red-50 border-red-200 max-w-4xl mx-auto"><CardContent className="p-4 text-center text-red-700">{error}</CardContent></Card>}

        {reviewReport && selectedFile && (
          <div className="space-y-6">
            <div className="flex items-baseline gap-4">
              <h1 className="text-3xl font-bold">{selectedFile.name}</h1>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Overall Score</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">{reviewReport.overallScore}<span className="text-xl text-slate-500">/100</span></div></CardContent></Card>
              <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Issues Found</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">{totalIssues}</div></CardContent></Card>
              <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Language</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">{reviewReport.language}</div></CardContent></Card>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="lg:col-span-1"><CardHeader><CardTitle className="text-lg">Reviewed Code</CardTitle></CardHeader><CardContent><pre className="bg-slate-100 p-4 rounded-md text-xs font-mono max-h-[80vh] overflow-y-auto">{codeContent}</pre></CardContent></Card>
              <div className="space-y-6 lg:col-span-1">
                {reviewReport.detailedAnalysis.map((section) => (
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
                      ) : ( <p className="text-slate-500 text-center py-4">No issues found in this category.</p> )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            <Card>
              <CardHeader><CardTitle className="text-lg">Consolidated Improvement Suggestions</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {allIssues.length > 0 ? (
                  allIssues.map((issue, index) => (
                    <div key={index} className="flex items-start gap-4 p-4 border rounded-md">
                      <Badge variant={getBadgeVariant(issue.severity)}>{issue.severity}</Badge>
                      <div className="min-w-0">
                        <h3 className="font-semibold">{issue.title} <span className="text-xs text-slate-500">({issue.category})</span></h3>
                        <p className="text-sm text-slate-600 mb-2 break-words">{issue.description}</p>
                        <div className="text-xs text-slate-500 mb-2 flex items-center gap-1"><Code className="h-3 w-3" /><span>Line {issue.lineNumber}</span></div>
                        <pre className="bg-slate-100 p-2 rounded-md text-xs font-mono whitespace-pre-wrap break-words">{issue.recommendation}</pre>
                      </div>
                    </div>
                  ))
                ) : ( <p className="text-slate-500 text-center py-4">No specific improvement suggestions found.</p> )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </main>
  );
} 