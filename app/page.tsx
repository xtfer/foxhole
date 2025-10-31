import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <main className="text-center space-y-8 max-w-2xl">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold text-white">
            Hell Let Loose CRM
          </h1>
          <p className="text-xl text-slate-300">
            Track your statistics, view leaderboards, and manage your player profile
          </p>
        </div>

        <div className="flex gap-4 justify-center">
          <Link href="/login">
            <Button size="lg" className="text-lg px-8">
              Sign In
            </Button>
          </Link>
          <Link href="/register">
            <Button size="lg" variant="outline" className="text-lg px-8">
              Sign Up
            </Button>
          </Link>
        </div>

        <div className="pt-8 text-slate-400 text-sm">
          <p>Integrated with CRCON API for real-time statistics</p>
        </div>
      </main>
    </div>
  );
}
