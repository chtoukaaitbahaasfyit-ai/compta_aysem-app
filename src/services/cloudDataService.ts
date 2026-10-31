async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const session = requireOnlineSession();
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(`${SUPABASE_URL}${path}`, {
      ...init,
      signal: controller.signal,
      headers: headers(session.access_token, (init.headers || {}) as Record<string,string>)
    });

    const body = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(body?.message || body?.details || body?.hint || 'فشل الاتصال بقاعدة البيانات. لم يتم تأكيد الحفظ.');
    }

    return body as T;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('انتهت مهلة الاتصال بقاعدة البيانات بعد 15 ثانية. حاول مجدداً.');
    }
    throw error;
  } finally {
    window.clearTimeout(timeout);
  }
}
    await api('/rest/v1/audit_events', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ actor_id: session.user.id, action, details: { message: details } }) });
  }
};
