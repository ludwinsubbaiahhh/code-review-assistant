// File: app/api/review/route.ts
import { NextResponse } from 'next/server';
import { getCodeReview } from '@/lib/llm';
import prisma from '@/lib/prisma'; // --- NEW: Import our Prisma client

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fileName, codeContent } = body;

    if (!fileName || !codeContent) {
      return NextResponse.json({ error: 'File name and code content are required.' }, { status: 400 });
    }
    
    // Call the OpenAI API to get a real review
    const reviewReport = await getCodeReview(codeContent);

    // --- NEW: Save the report to the database ---
    try {
      await prisma.review.create({
        data: {
          fileName: fileName,
          code: codeContent,
          report: reviewReport, // Prisma automatically handles converting the JS object to a JSON type for the DB
        },
      });
    } catch (dbError) {
      console.error("Database error:", dbError);
      // We can still return the report to the user even if saving fails,
      // so we don't throw an error here.
    }
    // --- END OF NEW PART ---
    
    return NextResponse.json({ report: reviewReport }, { status: 200 });

  } catch (error) {
    console.error('Error in review API:', error);
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
}