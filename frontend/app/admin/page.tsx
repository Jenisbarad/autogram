'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth, User } from '@/lib/AuthContext';

export default function AdminDashboard() {
    const { user } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [invites, setInvites] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchData = async () => {
        try {
            const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
            const [usersRes, invitesRes] = await Promise.all([
                axios.get(`${backendUrl}/api/admin/users`, { withCredentials: true }),
                axios.get(`${backendUrl}/api/admin/invites`, { withCredentials: true })
            ]);
            setUsers(usersRes.data.users);
            setInvites(invitesRes.data.invites);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to fetch admin data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user && user.role === 'admin') {
            fetchData();
        }
    }, [user]);

    const handleApprove = async (id: string) => {
        try {
            await axios.post(`http://localhost:4000/api/admin/users/${id}/approve`, {}, { withCredentials: true });
            fetchData();
        } catch (err) {
            alert('Failed to approve');
        }
    };

    const handleReject = async (id: string) => {
        if (!confirm('Are you sure you want to reject this user?')) return;
        try {
            await axios.post(`http://localhost:4000/api/admin/users/${id}/reject`, {}, { withCredentials: true });
            fetchData();
        } catch (err) {
            alert('Failed to reject');
        }
    };

    const generateInvite = async () => {
        if (!confirm('This will invalidate all current invites. Generate new?')) return;
        try {
            await axios.post('http://localhost:4000/api/admin/invites/generate', {}, { withCredentials: true });
            fetchData();
        } catch (err) {
            alert('Failed to generate invite');
        }
    };

    if (!user || user.role !== 'admin') {
        return <div className="p-8 text-red-500">Access Denied. Admins only.</div>;
    }

    if (loading) return <div className="p-8 text-gray-400">Loading...</div>;

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold text-white mb-6">Admin Dashboard</h1>

            {error && <div className="bg-red-500/10 text-red-500 p-4 rounded-lg">{error}</div>}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* User approvals */}
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                    <h2 className="text-xl font-bold text-white mb-4">User Management</h2>
                    <div className="space-y-4">
                        {users.map((u) => (
                            <div key={u.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700/50">
                                <div>
                                    <div className="font-medium text-gray-200">{u.email}</div>
                                    <div className="text-sm mt-1">
                                        Status: 
                                        <span className={`ml-2 px-2 py-0.5 rounded text-xs font-bold \${
                                            u.status === 'approved' ? 'bg-green-500/20 text-green-400' : 
                                            u.status === 'rejected' ? 'bg-red-500/20 text-red-400' : 
                                            'bg-yellow-500/20 text-yellow-400'
                                        }`}>
                                            {u.status.toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">Role: {u.role}</div>
                                </div>
                                
                                {u.status === 'pending' && (
                                    <div className="flex gap-2 mt-4 md:mt-0">
                                        <button 
                                            onClick={() => handleApprove(u.id)}
                                            className="px-3 py-1.5 bg-green-500/10 hover:bg-green-500/20 text-green-500 text-sm font-medium rounded transition border border-green-500/20"
                                        >
                                            Approve
                                        </button>
                                        <button 
                                            onClick={() => handleReject(u.id)}
                                            className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-sm font-medium rounded transition border border-red-500/20"
                                        >
                                            Reject
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                        {users.length === 0 && <div className="text-gray-500">No users found.</div>}
                    </div>
                </div>

                {/* Invite Management */}
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-white">Invite Codes</h2>
                        <button 
                            onClick={generateInvite}
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium rounded-lg transition"
                        >
                            Generate New Code
                        </button>
                    </div>

                    <div className="space-y-4">
                        {invites.map((inv) => (
                            <div key={inv.id} className="p-4 bg-gray-800/50 rounded-lg border border-gray-700/50">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="font-mono text-xl text-purple-400 tracking-wider bg-purple-500/10 inline-block px-3 py-1 rounded">
                                            {inv.code}
                                        </div>
                                        <div className="mt-2 text-sm">
                                            <span className={`px-2 py-0.5 rounded text-xs font-bold \${
                                                inv.is_active ? 'bg-green-500/20 text-green-400' : 'bg-gray-600/20 text-gray-400'
                                            }`}>
                                                {inv.is_active ? 'ACTIVE' : 'INACTIVE'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-xs text-gray-500 text-right">
                                        Created: {new Date(inv.created_at).toLocaleDateString()}
                                    </div>
                                </div>
                                <div className="mt-4 border-t border-gray-700 pt-3">
                                    <h4 className="text-xs font-semibold text-gray-400 uppercase mb-2">Usage History</h4>
                                    {inv.usages?.length > 0 ? (
                                        <ul className="space-y-1">
                                            {inv.usages.map((u: any, i: number) => (
                                                <li key={i} className="text-sm flex justify-between">
                                                    <span className="text-gray-300">{u.email}</span>
                                                    <span className="text-gray-500 text-xs">{new Date(u.used_at).toLocaleDateString()}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <div className="text-sm text-gray-600">No usages yet.</div>
                                    )}
                                </div>
                            </div>
                        ))}
                         {invites.length === 0 && <div className="text-gray-500">No invite codes generated yet.</div>}
                    </div>
                </div>
            </div>
        </div>
    );
}
