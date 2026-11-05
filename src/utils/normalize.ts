/** Defensive normalisation of data coming from the cloud (JSONB may contain legacy or partial records). */
import type { BankAccount } from '../types/accounting';

export function asArray<T>(value: unknown, fallback: T[] = []): T[] {
  return Array.isArray(value) ? (value.filter(v => v !== null && v !== undefined) as T[]) : fallback;
}

const num = (v: unknown, fallback = 0): number => {
  const n = typeof v === 'string' ? Number(v) : (v as number);
  return typeof n === 'number' && Number.isFinite(n) ? n : fallback;
};

/** Guarantees every bank/cash account has an id and finite numeric balances, so `currentBalance` is never undefined/NaN. */
export function normalizeBankAccounts(value: unknown): BankAccount[] {
  return asArray<Partial<BankAccount>>(value)
    .filter(b => typeof b === 'object')
    .map((b, i) => {
      const initialBalance = num(b.initialBalance);
      return {
        id: b.id ? String(b.id) : `acc-legacy-${i}`,
        name: String(b.name ?? 'Compte sans nom'),
        type: b.type === 'caisse' ? 'caisse' : 'banque',
        bankName: String(b.bankName ?? ''),
        rib: String(b.rib ?? ''),
        accountNumber: String(b.accountNumber ?? ''),
        initialBalance,
        currentBalance: num(b.currentBalance, initialBalance),
        signatories: asArray<string>(b.signatories)
      } as BankAccount;
    });
}
