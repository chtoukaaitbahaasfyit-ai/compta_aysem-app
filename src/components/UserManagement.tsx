import React, { useState } from 'react';
import { getSupabaseSession } from '../services/authService';
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from '../services/supabaseConfig';

type Role = 'tresorier' | 'responsable_administratif';
async function adminCall(body: Record<string, unknown>) {
  const session = getSupabaseSession();
  if (!session?.access_token) throw new Error('يرجى تسجيل الدخول مجدداً');
  const response = await fetch(`${SUPABASE_URL}/functions/v1/aysm-user-admin`, {
    method: 'POST',
    headers: { apikey: SUPABASE_PUBLISHABLE_KEY, Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.detail || result.error || 'تعذر تنفيذ العملية الإدارية');
  return result;
}
export const UserManagement: React.FC = () => {
  const [email,setEmail]=useState('');
  const [displayName,setDisplayName]=useState('');
  const [role,setRole]=useState<Role>('tresorier');
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState('');
  const invite=async(e:React.FormEvent)=>{e.preventDefault();setBusy(true);setMessage('');try{const r=await adminCall({action:'invite',email,display_name:displayName,role});setMessage('تم إرسال دعوة آمنة وإنشاء ملف الدور. المستخدم: '+r.result.email);setEmail('');setDisplayName('');}catch(err){setMessage(err instanceof Error?err.message:'حدث خطأ');}finally{setBusy(false);}};
  return <section className="p-4 md:p-8 max-w-3xl mx-auto" dir="rtl">
    <header className="mb-6"><h1 className="text-2xl font-bold text-slate-900">إدارة المستخدمين والصلاحيات</h1><p className="text-sm text-slate-600 mt-2">إضافة أمين المال أو المسؤول الإداري عبر دعوة بريدية. التعيين والتفعيل يتحقق منهما الخادم بصلاحية الرئيس فقط.</p></header>
    <form onSubmit={invite} className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
      <label className="block text-sm font-semibold">الاسم الكامل<input required value={displayName} onChange={e=>setDisplayName(e.target.value)} className="mt-1 w-full border rounded-lg p-2" /></label>
      <label className="block text-sm font-semibold">البريد الإلكتروني<input required type="email" value={email} onChange={e=>setEmail(e.target.value)} className="mt-1 w-full border rounded-lg p-2" /></label>
      <label className="block text-sm font-semibold">الدور<select value={role} onChange={e=>setRole(e.target.value as Role)} className="mt-1 w-full border rounded-lg p-2"><option value="tresorier">أمين المال</option><option value="responsable_administratif">المسؤول الإداري</option></select></label>
      <button disabled={busy} className="rounded-lg bg-slate-900 text-white px-5 py-2.5 disabled:opacity-50">{busy?'جار الإرسال...':'إرسال دعوة وتعيين الدور'}</button>
      {message&&<p role="status" className="text-sm text-slate-700">{message}</p>}
    </form>
  </section>;
};