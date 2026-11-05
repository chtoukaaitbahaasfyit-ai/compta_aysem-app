/** Cloud-only accounting persistence. Browser storage is never an accounting source of truth. */

import { getValidSession, SessionExpiredError } from './authService';
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

/** Thrown when another device/tab saved a newer version of the same module. */
export class RevisionConflictError extends Error {
  constructor(public readonly module: CloudModule) {
    super('تم تعديل هذه البيانات من جهاز أو نافذة أخرى. أعد تحميل الصفحة قبل المتابعة حتى لا تُمحى التعديلات الأحدث.');
    this.name = 'RevisionConflictError';
  }
}

/** The atomic-save SQL function (migration 202611050001) is not installed yet. */
export class RpcMissingError extends Error {
  constructor() { super('aysm_save_modules missing'); this.name = 'RpcMissingError'; }
}

export interface CloudSnapshot {
  data: Partial<Record<CloudModule, unknown>>;
  revisions: Partial<Record<CloudModule, number>>;
}

async function api<T>(path: string, init: RequestInit = {}): Promise<{ status: number; body: T | null; ok: boolean; message: string }> {
  assertSupabaseConfigured();

  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    throw new Error('الاتصال بالإنترنت مقطوع. لم يتم حفظ العملية؛ أعد الاتصال وحاول من جديد.');
  }

  const session = await getValidSession();
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(`${SUPABASE_URL}${path}`, {
      ...init,
      signal: controller.signal,
      headers: {
        apikey: SUPABASE_PUBLISHABLE_KEY,
        Authorization: `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
        ...((init.headers || {}) as Record<string, string>)
      }
    });

    const body = await response.json().catch(() => null);
    const message = (body && (body.message || body.details || body.hint)) || 'فشل الاتصال بقاعدة البيانات. لم يتم تأكيد الحفظ.';

    if (response.status === 401) throw new SessionExpiredError();

    return { status: response.status, body: body as T | null, ok: response.ok, message };
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('انتهت مهلة الاتصال بقاعدة البيانات بعد 15 ثانية. حاول مجدداً.');
    }
    throw error;
  } finally {
    window.clearTimeout(timeout);
  }
}

/** Same as api() but throws on any non-2xx and returns the parsed body (used by the disbursement workflow). */
async function apiBody<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await api<T>(path, init);
  if (!res.ok) throw new Error(res.message);
  return res.body as T;
}

export const CloudDataService = {
  async loadAll(): Promise<CloudSnapshot> {
    const res = await api<Array<{ module: CloudModule; payload: unknown; revision: number }>>(
      '/rest/v1/app_records?select=module,payload,revision'
    );
    if (!res.ok) throw new Error(res.message);

    const snapshot: CloudSnapshot = { data: {}, revisions: {} };
    for (const row of res.body || []) {
      snapshot.data[row.module] = row.payload;
      snapshot.revisions[row.module] = Number(row.revision) || 1;
    }
    return snapshot;
  },

  /**
   * Saves one module with optimistic concurrency.
   * - expectedRevision undefined → first write of the module (INSERT; a unique violation means someone else created it).
   * - otherwise → UPDATE ... WHERE revision = expectedRevision; zero rows updated means a newer version exists.
   * Returns the new revision.
   */
  async saveModule(module: CloudModule, payload: unknown, expectedRevision?: number): Promise<number> {
    const session = await getValidSession();

    if (expectedRevision === undefined) {
      const res = await api<Array<{ revision: number }>>('/rest/v1/app_records?select=revision', {
        method: 'POST',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify({ module, payload, created_by: session.user.id, updated_by: session.user.id })
      });
      if (res.status === 409) throw new RevisionConflictError(module);
      if (!res.ok) throw new Error(res.message);
      return Number(res.body?.[0]?.revision) || 1;
    }

    const res = await api<Array<{ revision: number }>>(
      `/rest/v1/app_records?module=eq.${encodeURIComponent(module)}&revision=eq.${expectedRevision}&select=revision`,
      {
        method: 'PATCH',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify({
          payload,
          updated_by: session.user.id,
          updated_at: new Date().toISOString(),
          revision: expectedRevision + 1
        })
      }
    );
    if (!res.ok) throw new Error(res.message);
    if (!res.body || res.body.length === 0) throw new RevisionConflictError(module);
    return Number(res.body[0].revision) || expectedRevision + 1;
  },

  /**
   * Atomic save of several modules in ONE transaction (all or nothing), each guarded by its revision.
   * Throws RpcMissingError if the migration was not applied, so callers can fall back to saveModule().
   */
  async saveModules(items: Array<{ module: CloudModule; payload: unknown; expectedRevision?: number }>): Promise<Partial<Record<CloudModule, number>>> {
    const res = await api<{ code?: string; message?: string } & Partial<Record<CloudModule, number>>>('/rest/v1/rpc/aysm_save_modules', {
      method: 'POST',
      body: JSON.stringify({
        p_items: items.map(i => ({ module: i.module, payload: i.payload, ...(i.expectedRevision !== undefined ? { expected_revision: i.expectedRevision } : {}) }))
      })
    });
    if (res.ok) return (res.body || {}) as Partial<Record<CloudModule, number>>;
    const code = res.body?.code; const msg = String(res.body?.message || '');
    if (res.status === 404 || code === 'PGRST202') throw new RpcMissingError();
    if (code === 'AY409' || msg.startsWith('revision_conflict')) throw new RevisionConflictError((msg.split(':')[1] || items[0].module) as CloudModule);
    throw new Error(msg || res.message);
  },


  async loadDisbursementOrders(): Promise<DisbursementOrder[]> {
    const rows = await apiBody<Array<{ id: string; payload: DisbursementOrder; status: DisbursementStatus }>>(
      '/rest/v1/disbursement_orders?select=id,payload,status&order=created_at.desc'
    );
    return (rows || []).map(row => ({ ...row.payload, id: row.id, status: row.status }));
  },

  async createDisbursementOrder(order: DisbursementOrder): Promise<DisbursementOrder> {
    const session = await getValidSession();
    const rows = await apiBody<Array<{ id: string; payload: DisbursementOrder; status: DisbursementStatus }>>(
      '/rest/v1/disbursement_orders?select=id,payload,status',
      {
        method: 'POST',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify({
          payload: order,
          status: order.status,
          created_by: session.user.id,
          created_by_role: order.createdByRole
        })
      }
    );
    if (!rows?.[0]) throw new Error('لم يتم تأكيد إنشاء طلب الصرف في قاعدة البيانات.');
    return { ...rows[0].payload, id: rows[0].id, status: rows[0].status };
  },

  async resubmitDisbursementOrder(id: string, order: DisbursementOrder): Promise<void> {
    await apiBody('/rest/v1/disbursement_orders?id=eq.' + encodeURIComponent(id), {
      method: 'PATCH',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({ payload: order, status: 'en_attente_tresorier' })
    });
  },

  async decideDisbursementOrder(
    id: string,
    decision: 'approuve_tresorier' | 'rejete' | 'a_completer',
    notes: string
  ): Promise<void> {
    await apiBody('/rest/v1/rpc/aysm_treasurer_decide_disbursement', {
      method: 'POST',
      body: JSON.stringify({ p_order_id: id, p_decision: decision, p_notes: notes || null })
    });
  },

  async executeDisbursementOrder(id: string, executionReference: string): Promise<void> {
    await apiBody('/rest/v1/rpc/aysm_execute_disbursement', {
      method: 'POST',
      body: JSON.stringify({
        p_order_id: id,
        p_execution_reference: executionReference || null
      })
    });
  },

  async addAuditEvent(action: string, details: string): Promise<void> {
    const session = await getValidSession();
    const res = await api('/rest/v1/audit_events', {
      method: 'POST',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({
        actor_id: session.user.id,
        action,
        details: { message: details }
      })
    });
    if (!res.ok) throw new Error(res.message);
  }
};
