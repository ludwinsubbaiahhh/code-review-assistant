// File: components/Header.tsx
import { FileUp, LayoutDashboard, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const Header = () => {
  return (
    <header className="w-full bg-white/30 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between h-16 max-w-5xl">
        <Link href="/" className="flex items-center gap-2">
          <Lightbulb className="h-6 w-6 text-purple-600" />
          <h1 className="text-xl font-bold text-slate-800">CodeReview AI</h1>
        </Link>
        <nav className="flex items-center gap-2">
          <Button variant="ghost" asChild>
            <Link href="/">
              <FileUp className="h-4 w-4 mr-2" /> Upload Code
            </Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/dashboard">
              <LayoutDashboard className="h-4 w-4 mr-2" /> Dashboard
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
};