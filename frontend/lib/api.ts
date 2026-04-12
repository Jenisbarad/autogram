const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

// ─── Generic fetch wrapper ─────────────────────────────────────────────────────
async function apiFetch(path: string, options: RequestInit = {}) {
    const res = await fetch(`${BACKEND_URL}${path}`, {
        headers: { 'Content-Type': 'application/json', ...options.headers },
        credentials: 'include', // Important: send cookies for auth
        ...options,
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error || `API error: ${res.status}`);
    }
    return res.json();
}

// ─── Accounts ─────────────────────────────────────────────────────────────────
export async function getAccounts() {
    return apiFetch('/accounts');
}

export async function getAccount(id: string | number) {
    return apiFetch(`/accounts/${id}`);
}

export async function getAccountBySlug(slug: string) {
    return apiFetch(`/accounts/slug/${slug}`);
}

export async function createAccount(data: Record<string, unknown>) {
    return apiFetch('/accounts/add', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

export async function updateAccount(id: string | number, data: Record<string, unknown>) {
    return apiFetch(`/accounts/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
}

export async function deleteAccount(id: string | number) {
    return apiFetch(`/accounts/${id}`, { method: 'DELETE' });
}

// ─── Posts ────────────────────────────────────────────────────────────────────
export async function getAccountPosts(accountId: string | number, status = 'pending', limit = 20, offset = 0) {
    return apiFetch(`/accounts/${accountId}/posts?status=${status}&limit=${limit}&offset=${offset}`);
}

export async function getAllPosts(params: Record<string, string> = {}) {
    const qs = new URLSearchParams(params).toString();
    return apiFetch(`/posts${qs ? `?${qs}` : ''}`);
}

export async function updateCaption(postId: string | number, caption: string, hashtags: string) {
    return apiFetch(`/posts/${postId}/caption`, {
        method: 'PATCH',
        body: JSON.stringify({ caption, hashtags }),
    });
}

// ─── Content Discovery ────────────────────────────────────────────────────────
export async function findContent(accountId: string | number, platform: string = 'both') {
    return apiFetch('/find-content', {
        method: 'POST',
        body: JSON.stringify({ account_id: accountId, platform }),
    });
}

// ─── Publish / Reject ─────────────────────────────────────────────────────────
export async function publishPost(postId: string | number) {
    return apiFetch('/publish/publish-post', {
        method: 'POST',
        body: JSON.stringify({ post_id: postId }),
    });
}

export async function rejectPost(postId: string | number) {
    return apiFetch('/publish/reject-post', {
        method: 'POST',
        body: JSON.stringify({ post_id: postId }),
    });
}

// ─── Analytics ────────────────────────────────────────────────────────────────
export async function getAnalytics(accountId?: string | number) {
    const qs = accountId ? `?account_id=${accountId}` : '';
    return apiFetch(`/analytics${qs}`);
}
