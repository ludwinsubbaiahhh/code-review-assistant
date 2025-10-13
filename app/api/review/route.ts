// File: app/api/review/route.ts
import { NextResponse } from 'next/server';
import { getCodeReview } from '@/lib/llm'; // Using @ alias for the lib folder

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fileName, codeContent } = body;

    if (!fileName || !codeContent) {
      return NextResponse.json({ error: 'File name and code content are required.' }, { status: 400 });
    }

    // --- THIS IS THE NEW PART ---
    // Call the Gemini API to get a real review
    const reviewReport = await getCodeReview(codeContent);
    // --- END OF NEW PART ---

    // We will add database logic here in the next step.

    return NextResponse.json({ report: reviewReport }, { status: 200 });

  } catch (error) {
    console.error('Error in review API:', error);
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
}