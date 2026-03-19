import { ReactNode } from 'react';
import Link from 'next/link';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-950 via-indigo-900 to-purple-900">
      <header className="p-6">
        <Link href="/" className="flex items-center gap-3 w-fit">
          <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center">
            <span className="text-indigo-900 font-black text-lg">B</span>
          </div>
          <span className="text-white font-bold text-xl tracking-tight">Barber</span>
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        {children}
      </main>
      <footer className="p-6 text-center text-indigo-300/60 text-sm">
        GCSE OCR Computer Science AI Tutor
      </footer>
    </div>
  );
}
