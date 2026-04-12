'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getAccounts } from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';

interface Account {
    id: number;
    page_name: string;
    username: string;
    slug: string;
    category: string;
    pending_count: number;
}

export default function Sidebar() {
    const pathname = usePathname();
    const [accounts, setAccounts] = useState<Account[]>([]);
    const { user } = useAuth();

    useEffect(() => {
        getAccounts()
            .then(data => setAccounts(data.accounts || []))
            .catch(() => { });
    }, []);

    const navLinks = [
        { href: '/', label: 'Home', icon: '🏠' },
        { href: '/accounts/new', label: 'Add Account', icon: '➕' },
        { href: '/analytics', label: 'Analytics', icon: '📊' },
    ];

    if (user?.role === 'admin') {
        navLinks.push({ href: '/admin', label: 'Admin Dashboard', icon: '🛡️' });
    }

    const categoryIcons: Record<string, string> = {
        nature: '🌿', cricket: '🏏', memes: '😂', quotes: '💬',
        travel: '✈️', food: '🍕', fitness: '💪', music: '🎵',
        fashion: '👗', tech: '💻', default: '📱',
    };

    const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 flex flex-col z-50"
            style={{ background: 'var(--bg-secondary)', borderRight: '1px solid var(--border)' }}>

            {/* Logo */}
            <div className="p-5 border-b" style={{ borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
                        style={{ background: 'var(--accent)' }}>📷</div>
                    <div>
                        <div className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>InstaAutogram</div>
                        <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Multi-Page Manager</div>
                    </div>
                </div>
            </div>

            {/* Nav */}
            <nav className="p-3 flex-1 overflow-y-auto">
                {/* Main links */}
                <div className="mb-4">
                    <div className="px-2 mb-2 text-xs font-semibold uppercase tracking-wider"
                        style={{ color: 'var(--text-secondary)' }}>Menu</div>
                    {navLinks.map(link => (
                        <Link key={link.href} href={link.href}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all mb-1"
                            style={{
                                color: isActive(link.href) ? 'var(--text-primary)' : 'var(--text-secondary)',
                                background: isActive(link.href) ? 'var(--accent)' : 'transparent',
                            }}>
                            <span>{link.icon}</span>
                            {link.label}
                        </Link>
                    ))}
                </div>

                {/* Pages */}
                {accounts.length > 0 && (
                    <div>
                        <div className="px-2 mb-2 text-xs font-semibold uppercase tracking-wider"
                            style={{ color: 'var(--text-secondary)' }}>Pages</div>
                        {accounts.map(acc => {
                            const icon = categoryIcons[acc.category?.toLowerCase()] || categoryIcons.default;
                            const href = `/dashboard/${acc.slug}`;
                            return (
                                <Link key={acc.id} href={href}
                                    className="flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all mb-1"
                                    style={{
                                        color: isActive(href) ? 'var(--text-primary)' : 'var(--text-secondary)',
                                        background: isActive(href) ? 'rgba(99,102,241,.2)' : 'transparent',
                                    }}>
                                    <span className="flex items-center gap-2">
                                        <span>{icon}</span>
                                        <span className="truncate max-w-[110px]">{acc.page_name}</span>
                                    </span>
                                    {acc.pending_count > 0 && (
                                        <span className="text-xs rounded-full px-1.5 py-0.5 font-bold"
                                            style={{ background: 'var(--accent-yellow)', color: '#000' }}>
                                            {acc.pending_count}
                                        </span>
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                )}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t text-xs" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                <a href="/bull-board" target="_blank" rel="noreferrer"
                    className="flex items-center gap-1.5 hover:text-white transition-colors">
                    <span>⚙️</span> Queue Dashboard
                </a>
            </div>
        </aside>
    );
}
