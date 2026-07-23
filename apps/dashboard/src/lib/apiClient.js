import { supabase } from './supabase';

// In production, use relative URL (same origin)
// In local development, use explicit localhost
const BASE_URL = import.meta.env.DEV 
  ? 'http://localhost:3456' 
  : ''; // Empty string = same origin
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
    throw new Error(json?.error || json?.message || 'Đã có lỗi xảy ra khi gọi API.');
  }
  return json;
}
