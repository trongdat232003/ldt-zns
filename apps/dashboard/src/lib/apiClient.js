import { supabase } from './supabase';

// API Backend URL
// For Vercel: set VITE_API_URL to Render domain (e.g., https://ldt-zns.onrender.com)
// For local: defaults to localhost
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3456';
const API_PREFIX = '/api';

export async function apiRequest(path, { method = 'GET', body } = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.access_token) {
    throw new Error('Không tìm thấy token đăng nhập. Vui lòng đăng nhập lại.');
  }

  const res = await fetch(`${BASE_URL}${API_PREFIX}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const json = await res.json().catch(() => null);
  if (!res.ok) {
    // Auto sign out on 401/403 — triggers AuthContext redirect to /login
    if (res.status === 401 || res.status === 403) {
      await supabase.auth.signOut();
      throw new Error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
    }
    throw new Error(json?.error || json?.message || 'Đã có lỗi xảy ra khi gọi API.');
  }
  return json;
}
