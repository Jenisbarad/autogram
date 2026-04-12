'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter, usePathname } from 'next/navigation';

export interface User {
    id: string;
    email: string;
    role: 'user' | 'admin';
    status: 'pending' | 'approved' | 'rejected';
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (user: User) => void;
    logout: () => void;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    const refreshUser = async () => {
        try {
            const res = await axios.get('http://localhost:4000/api/auth/me', { withCredentials: true });
            setUser(res.data.user);
        } catch (error) {
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        refreshUser();
    }, []);

    const login = (userData: User) => {
        setUser(userData);
        router.push('/');
    };

    const logout = async () => {
        try {
            const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
            await axios.post(`${backendUrl}/api/auth/logout`, {}, { withCredentials: true });
        } catch (e) {
            console.error(e);
        }
        setUser(null);
        router.push('/login');
    };

    // Route Protection Logic
    useEffect(() => {
        if (!isLoading) {
            const publicPaths = ['/login', '/register'];
            if (!user && !publicPaths.includes(pathname)) {
                router.push('/login');
            } else if (user && user.status !== 'approved' && !publicPaths.includes(pathname)) {
                if(user.status === 'pending') {
                    router.push('/login?pending=true');
                } else {
                    router.push('/login?rejected=true');
                }
            } else if (user && publicPaths.includes(pathname) && user.status === 'approved') {
                router.push('/');
            }
        }
    }, [user, isLoading, pathname, router]);

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
