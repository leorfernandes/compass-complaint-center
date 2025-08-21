'use client';

import Navigation from '@/components/Navigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation isAdmin={true} />
      
      {/* Main Content */}
      <main className="container mx-auto py-8 px-4">
        {children}
      </main>
    </div>
  );
}
