# CodeReview AI ✨

**CodeReview AI** is a professional, AI-powered platform designed to automate code reviews. It analyzes source code for structure, readability, security, and best practices, providing actionable improvement suggestions in a clear, data-driven dashboard[cite: 2, 3].

[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=openai&logoColor=white)](https://openai.com/)

**Live Demo:** https://code-review-assistant-ak87r55yp-ludwin-subbaiahs-projects.vercel.app/

---

## 🚀 Features

This project successfully implements all core and optional features outlined in the project brief, delivering a complete and polished user experience.

#### Core Features
-   **Source Code File Upload**: Users can upload source code files directly for analysis[cite: 6].
-   **AI-Powered Analysis**: Leverages the OpenAI GPT-4 Turbo model via a backend API for in-depth code review[cite: 11].
-   **Detailed, Categorized Reports**: The AI provides a structured report with an overall score and a breakdown of issues by category:
    -   Readability
    -   Modularity & Best Practices
    -   Potential Bugs
-   **Actionable Improvement Suggestions**: Each identified issue comes with a severity level (High, Medium, Low), a clear description, the relevant line number, and a code snippet demonstrating the recommended fix[cite: 7].
-   **Side-by-Side Code View**: The report page displays the user's code alongside the AI's analysis for easy reference.

#### "Optional" Features (Completed)
-   **Analytics Dashboard**: A comprehensive dashboard provides a historical overview of all past reviews, including key metrics like total reviews and average score[cite: 8].
-   **Persistent Report Storage**: All review reports are saved to a Supabase PostgreSQL database, ensuring data persistence[cite: 12].
-   **View Past Reports**: The dashboard allows users to click on any past report to view its full, detailed analysis page[cite: 8].

## 🛠️ Tech Stack

-   **Framework**: Next.js (App Router)
-   **Language**: TypeScript
-   **Styling**: Tailwind CSS
-   **UI Components**: Shadcn/UI
-   **Database**: Supabase (PostgreSQL)
-   **ORM**: Prisma
-   **AI Integration**: OpenAI API (GPT-4 Turbo)
-   **Deployment**: Vercel

## ⚙️ Getting Started

To run this project locally, follow these steps:

**1. Clone the repository:**
```bash
git clone [https://github.com/ludwinsubbaiahhh/code-review-assistant.git](https://github.com/ludwinsubbaiahhh/code-review-assistant.git)
cd code-review-assistant