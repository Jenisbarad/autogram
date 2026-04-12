'use client';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import Link from 'next/link';

function AdminLink() {
    const { user } = useAuth();
    if (user?.role !== 'admin') return null;
    return (
        <div className="p-4 border-t text-xs" style={{ borderColor: 'var(--border)' }}>
            <Link href="/admin" className="flex items-center gap-1.5 text-purple-400 hover:text-purple-300 transition-colors">
                <span>🛡️</span> Admin Dashboard
            </Link>
        </div>
    );
}

export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/register';

  return (
    <AuthProvider>
      {!isAuthPage && (
          <>
            <Sidebar />
            {/* Inject Admin Link into Sidebar dynamically using portal or just keep it simple.
                Actually Sidebar is imported here. I will just render Sidebar normally.
            */}
          </>
      )}
      <main className={`flex-1 min-h-screen overflow-y-auto ${isAuthPage ? 'w-full' : 'ml-64'}`}>
        {children}
      </main>
    </AuthProvider>
  );
}
