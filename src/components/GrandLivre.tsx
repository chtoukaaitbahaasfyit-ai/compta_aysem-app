/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Grand Livre Général des Comptes pour ASSOCIATION COMPTA PRO
 */

import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  Filter,
  Download,
  Printer,
  ChevronDown
} from 'lucide-react';
import { Account, AccountingEntry } from '../types/accounting';
import { AccountingEngine } from '../services/accountingEngine';

interface GrandLivreProps {
  entries: AccountingEntry[];
  accounts: Account[];
}

export const GrandLivre: React.FC<GrandLivreProps> = ({
  entries,
  accounts
}) => {
  const [selectedAccount, setSelectedAccount] = useState<string>('all');
  const [searchAccount, setSearchAccount] = useState<string>('');

  // Collect accounts that have entries
  const usedAccountNumbers = Array.from(
    new Set(
      entries
        .filter(e => e.status !== 'extourne')
        .flatMap(e => e.lines.map(l => l.accountNumber))
    )
  ).sort();

  const accountsToDisplay = (selectedAccount === 'all'
    ? usedAccountNumbers
    : [selectedAccount]
  ).filter(accNum => {
    if (!searchAccount) return true;
    const acc = accounts.find(a => a.number === accNum);
    return (
      accNum.includes(searchAccount) ||
      (acc && acc.label.toLowerCase().includes(searchAccount.toLowerCase()))
    );
  });

  const handleExportCSV = () => {
    const headers = ['Compte', 'Intitule', 'Date', 'Journal', 'N_Piece', 'Libelle', 'Debit', 'Credit', 'Solde_Progressif'];
    const rows: string[] = [];

    accountsToDisplay.forEach(accNum => {
      const acc = accounts.find(a => a.number === accNum);
      const ledger = AccountingEngine.calculateGrandLivreForAccount(accNum, entries);
      ledger.forEach(item => {
        const solde = item.balanceDebit > 0 ? `D ${item.balanceDebit.toFixed(2)}` : `C ${item.balanceCredit.toFixed(2)}`;
        rows.push([
          `"${accNum}"`,
          `"${(acc?.label || '').replace(/"/g, '""')}"`,
          item.entry.date,
          item.entry.journalCode,
          `"${item.entry.pieceNumber}"`,
          `"${item.line.label.replace(/"/g, '""')}"`,
          item.line.debit,
          item.line.credit,
          `"${solde}"`
        ].join(';'));
      });
    });

    const csv = '\uFEFF' + [headers.join(';'), ...rows].join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Grand_Livre_Associations_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Title & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4 no-print">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-700" />
            Grand Livre Général des Comptes
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Détail chronologique exhaustif et soldes progressifs par compte comptable
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Imprimer le Grand Livre</span>
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

      {/* Filter bar */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs flex flex-wrap items-center gap-3 text-xs no-print">
        <div className="flex-1 min-w-[240px] relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher un compte..."
            value={searchAccount}
            onChange={(e) => setSearchAccount(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="font-semibold text-slate-600">Sélectionner un compte :</label>
          <select
            value={selectedAccount}
            onChange={(e) => setSelectedAccount(e.target.value)}
            className="px-3 py-1.5 border border-slate-200 rounded bg-white font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">Tous les comptes mouvementés ({usedAccountNumbers.length})</option>
            {usedAccountNumbers.map(num => {
              const acc = accounts.find(a => a.number === num);
              return (
                <option key={num} value={num}>
                  {num} - {acc?.label || ''}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Accounts Ledgers */}
      <div className="space-y-6">
        {accountsToDisplay.map((accNum) => {
          const acc = accounts.find(a => a.number === accNum);
          const ledgerItems = AccountingEngine.calculateGrandLivreForAccount(accNum, entries);
          const totalDebit = ledgerItems.reduce((sum, item) => sum + (Number(item.line.debit) || 0), 0);
          const totalCredit = ledgerItems.reduce((sum, item) => sum + (Number(item.line.credit) || 0), 0);
          const diff = totalDebit - totalCredit;

          return (
            <div key={accNum} className="bg-white rounded-lg border border-slate-300 shadow-xs overflow-hidden print-break-inside-avoid">
              {/* Account Header */}
              <div className="px-4 py-2.5 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-sky-300 text-sm">{accNum}</span>
                  <span className="font-semibold text-slate-100">{acc?.label || 'Compte personnalisé'}</span>
                </div>
                <div className="flex items-center gap-4 text-xs font-mono">
                  <span>Total Débit : <strong className="text-sky-300">{totalDebit.toFixed(2)} DH</strong></span>
                  <span>Total Crédit : <strong className="text-emerald-300">{totalCredit.toFixed(2)} DH</strong></span>
                  <span className={`px-2 py-0.5 rounded font-bold ${diff >= 0 ? 'bg-blue-800 text-blue-100' : 'bg-emerald-800 text-emerald-100'}`}>
                    Solde : {diff >= 0 ? `D ${diff.toFixed(2)}` : `C ${Math.abs(diff).toFixed(2)}`} DH
                  </span>
                </div>
              </div>

              {/* Account Transactions Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-semibold">
                      <th className="py-2 px-3 w-24">Date</th>
                      <th className="py-2 px-3 w-16 text-center">Jnl</th>
                      <th className="py-2 px-3 w-32">N° Pièce</th>
                      <th className="py-2 px-4">Libellé de l'opération</th>
                      <th className="py-2 px-3 w-32 text-right">Débit (DH)</th>
                      <th className="py-2 px-3 w-32 text-right">Crédit (DH)</th>
                      <th className="py-2 px-3 w-36 text-right">Solde Débiteur</th>
                      <th className="py-2 px-3 w-36 text-right">Solde Créditeur</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-normal">
                    {ledgerItems.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2 px-3 font-mono text-slate-600">{item.entry.date}</td>
                        <td className="py-2 px-3 text-center">
                          <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-100 font-semibold text-slate-700">
                            {item.entry.journalCode}
                          </span>
                        </td>
                        <td className="py-2 px-3 font-mono font-semibold text-blue-700">{item.entry.pieceNumber}</td>
                        <td className="py-2 px-4 text-slate-800 font-medium">
                          {item.line.label || item.entry.label}
                          {item.line.thirdParty && (
                            <span className="text-[10px] text-slate-400 ml-1.5">({item.line.thirdParty})</span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-right font-mono-acc font-semibold text-blue-900">
                          {item.line.debit > 0 ? item.line.debit.toFixed(2) : '-'}
                        </td>
                        <td className="py-2 px-3 text-right font-mono-acc font-semibold text-slate-800">
                          {item.line.credit > 0 ? item.line.credit.toFixed(2) : '-'}
                        </td>
                        <td className="py-2 px-3 text-right font-mono-acc text-sky-800 font-medium">
                          {item.balanceDebit > 0 ? item.balanceDebit.toFixed(2) : '-'}
                        </td>
                        <td className="py-2 px-3 text-right font-mono-acc text-emerald-800 font-medium">
                          {item.balanceCredit > 0 ? item.balanceCredit.toFixed(2) : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-50 font-bold border-t-2 border-slate-300 text-slate-900">
                      <td colSpan={4} className="py-2 px-4 text-right uppercase text-[11px]">
                        Cumul du compte {accNum} :
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-blue-900">{totalDebit.toFixed(2)}</td>
                      <td className="py-2 px-3 text-right font-mono text-slate-900">{totalCredit.toFixed(2)}</td>
                      <td className="py-2 px-3 text-right font-mono text-sky-900">
                        {diff > 0 ? diff.toFixed(2) : '-'}
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-emerald-900">
                        {diff < 0 ? Math.abs(diff).toFixed(2) : '-'}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          );
        })}

        {accountsToDisplay.length === 0 && (
          <div className="bg-white rounded-lg border border-slate-200 p-8 text-center text-slate-500 text-xs">
            Aucun mouvement enregistré pour les critères sélectionnés.
          </div>
        )}
      </div>
    </div>
  );
};
