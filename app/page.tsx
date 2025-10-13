// File: app/page.tsx
'use client';

import { useState } from 'react';

export default function HomePage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  // --- NEW ---
  // New state to store the file's content as a string
  const [codeContent, setCodeContent] = useState('');
  // --- END NEW ---
  const [reviewReport, setReviewReport] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedFile) {
      setError('Please select a file to review.');
      return;
    }

    setIsLoading(true);
    setError('');
    setReviewReport('');
    // --- NEW ---
    // Clear previous code content on new submission
    setCodeContent('');
    // --- END NEW ---

    const reader = new FileReader();

    reader.onload = async (e) => {
      const fileContent = e.target?.result as string;
      const fileName = selectedFile.name;

      // --- NEW ---
      // Set the code content state so we can display it
      setCodeContent(fileContent);
      // --- END NEW ---

      try {
        const response = await fetch('/api/review', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          // Send the file's content in the request body
          body: JSON.stringify({ fileName, codeContent: fileContent }),
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

    reader.onerror = () => {
      setError('Failed to read the file.');
      setIsLoading(false);
    };

    reader.readAsText(selectedFile);
  };

  return (
    <main className="flex min-h-screen flex-col items-center bg-gray-900 text-white p-8">
      <h1 className="text-4xl font-bold mb-6">AI Code Review Assistant</h1>
      
      <form onSubmit={handleSubmit} className="w-full max-w-2xl bg-gray-800 p-6 rounded-lg shadow-md">
        <div className="mb-6">
          <label htmlFor="file-upload" className="block text-sm font-medium mb-2">Source Code File</label>
          <input
            id="file-upload"
            type="file"
            onChange={handleFileChange}
            required
            className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
          />
        </div>
        
        <button
          type="submit"
          disabled={isLoading || !selectedFile}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-500 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Analyzing...' : 'Review My Code'}
        </button>
      </form>
      
      {error && <div className="mt-6 w-full max-w-2xl bg-red-900 border border-red-700 p-4 rounded text-center">{error}</div>}
      
      {/* --- NEW --- */}
      {/* This block will now display the uploaded code */}
      {codeContent && (
        <div className="mt-6 w-full max-w-2xl bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">Uploaded Code</h2>
          <pre className="bg-gray-900 p-4 rounded whitespace-pre-wrap font-mono text-sm">{codeContent}</pre>
        </div>
      )}
      {/* --- END NEW --- */}
      
      {reviewReport && (
        <div className="mt-6 w-full max-w-2xl bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">Review Report</h2>
          <div className="bg-gray-900 p-4 rounded whitespace-pre-wrap font-sans">{reviewReport}</div>
        </div>
      )}
    </main>
  );
}