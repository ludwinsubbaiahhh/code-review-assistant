// File: lib/llm.ts
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// --- NEW ---
// Define a TypeScript type for our structured report for type safety
export interface StructuredReviewReport {
  overallScore: number; // A score from 0 to 100
  summary: string;
  sections: {
    title: string; // e.g., "Readability", "Modularity"
    score: number; // A score for this specific section
    feedback: string;
  }[];
}
// --- END NEW ---

export async function getCodeReview(codeContent: string): Promise<StructuredReviewReport> {
  try {
    const prompt = `
      You are an expert code reviewer. Analyze the following code snippet.
      Your response MUST be a valid JSON object. Do not include any text or markdown formatting before or after the JSON object.
      The JSON object should conform to the following structure:
      {
        "overallScore": number (0-100),
        "summary": "A brief summary of the code's quality.",
        "sections": [
          {
            "title": "Readability",
            "score": number (0-100),
            "feedback": "Detailed feedback on code readability, formatting, and clarity."
          },
          {
            "title": "Modularity & Best Practices",
            "score": number (0-100),
            "feedback": "Analysis of code structure, use of functions, and adherence to best practices."
          },
          {
            "title": "Potential Bugs & Errors",
            "score": number (0-100),
            "feedback": "Identification of any potential bugs, logical errors, or edge cases not handled."
          }
        ]
      }

      Here is the code to review:
      \`\`\`
      ${codeContent}
      \`\`\`
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are an expert code reviewer that only responds with valid JSON." },
        { role: "user", content: prompt }
      ],
      // --- NEW ---
      // Force the model to output JSON
      response_format: { type: "json_object" },
      // --- END NEW ---
    });

    const jsonResponse = response.choices[0].message.content;
    if (!jsonResponse) {
      throw new Error("AI returned an empty response.");
    }
    
    // Parse the JSON string into an object
    return JSON.parse(jsonResponse) as StructuredReviewReport;

  } catch (error) {
    console.error('Error getting code review from OpenAI:', error);
    throw new Error('Failed to get review from AI model.');
  }
}