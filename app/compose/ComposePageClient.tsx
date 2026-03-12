'use client';

import { ComposeContainer } from '@/components/composer/ComposeContainer';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function ComposePageClient() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-fuchsia-50">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/">
            <Button
              variant="outline"
              size="icon"
              className="border-pink-300 text-pink-600 hover:bg-pink-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-pink-600">拼好prompt</h1>
        </div>

        {/* Compose Container */}
        <ComposeContainer />
      </div>
    </main>
  );
}
