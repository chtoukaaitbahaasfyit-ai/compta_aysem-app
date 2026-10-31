/** Cloud-only accounting persistence. Browser storage is never an accounting source of truth. */

import { getSupabaseSession } from './authService';
import type { DisbursementOrder, DisbursementStatus } from '../types/accounting';
import {
  assertSupabaseConfigured,
  SUPABASE_PUBLISHABLE_KEY,
  SUPABASE_URL
} from './supabaseConfig';

export const CLOUD_MODULES = [
  'association_profile',
  'fiscal_years',
  'accounts',
  'entries',
  'recettes',
  'depenses',
  'disbursements',
  'bank_accounts',
  'subventions',
  'projects',
  'budgets',
  'immobilisations',
  'members',
  'documents',
  'volunteers',
  'in_kind',
  'audit_logs'
] as const;

export type CloudModule = typeof CLOUD_MODULES[number];

function headers(token: string, extra: Record<string, string> = {}) {
  return {
    apikey: SUPABASE_PUBLISHABLE_KEY,
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    ...extra
  };
}

function requireOnlineSession() {
  assertSupabaseConfigured();

  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    throw new Error('الاتصال بالإنترنت مقطوع. لم يتم حفظ العملية؛ أعد الاتصال وحاول من جديد.');
  }

  const session = getSupabaseSession();

  if (!session?.access_token || !session.user?.id) {
    throw new Error('انتهت جلسة الدخول. سجل الدخول من جديد.');
  }

  return session;
}

async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const session = requireOnlineSession();
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(`${SUPABASE_URL}${path}`, {
      ...init,
      signal: controller.signal,
      headers: headers(
        session.access_token,
        (init.headers || {}) as Record<string, string>
      )
    });

    const body = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(
        body?.message ||
        body?.details ||
        body?.hint ||
        'فشل الاتصال بقاعدة البيانات. لم يتم تأكيد الحفظ.'
      );
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

export const CloudDataService = {
  async loadAll(): Promise<Partial<Record<CloudModule, unknown>>> {
    const rows = await api<Array<{ module: CloudModule; payload: unknown }>>(
      '/rest/v1/app_records?select=module,payload'
    );

    const data: Partial<Record<CloudModule, unknown>> = {};

    for (const row of rows || []) {
      data[row.module] = row.payload;
    }

    return data;
  },

  async save(module: CloudModule, payload: unknown): Promise<void> {
    const session = requireOnlineSession();

    await api('/rest/v1/app_records?on_conflict=module', {
      method: 'POST',
      headers: {
        Prefer: 'resolution=merge-duplicates,return=minimal'
      },
      body: JSON.stringify({
        module,
        payload,
        created_by: session.user.id,
        updated_by: session.user.id
      })
    });
  },

  async saveAll(
    data: Partial<Record<CloudModule, unknown>>
  ): Promise<void> {
    const session = requireOnlineSession();

    const rows = (
      Object.entries(data) as [CloudModule, unknown][]
    ).map(([module, payload]) => ({
      module,
      payload,
      created_by: session.user.id,
      updated_by: session.user.id
    }));

    if (!rows.length) return;

    await api('/rest/v1/app_records?on_conflict=module', {
      method: 'POST',
      headers: {
        Prefer: 'resolution=merge-duplicates,return=minimal'
      },
      body: JSON.stringify(rows)
    });
  },

  async addAuditEvent(action: string, details: string): Promise<void> {
    const session = requireOnlineSession();

    await api('/rest/v1/audit_events', {
      method: 'POST',
      headers: {
        Prefer: 'return=minimal'
      },
      body: JSON.stringify({
        actor_id: session.user.id,
        action,
        details: {
          message: details
        }
      })
    });
  }
};
