/** Supabase Auth + profile-backed role checks for AYSM. No demo identities or client-side passwords. */
import type { AppAuthUser, UserRole, DisbursementOrder } from '../types/accounting';
import { assertSupabaseConfigured, SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from './supabaseConfig';

type AuthSession = { access_token: string; refresh_token: string; expires_at?: number; expires_in?: number; user: { id: string; email?: string; user_metadata?: Record<string, unknown> } };
export const SESSION_KEY = 'aysm_supabase_session_v1';
const ROLE_LABELS: Record<string, string> = {
  president: 'رئيس الجمعية (المدير)', tresorier: 'أمين المال', responsable_administratif: 'المسؤول الإداري', pending: 'في انتظار التفعيل'
};
const jsonHeaders = (token?: string) => ({ apikey: SUPABASE_PUBLISHABLE_KEY, 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) });
export function getSupabaseSession(): AuthSession | null {
  try { const raw = localStorage.getItem(SESSION_KEY); return raw ? JSON.parse(raw) as AuthSession : null; } catch { return null; }
}
function saveSession(session: AuthSession | null) { if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session)); else localStorage.removeItem(SESSION_KEY); }
async function request<T>(path: string, init: RequestInit = {}, token?: string): Promise<T> {
  assertSupabaseConfigured();
  const response = await fetch(`${SUPABASE_URL}${path}`, { ...init, headers: { ...jsonHeaders(token), ...(init.headers || {}) } });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.msg || body.message || body.error_description || body.error || 'تعذر الاتصال بخدمة Supabase');
  return body as T;
}
async function profileFor(session: AuthSession): Promise<AppAuthUser> {
  const rows = await request<Array<{ id: string; display_name: string; role: string; is_active: boolean }>>('/rest/v1/profiles?select=id,display_name,role,is_active&id=eq.' + encodeURIComponent(session.user.id), {}, session.access_token);
  const profile = rows[0];
  if (!profile || !profile.is_active || profile.role !== 'president') throw new Error('الدخول متاح حالياً لحساب رئيس الجمعية (المدير) فقط. سيتم تفعيل باقي الأدوار لاحقاً.');
  const email = session.user.email || '';
  const displayName = profile.display_name || String(session.user.user_metadata?.display_name || email.split('@')[0]);
  const role = profile.role as UserRole;
  return { id: profile.id, username: email, name: displayName, nameArabic: displayName, email, role, roleArabic: ROLE_LABELS[role], avatar: displayName.slice(0,2).toUpperCase() };
}
export const AuthService = {
  getCurrentUser(): AppAuthUser | null {
    const session = getSupabaseSession();
    const cached = sessionStorage.getItem('aysm_profile_cache');
    if (!session || !cached) return null;
    try { return JSON.parse(cached) as AppAuthUser; } catch { return null; }
  },
  async restoreSession(): Promise<AppAuthUser | null> {
    let session = getSupabaseSession(); if (!session) return null;
    try {
      if (session.expires_at && session.expires_at < Date.now()/1000 + 30) {
        const refreshed = await request<AuthSession>('/auth/v1/token?grant_type=refresh_token', { method:'POST', body: JSON.stringify({ refresh_token: session.refresh_token }) });
        session = { ...refreshed, expires_at: refreshed.expires_at || Date.now()/1000 + 3600 }; saveSession(session);
      }
      const user = await profileFor(session); sessionStorage.setItem('aysm_profile_cache', JSON.stringify(user)); return user;
    } catch { saveSession(null); sessionStorage.removeItem('aysm_profile_cache'); return null; }
  },
  async login(email: string, password: string): Promise<AppAuthUser> {
    const result = await request<AuthSession>('/auth/v1/token?grant_type=password', { method:'POST', body: JSON.stringify({ email: email.trim(), password }) });
    const session = { ...result, expires_at: result.expires_at || Date.now()/1000 + (result.expires_in || 3600) };
    try { const user = await profileFor(session); saveSession(session); sessionStorage.setItem('aysm_profile_cache', JSON.stringify(user)); return user; }
    catch (error) { await fetch(`${SUPABASE_URL}/auth/v1/logout`, { method:'POST', headers: jsonHeaders(session.access_token) }).catch(()=>{}); throw error; }
  },
  async logout(): Promise<void> { const session = getSupabaseSession(); if (session) await fetch(`${SUPABASE_URL}/auth/v1/logout`, { method:'POST', headers: jsonHeaders(session.access_token) }).catch(()=>{}); saveSession(null); sessionStorage.removeItem('aysm_profile_cache'); },
  canCreateDisbursement(user: AppAuthUser): boolean { return user.role === 'president' || user.role === 'responsable_administratif'; },
  canApproveAsTreasurer(user: AppAuthUser, order: DisbursementOrder) { if (user.role !== 'tresorier') return { allowed:false, reason:'صلاحية الاعتماد محصورة في أمين المال.' }; if (order.status !== 'en_attente_tresorier') return { allowed:false, reason:'الطلب ليس في انتظار موافقة أمين المال.' }; if (order.createdById === user.id) return { allowed:false, reason:'لا يمكن اعتماد طلب صرف أنشأه أمين المال نفسه.' }; return { allowed:true }; },
  canExecuteAsPresident(user: AppAuthUser, order: DisbursementOrder) { if (user.role !== 'president') return { allowed:false, reason:'تنفيذ الصرف محصور في رئيس الجمعية.' }; if (order.status !== 'approuve_tresorier') return { allowed:false, reason:'لا يمكن تنفيذ الصرف قبل موافقة أمين المال.' }; if (order.isExecutedAccounting) return { allowed:false, reason:'تم تنفيذ هذا الطلب مسبقاً.' }; return { allowed:true }; },
  canEditOrResubmit(user: AppAuthUser, order: DisbursementOrder): boolean { return user.role === 'responsable_administratif' && ['brouillon','a_completer'].includes(order.status); }
};
