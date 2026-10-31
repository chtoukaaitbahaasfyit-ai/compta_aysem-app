/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Gestion de la Trésorerie & Rapprochement Bancaire pour ASSOCIATION COMPTA PRO
 */

import React, { useState } from 'react';
import {
  Landmark,
  Wallet,
  ArrowRightLeft,
  CheckCircle2,
  FileSpreadsheet,
  Printer,
  Plus,
  Scale,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { BankAccount, AccountingEntry } from '../types/accounting';
import { AccountingEngine } from '../services/accountingEngine';

interface TreasuryManagerProps {
  bankAccounts: BankAccount[];
  entries: AccountingEntry[];
  fiscalYear: string;
  onUpdateBankAccounts: (accounts: BankAccount[]) => void;
  onAddInternalTransfer: (entry: AccountingEntry) => void;
}

export const TreasuryManager: React.FC<TreasuryManagerProps> = ({
  bankAccounts,
  entries,
  fiscalYear,
  onUpdateBankAccounts,
  onAddInternalTransfer
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'comptes' | 'virement' | 'rapprochement'>('comptes');

  // Internal transfer form
  const [sourceAccountId, setSourceAccountId] = useState(bankAccounts[0]?.id || '');
  const [targetAccountId, setTargetAccountId] = useState(bankAccounts[2]?.id || ''); // e.g. bank to cash
  const [transferAmount, setTransferAmount] = useState<number>(3000);
  const [transferDate, setTransferDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [transferReason, setTransferReason] = useState<string>('Alimentation caisse siège pour menues dépenses');

  // Bank reconciliation
  const [reconcileAccountId, setReconcileAccountId] = useState(bankAccounts[0]?.id || '');
  const [bankStatementBalance, setBankStatementBalance] = useState<number>(148500);
  const [checkedEntryIds, setCheckedEntryIds] = useState<string[]>([]);

  const handleInternalTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (sourceAccountId === targetAccountId) {
      alert('Le compte source et le compte de destination doivent être différents.');
      return;
    }
    if (transferAmount <= 0) {
      alert('Veuillez spécifier un montant positif.');
      return;
    }

    const srcAcc = bankAccounts.find(b => b.id === sourceAccountId)!;
    const tgtAcc = bankAccounts.find(b => b.id === targetAccountId)!;
    const pieceNum = `VIR-${fiscalYear}-${Math.floor(1000 + Math.random() * 9000)}`;

    // CNC Accounting rule: Internal transfers pass via account 5115 "Virements de fonds"
    const entry: AccountingEntry = {
      id: `ent-vir-${Date.now()}`,
      pieceNumber: pieceNum,
      journalCode: 'OD',
      date: transferDate,
      period: transferDate.substring(0, 7),
      fiscalYear,
      label: `Virement interne: ${srcAcc.name} -> ${tgtAcc.name}`,
      lines: [
        {
          id: `l-vir-1-${Date.now()}`,
          lineNumber: 1,
          accountNumber: tgtAcc.accountNumber,
          accountLabel: tgtAcc.name,
          label: `Réception virement (${transferReason})`,
          debit: transferAmount,
          credit: 0
        },
        {
          id: `l-vir-2-${Date.now()}`,
          lineNumber: 2,
          accountNumber: srcAcc.accountNumber,
          accountLabel: srcAcc.name,
          label: `Émission virement (${transferReason})`,
          debit: 0,
          credit: transferAmount
        }
      ],
      totalDebit: transferAmount,
      totalCredit: transferAmount,
      isBalanced: true,
      status: 'valide',
      sourceModule: 'tresorerie',
      createdAt: new Date().toISOString(),
      createdBy: 'Trésorier en fonction'
    };

    // Update account balances
    const updated = bankAccounts.map(b => {
      if (b.id === srcAcc.id) {
        return { ...b, currentBalance: b.currentBalance - transferAmount };
      }
      if (b.id === tgtAcc.id) {
        return { ...b, currentBalance: b.currentBalance + transferAmount };
      }
      return b;
    });

    onUpdateBankAccounts(updated);
    onAddInternalTransfer(entry);
    alert(`Virement interne de ${transferAmount} DH enregistré avec succès (Pièce : ${pieceNum}).`);
    setActiveSubTab('comptes');
  };

  const toggleCheckReconciliation = (id: string) => {
    if (checkedEntryIds.includes(id)) {
      setCheckedEntryIds(checkedEntryIds.filter(i => i !== id));
    } else {
      setCheckedEntryIds([...checkedEntryIds, id]);
    }
  };

  // Reconciled bank account entries
  const currentReconcileAcc = bankAccounts.find(b => b.id === reconcileAccountId) || bankAccounts[0];
  const accountEntries = entries.filter(e =>
    e.status !== 'extourne' &&
    e.lines.some(l => l.accountNumber === currentReconcileAcc.accountNumber)
  );

  const bookBalance = currentReconcileAcc.currentBalance;
  const reconciliationDifference = Math.round((bookBalance - bankStatementBalance) * 100) / 100;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Title & Navigation tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4 no-print">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Landmark className="w-5 h-5 text-blue-700" />
            Gestion de Trésorerie & Rapprochement Bancaire
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Comptes bancaires, journaux de caisse, virements internes (5115) et pointage périodique
          </p>
        </div>

        {/* Sub-tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
          <button
            onClick={() => setActiveSubTab('comptes')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
              activeSubTab === 'comptes'
                ? 'bg-blue-700 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Comptes & Caisses
          </button>
          <button
            onClick={() => setActiveSubTab('virement')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
              activeSubTab === 'virement'
                ? 'bg-blue-700 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Virement Interne (5115)
          </button>
          <button
            onClick={() => setActiveSubTab('rapprochement')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
              activeSubTab === 'rapprochement'
                ? 'bg-blue-700 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Rapprochement Bancaire
          </button>
        </div>
      </div>

      {/* Subtab 1: Comptes & Caisses */}
      {activeSubTab === 'comptes' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {bankAccounts.map((acc) => (
              <div
                key={acc.id}
                className="bg-white rounded-lg border border-slate-300 p-5 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-900">
                      {acc.accountNumber}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                      acc.type === 'banque' ? 'bg-sky-50 text-sky-800' : 'bg-amber-50 text-amber-800'
                    }`}>
                      {acc.type}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 mt-2">
                    {acc.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    {acc.bankName}
                  </p>

                  <div className="mt-4 p-3 bg-slate-50 rounded border border-slate-200 space-y-1 text-xs">
                    <div className="text-slate-500 text-[11px]">Relevé d'Identité Bancaire (RIB) :</div>
                    <div className="font-mono font-medium text-slate-800 break-all select-all">
                      {acc.rib}
                    </div>
                  </div>

                  <div className="mt-4">
                    <span className="text-[11px] text-slate-400 block uppercase font-semibold">Solde Comptable Actuel</span>
                    <span className="text-2xl font-bold font-mono-acc text-slate-900">
                      {AccountingEngine.formatMAD(acc.currentBalance)}
                    </span>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-200 text-[11px] text-slate-500">
                  <strong>Signataires statutaires :</strong>
                  <ul className="list-disc pl-4 mt-1 text-slate-600">
                    {acc.signatories.map((sig, i) => (
                      <li key={i}>{sig}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {/* Quick legal note on dual signature */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md text-xs text-blue-900">
            <strong>Gouvernance & Sécurité financière (Section 4.1 du CNC) :</strong> Conformément aux règles de bonne gouvernance des associations, tout moyen de paiement (chèque, ordre de virement) doit faire l'objet d'une signature conjointe d'au moins deux responsables habilités par le Bureau (généralement le Président et le Trésorier).
          </div>
        </div>
      )}

      {/* Subtab 2: Virement Interne */}
      {activeSubTab === 'virement' && (
        <div className="bg-white rounded-lg border border-slate-300 p-6 shadow-xs max-w-2xl mx-auto text-xs">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-200">
            <ArrowRightLeft className="w-5 h-5 text-blue-700" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">Opération de Virement Interne (Compte 5115)</h3>
              <p className="text-[11px] text-slate-500">Transfert de fonds entre compte bancaire et caisse, ou entre deux banques</p>
            </div>
          </div>

          <form onSubmit={handleInternalTransferSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Compte Source (Émetteur) *</label>
                <select
                  value={sourceAccountId}
                  onChange={(e) => setSourceAccountId(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded bg-white font-medium"
                >
                  {bankAccounts.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.accountNumber}) - Solde: {b.currentBalance} DH
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Compte Destination (Récepteur) *</label>
                <select
                  value={targetAccountId}
                  onChange={(e) => setTargetAccountId(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded bg-white font-medium"
                >
                  {bankAccounts.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.accountNumber}) - Solde: {b.currentBalance} DH
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Montant transféré (DH) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  required
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 font-mono text-base font-bold text-blue-900 border border-slate-300 rounded"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Date d'opération *</label>
                <input
                  type="date"
                  required
                  value={transferDate}
                  onChange={(e) => setTransferDate(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Motif / Justification du virement *</label>
              <input
                type="text"
                required
                value={transferReason}
                onChange={(e) => setTransferReason(e.target.value)}
                placeholder="Ex: Retrait bancaire pour approvisionnement caisse de projet"
                className="w-full px-3 py-1.5 border border-slate-300 rounded"
              />
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded text-slate-600 text-[11px]">
              <strong>Schéma comptable officiel :</strong> L'opération débitera le compte cible et créditera le compte source, avec inscription automatique au Journal des Opérations Diverses ou de Trésorerie.
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setActiveSubTab('comptes')}
                className="px-4 py-1.5 rounded border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded bg-blue-700 hover:bg-blue-600 text-white font-bold shadow-xs cursor-pointer"
              >
                Exécuter le Virement Interne
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Subtab 3: Rapprochement Bancaire */}
      {activeSubTab === 'rapprochement' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-lg border border-slate-300 shadow-xs flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex flex-wrap items-center gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Compte bancaire à rapprocher :</label>
                <select
                  value={reconcileAccountId}
                  onChange={(e) => setReconcileAccountId(e.target.value)}
                  className="px-3 py-1.5 border border-slate-300 rounded bg-white font-semibold text-blue-900"
                >
                  {bankAccounts.filter(b => b.type === 'banque').map(b => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.accountNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Solde selon Relevé Bancaire Papier (DH) :</label>
                <input
                  type="number"
                  step="0.01"
                  value={bankStatementBalance}
                  onChange={(e) => setBankStatementBalance(parseFloat(e.target.value) || 0)}
                  className="px-3 py-1.5 border border-slate-300 rounded font-mono font-bold text-slate-900"
                />
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div>
                <span className="text-[10px] text-slate-400 font-semibold uppercase block">Solde Comptable</span>
                <span className="font-mono-acc font-bold text-sm text-slate-800">
                  {AccountingEngine.formatMAD(bookBalance)}
                </span>
              </div>

              <div className="pl-4 border-l border-slate-200">
                <span className="text-[10px] text-slate-400 font-semibold uppercase block">Écart de rapprochement</span>
                <span className={`font-mono-acc font-bold text-sm ${reconciliationDifference === 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {AccountingEngine.formatMAD(reconciliationDifference)}
                </span>
              </div>

              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold shadow-2xs"
              >
                <Printer className="w-3.5 h-3.5 text-slate-500" />
                <span>Imprimer l'état</span>
              </button>
            </div>
          </div>

          {/* Reconciliation Table */}
          <div className="bg-white rounded-lg border border-slate-300 shadow-xs overflow-hidden">
            <div className="px-4 py-2 bg-slate-100 border-b border-slate-200 font-semibold text-xs text-slate-700 flex justify-between items-center">
              <span>Écritures comptables sur ce compte bancaire (Cocher les opérations pointées sur le relevé)</span>
              <span className="text-slate-500 text-[11px]">Pointées : {checkedEntryIds.length} sur {accountEntries.length}</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-900 text-white font-semibold">
                  <tr>
                    <th className="py-2 px-3 text-center w-12">Pointé</th>
                    <th className="py-2 px-3 w-24">Date</th>
                    <th className="py-2 px-3 w-32">N° Pièce</th>
                    <th className="py-2 px-4">Libellé de l'opération</th>
                    <th className="py-2 px-3 text-right w-32">Débit (Encaissement)</th>
                    <th className="py-2 px-3 text-right w-32">Crédit (Décaissement)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {accountEntries.map((e) => {
                    const line = e.lines.find(l => l.accountNumber === currentReconcileAcc.accountNumber);
                    const isChecked = checkedEntryIds.includes(e.id);
                    return (
                      <tr key={e.id} className={`hover:bg-blue-50/50 transition-colors ${isChecked ? 'bg-emerald-50/30' : ''}`}>
                        <td className="py-2 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleCheckReconciliation(e.id)}
                            className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                          />
                        </td>
                        <td className="py-2 px-3 text-slate-600 font-mono">{e.date}</td>
                        <td className="py-2 px-3 font-mono font-semibold text-blue-700">{e.pieceNumber}</td>
                        <td className="py-2 px-4 text-slate-800 font-medium">{e.label}</td>
                        <td className="py-2 px-3 text-right font-mono-acc text-emerald-700 font-semibold">
                          {line && line.debit > 0 ? AccountingEngine.formatMAD(line.debit) : '-'}
                        </td>
                        <td className="py-2 px-3 text-right font-mono-acc text-rose-700 font-semibold">
                          {line && line.credit > 0 ? AccountingEngine.formatMAD(line.credit) : '-'}
                        </td>
                      </tr>
                    );
                  })}

                  {accountEntries.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        Aucune écriture comptable enregistrée sur ce compte.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
