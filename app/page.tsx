// File: app/page.tsx
'use client';

import { useState } from 'react';
import { DetailedReviewReport } from '../lib/llm'; // Import the new type
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
  const [reviewReport, setReviewReport] = useState<DetailedReviewReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // No changes needed in handleFileChange or handleSubmit
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) setSelectedFile(event.target.files[0]);
  };
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedFile) { setError('Please select a file to review.'); return; }
    setIsLoading(true);
    setError('');
    setReviewReport(null);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const codeContent = e.target?.result as string;
      const fileName = selectedFile.name;
      try {
        const response = await fetch('/api/review', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ fileName, codeContent }),
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

  return (
    <main className="flex flex-col items-center p-8 font-sans">
      <div className="w-full max-w-4xl">
        {!reviewReport && (
          <>
            <h1 className="text-4xl font-bold text-center mb-2 text-slate-800">AI-Powered Code Analysis</h1>
            <p className="text-slate-600 text-center mb-8">Upload your source code to get an instant review.</p>
          </>
        )}
        
        <Card className="mb-8 shadow-lg">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="flex items-center gap-4">
              <label htmlFor="file-upload" className="flex-1">
                <div className="flex items-center gap-2 p-2 border-2 border-dashed rounded-md cursor-pointer hover:bg-slate-50">
                  <FileUp className="h-5 w-5 text-slate-500" />
                  <span className="text-sm text-slate-600">{selectedFile ? selectedFile.name : 'Click to upload a source file'}</span>
                </div>
                <input id="file-upload" type="file" onChange={handleFileChange} required className="hidden" />
              </label>
              <Button type="submit" disabled={isLoading || !selectedFile} className="bg-purple-600 hover:bg-purple-700 px-8">
                {isLoading ? 'Analyzing...' : 'Start AI Analysis'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {error && <Card className="bg-red-50 border-red-200"><CardContent className="p-4 text-center text-red-700">{error}</CardContent></Card>}

        {reviewReport && (
          <div className="space-y-6">
            <Card>
                <CardHeader><CardTitle className="text-sm font-medium">Overall Score</CardTitle></CardHeader>
                <CardContent><div className="text-3xl font-bold">{reviewReport.overallScore}<span className="text-xl text-slate-500">/100</span></div><p className="text-sm text-slate-600 mt-1">{reviewReport.summary}</p></CardContent>
            </Card>

            {/* Map over the detailed analysis sections */}
            {reviewReport.detailedAnalysis.map((section) => (
              <Card key={section.category}>
                <CardHeader><CardTitle className="text-lg">{section.category}</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {section.issues.length > 0 ? (
                    section.issues.map((issue, index) => (
                      <div key={index} className="flex items-start gap-4 p-4 border rounded-md">
                        <Badge variant={getBadgeVariant(issue.severity)}>{issue.severity}</Badge>
                        <div>
                          <h3 className="font-semibold">{issue.title}</h3>
                          <p className="text-sm text-slate-600 mb-2">{issue.description}</p>
                          <div className="text-xs text-slate-500 mb-2 flex items-center gap-1"><Code className="h-3 w-3" /><span>Line {issue.lineNumber}</span></div>
                          <pre className="bg-slate-100 p-2 rounded-md text-xs font-mono">{issue.recommendation}</pre>
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
        )}
      </div>
    </main>
  );
}