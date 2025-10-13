// File: lib/llm.ts
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function getCodeReview(codeContent: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // Fast, powerful, and cost-effective
      messages: [
        {
          role: "system",
          content: "You are an expert code reviewer. Analyze the following code for readability, modularity, best practices, and potential bugs. Provide a structured review in Markdown format with specific suggestions for improvement."
        },
        {
          role: "user",
          content: `Please review the following code:\n\`\`\`\n${codeContent}\n\`\`\``
        }
      ],
    });
    return response.choices[0].message.content || "Could not generate a review.";
  } catch (error) {
    console.error('Error getting code review from OpenAI:', error);
    throw new Error('Failed to get review from AI model.');
  }
}