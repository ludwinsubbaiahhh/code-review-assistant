// File: app/page.tsx
'use client'; // This directive is necessary for using React hooks like useState

import { useState } from 'react';

export default function HomePage() {
  const [fileName, setFileName] = useState('');
  const [codeContent, setCodeContent] = useState('');
  const [reviewReport, setReviewReport] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');
    setReviewReport('');

    try {
      const response = await fetch('/api/review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fileName, codeContent }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      setReviewReport(data.report);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center bg-gray-900 text-white p-8">
      <h1 className="text-4xl font-bold mb-6">AI Code Review Assistant</h1>
      
      <form onSubmit={handleSubmit} className="w-full max-w-2xl bg-gray-800 p-6 rounded-lg shadow-md">
        <div className="mb-4">
          <label htmlFor="fileName" className="block text-sm font-medium mb-2">File Name</label>
          <input
            id="fileName"
            type="text"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            placeholder="e.g., app.js"
            required
            className="w-full p-2 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="mb-6">
          <label htmlFor="codeContent" className="block text-sm font-medium mb-2">Paste Your Code Here</label>
          <textarea
            id="codeContent"
            value={codeContent}
            onChange={(e) => setCodeContent(e.target.value)}
            rows={15}
            placeholder="function hello() { console.log('world'); }"
            required
            className="w-full p-2 bg-gray-700 rounded border border-gray-600 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-500"
        >
          {isLoading ? 'Analyzing...' : 'Review My Code'}
        </button>
      </form>
      
      {error && <div className="mt-6 w-full max-w-2xl bg-red-900 border border-red-700 p-4 rounded text-center">{error}</div>}
      
      {reviewReport && (
        <div className="mt-6 w-full max-w-2xl bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">Review Report</h2>
          <pre className="bg-gray-900 p-4 rounded whitespace-pre-wrap font-sans">{reviewReport}</pre>
        </div>
      )}
    </main>
  );
}