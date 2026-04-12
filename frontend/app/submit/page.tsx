'use client';

import { useState, useEffect } from 'react';

export default function SubmitReelPage() {
    const [accounts, setAccounts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    
    // Form state
    const [accountId, setAccountId] = useState('');
    const [username, setUsername] = useState('jenis_barad');
    const [reelUrl, setReelUrl] = useState('');
    const [message, setMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/submissions/accounts`)
            .then(res => res.json())
            .then(data => {
                setAccounts(data.accounts || []);
                if (data.accounts?.length > 0) {
                    setAccountId(data.accounts[0].id.toString());
                }
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to fetch accounts:', err);
                setMessage({ text: 'Failed to load accounts. Is backend running?', type: 'error' });
                setLoading(false);
            });
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setMessage({ text: '', type: '' });

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/submissions/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    account_id: parseInt(accountId),
                    submitter_username: username.replace('@', ''),
                    reel_url: reelUrl
                }),
            });

            const data = await res.json();
            
            if (res.ok) {
                setMessage({ text: data.message || '✅ Reel submitted successfully! It will be published shortly.', type: 'success' });
                setReelUrl(''); // Clear URL for next submission
            } else {
                setMessage({ text: '❌ Error: ' + (data.error || 'Failed to submit reel'), type: 'error' });
            }
        } catch (err: any) {
            setMessage({ text: '❌ Network error: ' + err.message, type: 'error' });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="p-8 text-center mt-20">Loading accounts...</div>;

    return (
        <div className="min-h-screen bg-[#0B0E14] text-gray-200 flex flex-col items-center py-12 px-4">
            
            <div className="w-full max-w-md bg-[#151A23] rounded-2xl border border-gray-800 shadow-xl overflow-hidden">
                <div className="bg-gradient-to-r from-pink-600 to-purple-600 px-6 py-8 text-center text-white">
                    <h1 className="text-2xl font-bold mb-2">Submit Instagram Reel</h1>
                    <p className="text-white/80 text-sm">Send an external reel for auto-publishing</p>
                </div>

                <div className="p-6">
                    {message.text && (
                        <div className={`mb-6 p-4 rounded-lg text-sm font-medium ${message.type === 'error' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-green-500/10 text-green-500 border border-green-500/20'}`}>
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Target Account</label>
                            <select 
                                value={accountId} 
                                onChange={(e) => setAccountId(e.target.value)}
                                className="w-full bg-[#0B0E14] border border-gray-700 rounded-lg px-4 py-3 text-gray-300 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                                required
                            >
                                {accounts.map(acc => (
                                    <option key={acc.id} value={acc.id}>
                                        {acc.page_name} (@{acc.username})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Your Instagram Username</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-500">@</span>
                                <input 
                                    type="text" 
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="jenis_barad"
                                    className="w-full bg-[#0B0E14] border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-gray-300 placeholder-gray-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all select-all focus:select-auto"
                                    required
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Must be an "Allowed Submitter" for the selected account.</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Reel URL</label>
                            <input 
                                type="url" 
                                value={reelUrl}
                                onChange={(e) => setReelUrl(e.target.value)}
                                placeholder="https://www.instagram.com/reel/..."
                                className="w-full bg-[#0B0E14] border border-gray-700 rounded-lg px-4 py-3 text-gray-300 placeholder-gray-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all select-all focus:select-auto"
                                required
                            />
                        </div>

                        <button 
                            type="submit" 
                            disabled={submitting}
                            className={`w-full mt-4 py-3.5 rounded-lg flex items-center justify-center font-bold text-white transition-all
                                ${submitting 
                                    ? 'bg-purple-600/50 cursor-not-allowed' 
                                    : 'bg-purple-600 hover:bg-purple-500 hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] active:scale-[0.98]'
                                }
                            `}
                        >
                            {submitting ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Processing Reel...
                                </>
                            ) : (
                                'Submit & Auto-Publish'
                            )}
                        </button>
                    </form>
                </div>
            </div>

            <div className="mt-8 text-center text-gray-500 text-sm max-w-sm">
                <p>This form bypasses all quality and viral checks.</p>
                <p>Submitted reels are immediately downloaded and published to the target page.</p>
            </div>
        </div>
    );
}
