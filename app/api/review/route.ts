// File: app/api/review/route.ts
import { NextResponse } from 'next/server';
import { getCodeReview } from '@/lib/llm';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fileName, codeContent } = body;

    if (!fileName || !codeContent) {
      return NextResponse.json({ error: 'File name and code content are required.' }, { status: 400 });
    }
    
    const reviewReport = await getCodeReview(codeContent);

    // --- NEW: Add this log to debug ---
    console.log("Raw AI Response:", JSON.stringify(reviewReport, null, 2));
    // --- END NEW PART ---

    try {
      await prisma.review.create({
        data: {
          fileName: fileName,
          code: codeContent,
          report: reviewReport as any,
        },
      });
    } catch (dbError) {
      console.error("Database error:", dbError);
    }
    
    return NextResponse.json({ report: reviewReport }, { status: 200 });

  } catch (error) {
    console.error('Error in review API:', error);
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
}