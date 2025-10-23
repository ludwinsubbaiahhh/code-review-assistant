# CodeReview AI ✨

**CodeReview AI** is a professional, AI-powered platform designed to automate code reviews. It analyzes source code for structure, readability, security, and best practices, providing actionable improvement suggestions in a clear, data-driven dashboard.

[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=openai&logoColor=white)](https://openai.com/)

**Live Demo:** https://code-review-assistant-ak87r55yp-ludwin-subbaiahs-projects.vercel.app/

DEMO VIDEO LINK: https://drive.google.com/file/d/15YizhzswDnsnzymuRZTO_qNG8CyLC45s/view?usp=sharing

![CodeReview AI Homepage](https://github.com/ludwinsubbaiahhh/code-review-assistant/blob/main/home%20page.png?raw=true)

## 🚀 Features

This project successfully implements all core and optional features outlined in the project brief, delivering a complete and polished user experience.

#### Core Features
-   **Source Code File Upload**: Users can upload source code files directly for analysis.
-   **AI-Powered Analysis**: Leverages the OpenAI GPT-4 Turbo model via a backend API for in-depth code review.
-   **Detailed, Categorized Reports**: The AI provides a structured report with an overall score and a breakdown of issues by category:
    -   Readability
    -   Modularity & Best Practices
    -   Potential Bugs
-   **Actionable Improvement Suggestions**: Each identified issue comes with a severity level (High, Medium, Low), a clear description, the relevant line number, and a code snippet demonstrating the recommended fix.
-   **Side-by-Side Code View**: The report page displays the user's code alongside the AI's analysis for easy reference.

#### "Optional" Features (Completed)
-   **Analytics Dashboard**: A comprehensive dashboard provides a historical overview of all past reviews, including key metrics like total reviews and average score.
-   **Persistent Report Storage**: All review reports are saved to a Supabase PostgreSQL database, ensuring data persistence.
-   **View Past Reports**: The dashboard allows users to click on any past report to view its full, detailed analysis page.

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
bash
git clone [https://github.com/ludwinsubbaiahhh/code-review-assistant.git](https://github.com/ludwinsubbaiahhh/code-review-assistant.git)
cd code-review-assistant

**2. Install dependencies: This project uses npm for package management.

Bash

npm install

**3. Set up environment variables: This project requires a Supabase database and an OpenAI API key.

Create a new file in the root directory named .env

Copy the contents of the .env.example file (if you have one) or add the following lines manually:

Code snippet

# 1. Get your connection string from Supabase (Settings > Database > Connection string > Transaction Pooler)
# 2. Make sure to add ?pgbouncer=true to the end of the URL
DATABASE_URL="postgresql://postgres.[your-project-id]:[your-password]@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true"

# 3. Get your API key from OpenAI (https://platform.openai.com/api-keys)
OPENAI_API_KEY="sk-..."

**4. Generate Prisma Client: After setting up your database URL, you must generate the Prisma client to connect to it.

Bash

npx prisma generate

**5. Run the development server:

Bash

npm run dev
The application will now be running on http://localhost:3000.
