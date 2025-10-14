// File: app/page.tsx
'use client';

import { useState } from 'react';
// Import the TypeScript type from our LLM file
import { StructuredReviewReport } from '../lib/llm';

// A simple component for our score "bar graphs"
const ScoreBar = ({ score }: { score: number }) => {
  const getColor = (s: number) => {
    if (s < 50) return 'bg-red-500';
    if (s < 80) return 'bg-yellow-500';
    return 'bg-green-500';
  };
  return (
    <div className="w-full bg-gray-700 rounded-full h-2.5">
      <div
        className={`${getColor(score)} h-2.5 rounded-full`}
        style={{ width: `${score}%` }}
      ></div>
    </div>
  );
};

export default function HomePage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [codeContent, setCodeContent] = useState('');
  // The state now expects our structured report object, or null
  const [reviewReport, setReviewReport] = useState<StructuredReviewReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    // ... (rest of the handleSubmit function is the same, no changes needed here) ...
    event.preventDefault();
    if (!selectedFile) {
      setError('Please select a file to review.');
      return;
    }
    setIsLoading(true);
    setError('');
    setReviewReport(null);
    setCodeContent('');
    const reader = new FileReader();
    reader.onload = async (e) => {
      const fileContent = e.target?.result as string;
      const fileName = selectedFile.name;
      setCodeContent(fileContent);
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
    reader.onerror = () => {
      setError('Failed to read the file.');
      setIsLoading(false);
    };
    reader.readAsText(selectedFile);
  };


  return (
    <main className="flex min-h-screen flex-col items-center bg-gray-900 text-white p-8 font-sans">
      <h1 className="text-4xl font-bold mb-6">AI Code Review Assistant</h1>
      
      <form onSubmit={handleSubmit} className="w-full max-w-2xl bg-gray-800 p-6 rounded-lg shadow-md mb-8">
        <div className="mb-6">
          <label htmlFor="file-upload" className="block text-sm font-medium mb-2">Source Code File</label>
          <input id="file-upload" type="file" onChange={handleFileChange} required className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"/>
        </div>
        <button type="submit" disabled={isLoading || !selectedFile} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-500 disabled:cursor-not-allowed">
          {isLoading ? 'Analyzing...' : 'Review My Code'}
        </button>
      </form>
      
      {error && <div className="w-full max-w-4xl bg-red-900 border border-red-700 p-4 rounded text-center">{error}</div>}
      
      {reviewReport && (
        <div className="w-full max-w-4xl space-y-6">
          {/* Overall Score Section */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-md">
             <h2 className="text-2xl font-bold mb-4">Overall Code Health</h2>
             <div className="flex items-center gap-4">
                <div className="text-5xl font-bold text-green-400">{reviewReport.overallScore}<span className="text-2xl text-gray-400">/100</span></div>
                <p className="text-gray-300 flex-1">{reviewReport.summary}</p>
             </div>
          </div>

          {/* Code and Sections Side-by-Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left side: Uploaded Code */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold mb-4">Uploaded Code</h2>
              <pre className="bg-gray-900 p-4 rounded whitespace-pre-wrap font-mono text-sm max-h-96 overflow-y-auto">{codeContent}</pre>
            </div>
            {/* Right side: Detailed Sections */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-md space-y-6">
              <h2 className="text-xl font-bold mb-2">Detailed Analysis</h2>
              {reviewReport.sections.map((section, index) => (
                <div key={index}>
                  <div className="flex justify-between items-baseline mb-2">
                    <h3 className="font-semibold">{section.title}</h3>
                    <span className="font-bold text-lg">{section.score}<span className="text-xs text-gray-400">/100</span></span>
                  </div>
                  <ScoreBar score={section.score} />
                  <p className="text-sm text-gray-300 mt-2">{section.feedback}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}