// File: lib/llm.ts
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// New, more detailed structure for our report
export interface DetailedReviewReport {
  overallScore: number;
  summary: string;
  language: string;
  detailedAnalysis: {
    category: 'Readability' | 'Modularity & Best Practices' | 'Potential Bugs';
    issues: {
      severity: 'HIGH' | 'MEDIUM' | 'LOW';
      title: string;
      description: string;
      lineNumber: number;
      recommendation: string; // A code snippet showing the fix
    }[];
  }[];
}

export async function getCodeReview(codeContent: string): Promise<DetailedReviewReport> {
  try {
    const prompt = `
      You are an expert code reviewer. Analyze the following code snippet.
      Your response MUST be a single, valid JSON object and nothing else.
      The JSON object must follow this exact structure, with three distinct analysis sections:
      {
        "overallScore": number (a score from 0 to 100),
        "summary": "string" (A brief 1-2 sentence summary of the code's quality),
        "language": "string" (the detected programming language),
        "detailedAnalysis": [
          {
            "category": "Readability",
            "issues": [
              {
                "severity": "HIGH" | "MEDIUM" | "LOW",
                "title": "string" (Short title for the readability issue),
                "description": "string" (Detailed explanation of the issue),
                "lineNumber": number,
                "recommendation": "string" (A code snippet showing the recommended change, e.g., 'const userAccountBalance = 1000; // Instead of: const user_acc_bal = 1000;')
              }
            ]
          },
          {
            "category": "Modularity & Best Practices",
            "issues": [
              {
                "severity": "HIGH" | "MEDIUM" | "LOW",
                "title": "string" (Short title for the modularity issue),
                "description": "string" (Detailed explanation),
                "lineNumber": number,
                "recommendation": "string" (A code snippet showing the fix)
              }
            ]
          },
          {
            "category": "Potential Bugs",
            "issues": [
              {
                "severity": "HIGH" | "MEDIUM" | "LOW",
                "title": "string" (Short title for the potential bug),
                "description": "string" (Detailed explanation),
                "lineNumber": number,
                "recommendation": "string" (A code snippet showing the fix)
              }
            ]
          }
        ]
      }
      If a category has no issues, return an empty "issues" array for it.

      Code to review:
      \`\`\`
      ${codeContent}
      \`\`\`
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        { role: "system", content: "You are an expert code reviewer that only responds with valid JSON." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
    });

    const jsonResponse = response.choices[0].message.content;
    if (!jsonResponse) {
      throw new Error("AI returned an empty response.");
    }
    
    return JSON.parse(jsonResponse) as DetailedReviewReport;

  } catch (error) {
    console.error('Error getting code review from OpenAI:', error);
    throw new Error('Failed to get review from AI model.');
  }
}