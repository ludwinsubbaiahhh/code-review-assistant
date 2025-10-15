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

  const allIssues = reviewReport?.detailedAnalysis?.flatMap(section =>
    section.issues.map(issue => ({ ...issue, category: section.category }))
  ) || [];
  const totalIssues = allIssues.length;

  return (
    <main className="flex flex-col items-center p-8 font-sans bg-gradient-to-br from-indigo-50 to-purple-50 min-h-screen">
      <div className="w-full max-w-6xl">
        {!reviewReport && (
          <div className="text-center bg-white p-10 rounded-xl shadow-lg mb-8">
            <h1 className="text-5xl font-extrabold mb-4 text-purple-800 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">AI-Powered Code Analysis</h1>
            <p className="text-lg text-slate-700">Upload your source code to get an instant, intelligent review.</p>
          </div>
        )}
        
        <Card className="mb-8 shadow-xl max-w-4xl mx-auto border-purple-200">
          <CardContent className="p-6 bg-white rounded-lg">
            <form onSubmit={handleSubmit} className="flex items-center gap-4">
              <label htmlFor="file-upload" className="flex-1">
                <div className="flex items-center gap-3 p-3 border-2 border-dashed border-purple-300 rounded-md cursor-pointer hover:bg-purple-50 transition-colors">
                  <FileUp className="h-6 w-6 text-purple-500" />
                  <span className="text-base text-slate-700">{selectedFile ? selectedFile.name : 'Click to upload a source file'}</span>
                </div>
                <input id="file-upload" type="file" onChange={handleFileChange} required className="hidden" />
              </label>
              <Button type="submit" disabled={isLoading || !selectedFile} className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-2 text-base rounded-md shadow-md transition-all">
                {isLoading ? 'Analyzing...' : 'Start AI Analysis'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {error && <Card className="bg-red-50 border-red-200 max-w-4xl mx-auto shadow-md"><CardContent className="p-4 text-center text-red-700">{error}</CardContent></Card>}

        {reviewReport && selectedFile && (
          <div className="space-y-6">
            <div className="flex items-baseline gap-4 mb-6">
              <h1 className="text-4xl font-extrabold text-slate-800">{selectedFile.name}</h1>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-white rounded-lg shadow-md border-b-4 border-purple-500"><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium text-slate-600">Overall Score</CardTitle></CardHeader><CardContent><div className="text-4xl font-bold text-purple-700">{reviewReport.overallScore}<span className="text-xl text-slate-500">/100</span></div></CardContent></Card>
              <Card className="bg-white rounded-lg shadow-md border-b-4 border-indigo-500"><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium text-slate-600">Issues Found</CardTitle></CardHeader><CardContent><div className="text-4xl font-bold text-indigo-700">{totalIssues}</div></CardContent></Card>
              <Card className="bg-white rounded-lg shadow-md border-b-4 border-pink-500"><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium text-slate-600">Language</CardTitle></CardHeader><CardContent><div className="text-4xl font-bold text-pink-700">{reviewReport.language}</div></CardContent></Card>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
              <Card className="lg:col-span-1 bg-white rounded-lg shadow-md"><CardHeader className="bg-purple-100 rounded-t-lg p-4"><CardTitle className="text-lg font-semibold text-purple-800">Reviewed Code</CardTitle></CardHeader><CardContent className="p-4"><pre className="bg-slate-50 p-4 rounded-md text-xs font-mono max-h-[80vh] overflow-y-auto border border-slate-200">{codeContent}</pre></CardContent></Card>
              
              <div className="space-y-6 lg:col-span-1">
                {reviewReport.detailedAnalysis.map((section) => (
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
        )}
      </div>
    </main>
  );
}