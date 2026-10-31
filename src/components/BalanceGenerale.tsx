/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Balance Générale des Comptes (6 colonnes) pour ASSOCIATION COMPTA PRO
 */

import React, { useState } from 'react';
import {
  Scale,
  Search,
  Filter,
  Download,
  Printer,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { Account, AccountingEntry } from '../types/accounting';
import { AccountingEngine, AccountSummary } from '../services/accountingEngine';

interface BalanceGeneraleProps {
  entries: AccountingEntry[];
  accounts: Account[];
}

export const BalanceGenerale: React.FC<BalanceGeneraleProps> = ({
  entries,
  accounts
}) => {
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const allSummary: AccountSummary[] = AccountingEngine.calculateBalanceGenerale(entries, accounts);

  const filtered = allSummary.filter(item => {
    const matchesClass = selectedClass === 'all' || item.classNumber.toString() === selectedClass;
    const matchesSearch =
      item.accountNumber.includes(searchTerm) ||
      item.accountLabel.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesClass && matchesSearch;
  });

  // Calculate totals
  const totalMouvementDebit = filtered.reduce((s, i) => s + i.totalDebit, 0);
  const totalMouvementCredit = filtered.reduce((s, i) => s + i.totalCredit, 0);
  const totalSoldeDebiteur = filtered.reduce((s, i) => s + i.soldeDebiteur, 0);
  const totalSoldeCrediteur = filtered.reduce((s, i) => s + i.soldeCrediteur, 0);

  const diffMouvements = Math.abs(Math.round((totalMouvementDebit - totalMouvementCredit) * 100) / 100);
  const diffSoldes = Math.abs(Math.round((totalSoldeDebiteur - totalSoldeCrediteur) * 100) / 100);
  const isGlobalBalanced = diffMouvements < 0.05 && diffSoldes < 0.05;

  const handleExportCSV = () => {
    const headers = ['Numero_Compte', 'Intitule', 'Classe', 'Total_Debit', 'Total_Credit', 'Solde_Debiteur', 'Solde_Crediteur'];
    const rows = filtered.map(item => [
      `"${item.accountNumber}"`,
      `"${item.accountLabel.replace(/"/g, '""')}"`,
      item.classNumber,
      item.totalDebit.toFixed(2),
      item.totalCredit.toFixed(2),
      item.soldeDebiteur.toFixed(2),
      item.soldeCrediteur.toFixed(2)
    ]);

    const csv = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Balance_Generale_Comptes_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Title & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4 no-print">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Scale className="w-5 h-5 text-blue-700" />
            Balance Générale des Comptes (6 Colonnes)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Contrôle d'égalité arithmétique globale et état récapitulatif des soldes
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Imprimer la Balance</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded bg-blue-700 hover:bg-blue-600 text-white shadow-sm transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Exporter CSV</span>
          </button>
        </div>
      </div>

      {/* Verification Banner */}
      <div className={`p-4 rounded-lg border text-xs flex flex-wrap items-center justify-between gap-3 ${
        isGlobalBalanced
          ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
          : 'bg-rose-50/80 border-rose-300 text-rose-950'
      }`}>
        <div className="flex items-center gap-3">
          {isGlobalBalanced ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <div>
            <div className="font-bold text-sm">
              {isGlobalBalanced
                ? 'Balance parfaitement équilibrée (Double contrôle vérifié)'
                : 'Déséquilibre détecté dans la balance générale'}
            </div>
            <div className="text-[11px] text-slate-600">
              Total Mouvements Débit/Crédit : {totalMouvementDebit.toFixed(2)} DH = {totalMouvementCredit.toFixed(2)} DH • Total Soldes Débiteurs/Créditeurs : {totalSoldeDebiteur.toFixed(2)} DH = {totalSoldeCrediteur.toFixed(2)} DH
            </div>
          </div>
        </div>

        <div className="font-mono text-xs font-semibold">
          Écart : {diffSoldes.toFixed(2)} DH
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs space-y-3 text-xs no-print">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Filtrer par numéro de compte ou libellé..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-500 mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Classe :
            </span>
            <button
              onClick={() => setSelectedClass('all')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                selectedClass === 'all'
                  ? 'bg-blue-700 text-white font-semibold'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              Toutes
            </button>
            {[0, 1, 2, 3, 4, 5, 6, 7].map(num => (
              <button
                key={num}
                onClick={() => setSelectedClass(num.toString())}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                  selectedClass === num.toString()
                    ? 'bg-blue-700 text-white font-semibold'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                Cl. {num}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Balance 6 Columns Table */}
      <div className="bg-white rounded-lg border border-slate-300 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-900 text-white font-semibold">
              <tr>
                <th rowSpan={2} className="py-2.5 px-3 border-r border-slate-800 w-28 align-middle">N° Compte</th>
                <th rowSpan={2} className="py-2.5 px-4 border-r border-slate-800 align-middle">Intitulé du Compte</th>
                <th colSpan={2} className="py-1.5 px-3 text-center border-b border-r border-slate-800 bg-slate-800/80">Mouvements de l'Exercice (DH)</th>
                <th colSpan={2} className="py-1.5 px-3 text-center border-b border-slate-800 bg-slate-800/90">Soldes Clôture (DH)</th>
              </tr>
              <tr className="bg-slate-800 text-[11px]">
                <th className="py-1.5 px-3 text-right border-r border-slate-700 w-32">Débit</th>
                <th className="py-1.5 px-3 text-right border-r border-slate-700 w-32">Crédit</th>
                <th className="py-1.5 px-3 text-right border-r border-slate-700 w-32">Solde Débiteur</th>
                <th className="py-1.5 px-3 text-right w-32">Solde Créditeur</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-normal">
              {filtered.map((item) => (
                <tr key={item.accountNumber} className="hover:bg-blue-50/50 transition-colors">
                  <td className="py-2 px-3 font-mono font-semibold text-blue-900 border-r border-slate-100">
                    {item.accountNumber}
                  </td>
                  <td className="py-2 px-4 font-medium text-slate-900 border-r border-slate-100">
                    {item.accountLabel}
                  </td>
                  <td className="py-2 px-3 text-right font-mono-acc text-blue-950 border-r border-slate-100">
                    {item.totalDebit > 0 ? item.totalDebit.toFixed(2) : '-'}
                  </td>
                  <td className="py-2 px-3 text-right font-mono-acc text-slate-800 border-r border-slate-100">
                    {item.totalCredit > 0 ? item.totalCredit.toFixed(2) : '-'}
                  </td>
                  <td className="py-2 px-3 text-right font-mono-acc font-semibold text-sky-800 border-r border-slate-100">
                    {item.soldeDebiteur > 0 ? item.soldeDebiteur.toFixed(2) : '-'}
                  </td>
                  <td className="py-2 px-3 text-right font-mono-acc font-semibold text-emerald-800">
                    {item.soldeCrediteur > 0 ? item.soldeCrediteur.toFixed(2) : '-'}
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Aucun compte sélectionné.
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr className="bg-slate-900 text-white font-bold text-xs border-t-2 border-slate-950">
                <td colSpan={2} className="py-3 px-4 uppercase text-right tracking-wider">
                  TOTAUX GÉNÉRAUX DE LA BALANCE :
                </td>
                <td className="py-3 px-3 text-right font-mono text-sky-300 border-r border-slate-700">
                  {totalMouvementDebit.toFixed(2)}
                </td>
                <td className="py-3 px-3 text-right font-mono text-emerald-300 border-r border-slate-700">
                  {totalMouvementCredit.toFixed(2)}
                </td>
                <td className="py-3 px-3 text-right font-mono text-sky-300 border-r border-slate-700">
                  {totalSoldeDebiteur.toFixed(2)}
                </td>
                <td className="py-3 px-3 text-right font-mono text-emerald-300">
                  {totalSoldeCrediteur.toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
