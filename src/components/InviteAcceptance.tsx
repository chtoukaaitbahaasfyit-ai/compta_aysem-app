import React, { useEffect, useState } from 'react';
import { getPendingInvite, setInvitedUserPassword, type PendingInvite } from '../services/authService';

export const InviteAcceptance: React.FC = () => {
  const [invite, setInvite] = useState<PendingInvite | null>(null);
  const [invalidLink, setInvalidLink] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    try {
      const pending = getPendingInvite();
      if (pending) setInvite(pending);
    } catch (e) {
      setInvalidLink(e instanceof Error ? e.message : 'رابط الدعوة غير صالح أو منتهي الصلاحية.');
    }
  }, []);

  if (!invite && !invalidLink) return null;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    if (password !== confirm) { setError('كلمتا المرور غير متطابقتين.'); return; }
    if (password.length < 8) { setError('كلمة المرور خاصها تكون على الأقل 8 أحرف.'); return; }
    setBusy(true);
    try {
      await setInvitedUserPassword(invite!.access_token, password);
      window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
      setInvite(null);
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'تعذر تعيين كلمة المرور. حاول فتح رابط دعوة جديد.');
    } finally { setBusy(false); }
  };

  return <div className="fixed inset-0 z-[200] bg-slate-950/80 flex items-center justify-center p-4">
    <div dir="rtl" className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
      <div className="text-xl font-bold text-slate-900">تفعيل حساب AYSM COMPTA</div>
      {done ? <>
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-emerald-800 font-semibold">تم تأكيد الدعوة وتعيين كلمة المرور بنجاح.</div>
        <p className="text-sm text-slate-600 leading-7">الحساب تسجل بنجاح. الولوج إلى النظام المحاسبي بهذه الصلاحية غادي يتفتح من بعد استكمال إعداد وحماية صلاحيات الأدوار.</p>
      </> : invalidLink || !invite ? <>
        <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 text-rose-800 text-sm">{invalidLink || 'رابط الدعوة غير صالح أو منتهي الصلاحية.'}</div>
        <p className="text-sm text-slate-600">طلب من رئيس الجمعية يرسل ليك دعوة جديدة.</p>
      </> : <>
        <p className="text-sm text-slate-600">اختار كلمة مرور جديدة للحساب. خاصها تكون على الأقل 8 أحرف.</p>
        {error && <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-sm text-rose-700">{error}</div>}
        <form onSubmit={submit} className="space-y-3">
          <label className="block text-sm font-semibold">كلمة المرور الجديدة
            <input type="password" required minLength={8} autoComplete="new-password" value={password} onChange={e=>setPassword(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 p-3" />
          </label>
          <label className="block text-sm font-semibold">تأكيد كلمة المرور
            <input type="password" required minLength={8} autoComplete="new-password" value={confirm} onChange={e=>setConfirm(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 p-3" />
          </label>
          <button disabled={busy} className="w-full rounded-lg bg-blue-700 p-3 font-bold text-white disabled:opacity-60">{busy ? 'جار تفعيل الحساب...' : 'تأكيد الدعوة وتعيين كلمة المرور'}</button>
        </form>
      </>}
    </div>
  </div>;
};
