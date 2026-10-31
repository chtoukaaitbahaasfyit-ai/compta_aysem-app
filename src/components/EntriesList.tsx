/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Consultation du Journal et des Écritures Comptables style SAGE 100
 */

import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  Filter,
  Download,
  RotateCcw,
  Printer,
  FileText,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  Paperclip,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { AccountingEntry, JournalCode } from '../types/accounting';
import { AccountingEngine } from '../services/accountingEngine';
import { StorageService } from '../services/storageService';

interface EntriesListProps {
  entries: AccountingEntry[];
  onExtourne: (entry: AccountingEntry) => void;
  onNewEntry: () => void;
}

export const EntriesList: React.FC<EntriesListProps> = ({
  entries,
  onExtourne,
  onNewEntry
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJournal, setSelectedJournal] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [expandedEntryId, setExpandedEntryId] = useState<string | null>(null);
  const [selectedForPrint, setSelectedForPrint] = useState<AccountingEntry | null>(null);

  const filteredEntries = entries.filter(e => {
    const matchesSearch =
      e.pieceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.lines.some(l =>
        l.accountNumber.includes(searchTerm) ||
        l.accountLabel.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (l.thirdParty && l.thirdParty.toLowerCase().includes(searchTerm.toLowerCase()))
      );

    const matchesJournal = selectedJournal === 'all' || e.journalCode === selectedJournal;
    const matchesStatus = selectedStatus === 'all' || e.status === selectedStatus;

    return matchesSearch && matchesJournal && matchesStatus;
  });

  const toggleExpand = (id: string) => {
    setExpandedEntryId(expandedEntryId === id ? null : id);
  };

  const handleExportCSV = () => {
    const headers = ['N_Piece', 'Journal', 'Date', 'Exercice', 'Libelle_General', 'N_Ligne', 'Compte', 'Intitule_Compte', 'Debit', 'Credit', 'Tiers', 'Statut'];
    const rows: string[] = [];

    filteredEntries.forEach(entry => {
      entry.lines.forEach((l, idx) => {
        rows.push([
          `"${entry.pieceNumber}"`,
          entry.journalCode,
          entry.date,
          entry.fiscalYear,
          `"${entry.label.replace(/"/g, '""')}"`,
          idx + 1,
          `"${l.accountNumber}"`,
          `"${l.accountLabel.replace(/"/g, '""')}"`,
          l.debit,
          l.credit,
          `"${(l.thirdParty || '').replace(/"/g, '""')}"`,
          entry.status
        ].join(';'));
      });
    });

    const csv = '\uFEFF' + [headers.join(';'), ...rows].join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Journal_Ecritures_Associations_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExtourneClick = (entry: AccountingEntry) => {
    if (entry.status === 'extourne') {
      alert('Cette écriture a déjà été extournée.');
      return;
    }
    if (window.confirm(`Confirmez-vous la CONTREPASSATION (annulation comptable par extourne) de la pièce ${entry.pieceNumber} ? Conformément au CNC, les écritures validées ne sont jamais effacées.`)) {
      onExtourne(entry);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Title & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-700" />
            Journal Général des Écritures Comptables
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Traçabilité chronologique exhaustive, intégrité et contrôle d'imputation
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onNewEntry}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded bg-blue-700 hover:bg-blue-600 text-white shadow-sm transition-colors cursor-pointer"
          >
            <span>+ Saisir une Écriture</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Exporter CSV</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs space-y-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher par N° de pièce, libellé, compte ou tiers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="font-semibold text-slate-600">Journal :</label>
            <select
              value={selectedJournal}
              onChange={(e) => setSelectedJournal(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">Tous les journaux</option>
              <option value="AC">AC - Achats</option>
              <option value="VT">VT - Recettes</option>
              <option value="BQ">BQ - Banque</option>
              <option value="CA">CA - Caisse</option>
              <option value="OD">OD - Opérations diverses</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="font-semibold text-slate-600">Statut :</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="valide">Validé</option>
              <option value="extourne">Extourné / Annulé</option>
            </select>
          </div>
        </div>
      </div>

      {/* Entries Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-900 text-white font-semibold">
              <tr>
                <th className="py-2.5 px-3 w-8"></th>
                <th className="py-2.5 px-3 w-32">N° Pièce</th>
                <th className="py-2.5 px-3 w-24">Date</th>
                <th className="py-2.5 px-3 w-16 text-center">Jnl</th>
                <th className="py-2.5 px-4">Libellé de l'opération</th>
                <th className="py-2.5 px-3 text-right w-32">Débit (DH)</th>
                <th className="py-2.5 px-3 text-right w-32">Crédit (DH)</th>
                <th className="py-2.5 px-3 text-center w-24">Statut</th>
                <th className="py-2.5 px-3 text-center w-36">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEntries.map((entry) => {
                const isExpanded = expandedEntryId === entry.id;
                return (
                  <React.Fragment key={entry.id}>
                    <tr
                      className={`hover:bg-slate-50 transition-colors cursor-pointer ${
                        entry.status === 'extourne' ? 'opacity-60 bg-slate-50/50' : ''
                      }`}
                      onClick={() => toggleExpand(entry.id)}
                    >
                      <td className="py-2 px-3 text-slate-400 text-center">
                        {isExpanded ? (
                          <ChevronDown className="w-3.5 h-3.5 text-blue-600" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5" />
                        )}
                      </td>
                      <td className="py-2 px-3 font-mono font-semibold text-blue-700">
                        {entry.pieceNumber}
                      </td>
                      <td className="py-2 px-3 text-slate-600 font-mono">{entry.date}</td>
                      <td className="py-2 px-3 text-center">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                          {entry.journalCode}
                        </span>
                      </td>
                      <td className="py-2 px-4 font-medium text-slate-900">
                        <div className="flex items-center gap-2">
                          <span>{entry.label}</span>
                          {entry.attachmentName && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded" title={entry.attachmentName}>
                              <Paperclip className="w-2.5 h-2.5" /> {entry.attachmentName}
                            </span>
                          )}
                          {entry.extourneOfPiece && (
                            <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                              Extourne de {entry.extourneOfPiece}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-2 px-3 text-right font-mono-acc font-semibold text-blue-950">
                        {AccountingEngine.formatMAD(entry.totalDebit)}
                      </td>
                      <td className="py-2 px-3 text-right font-mono-acc font-semibold text-slate-900">
                        {AccountingEngine.formatMAD(entry.totalCredit)}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          entry.status === 'valide'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {entry.status === 'valide' ? 'Validé' : 'Extourné'}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedForPrint(entry)}
                            className="p-1 text-slate-500 hover:text-blue-700 hover:bg-slate-100 rounded"
                            title="Imprimer le bordereau officiel d'imputation"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                          {entry.status === 'valide' && (
                            <button
                              type="button"
                              onClick={() => handleExtourneClick(entry)}
                              className="px-2 py-0.5 text-[10px] font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded flex items-center gap-1"
                              title="Annuler l'écriture par contrepassation comptable"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Extourner</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>

                    {/* Expanded Detail Lines */}
                    {isExpanded && (
                      <tr className="bg-slate-50/80">
                        <td colSpan={9} className="p-3">
                          <div className="bg-white rounded border border-slate-200 p-3 shadow-inner">
                            <div className="text-[11px] font-bold text-slate-700 mb-2 flex items-center justify-between">
                              <span>Détail des imputations comptables (Pièce : {entry.pieceNumber})</span>
                              <span className="text-slate-400 font-normal">Saisi le {entry.createdAt} par {entry.createdBy}</span>
                            </div>

                            <table className="w-full text-xs text-left">
                              <thead>
                                <tr className="border-b border-slate-200 text-slate-500 bg-slate-50">
                                  <th className="py-1.5 px-2 w-8">Ligne</th>
                                  <th className="py-1.5 px-2 w-28">N° Compte</th>
                                  <th className="py-1.5 px-2">Intitulé du Compte</th>
                                  <th className="py-1.5 px-2">Libellé d'imputation</th>
                                  <th className="py-1.5 px-2 text-right w-28">Débit (DH)</th>
                                  <th className="py-1.5 px-2 text-right w-28">Crédit (DH)</th>
                                  <th className="py-1.5 px-2 w-32">Tiers</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 font-normal">
                                {entry.lines.map((l, i) => (
                                  <tr key={l.id} className="hover:bg-slate-50/50">
                                    <td className="py-1 px-2 font-mono text-slate-400">{i + 1}</td>
                                    <td className="py-1 px-2 font-mono font-semibold text-blue-800">{l.accountNumber}</td>
                                    <td className="py-1 px-2 text-slate-700">{l.accountLabel}</td>
                                    <td className="py-1 px-2 text-slate-600">{l.label}</td>
                                    <td className="py-1 px-2 text-right font-mono-acc font-semibold text-blue-900">
                                      {l.debit > 0 ? AccountingEngine.formatMAD(l.debit) : '-'}
                                    </td>
                                    <td className="py-1 px-2 text-right font-mono-acc font-semibold text-slate-800">
                                      {l.credit > 0 ? AccountingEngine.formatMAD(l.credit) : '-'}
                                    </td>
                                    <td className="py-1 px-2 text-slate-600">{l.thirdParty || '-'}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}

              {filteredEntries.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    Aucune écriture trouvée.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Official Voucher Print Modal (Article 20 CNC - Ordre d'imputation comptable) */}
      {selectedForPrint && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full border border-slate-300 overflow-hidden text-xs">
            <div className="px-5 py-3 bg-slate-900 text-white font-bold flex items-center justify-between no-print">
              <span>Bordereau Officiel d'Imputation Comptable (Pièce {selectedForPrint.pieceNumber})</span>
              <button onClick={() => setSelectedForPrint(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="p-6 space-y-4 print:p-0">
              {/* Voucher header */}
              <div className="border-b-2 border-slate-800 pb-3 flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 uppercase">PIÈCE COMPTABLE D'IMPUTATION</h3>
                  <p className="text-slate-600">Conforme aux règles d'organisation comptable du CNC (Section 4)</p>
                  <p className="font-mono mt-1 font-semibold text-blue-800">N° PIÈCE : {selectedForPrint.pieceNumber}</p>
                </div>
                <div className="text-right">
                  <span className="font-semibold text-slate-800">Date d'opération :</span> {selectedForPrint.date}<br />
                  <span className="font-semibold text-slate-800">Journal :</span> {selectedForPrint.journalCode}<br />
                  <span className="font-semibold text-slate-800">Exercice :</span> {selectedForPrint.fiscalYear}
                </div>
              </div>

              <div className="font-medium text-slate-800">
                <strong>Objet :</strong> {selectedForPrint.label}
              </div>

              {/* Table of lines */}
              <table className="w-full text-xs text-left border border-slate-300">
                <thead className="bg-slate-100 text-slate-800 border-b border-slate-300">
                  <tr>
                    <th className="p-2 border-r border-slate-300">N° Compte</th>
                    <th className="p-2 border-r border-slate-300">Intitulé</th>
                    <th className="p-2 border-r border-slate-300">Libellé</th>
                    <th className="p-2 border-r border-slate-300 text-right">Débit (DH)</th>
                    <th className="p-2 text-right">Crédit (DH)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {selectedForPrint.lines.map((l) => (
                    <tr key={l.id}>
                      <td className="p-2 font-mono font-semibold border-r border-slate-300">{l.accountNumber}</td>
                      <td className="p-2 border-r border-slate-300">{l.accountLabel}</td>
                      <td className="p-2 border-r border-slate-300">{l.label}</td>
                      <td className="p-2 text-right font-mono border-r border-slate-300">{l.debit > 0 ? l.debit.toFixed(2) : ''}</td>
                      <td className="p-2 text-right font-mono">{l.credit > 0 ? l.credit.toFixed(2) : ''}</td>
                    </tr>
                  ))}
                  <tr className="bg-slate-100 font-bold border-t-2 border-slate-300">
                    <td colSpan={3} className="p-2 text-right border-r border-slate-300 uppercase">Totaux généraux</td>
                    <td className="p-2 text-right font-mono border-r border-slate-300">{selectedForPrint.totalDebit.toFixed(2)} DH</td>
                    <td className="p-2 text-right font-mono">{selectedForPrint.totalCredit.toFixed(2)} DH</td>
                  </tr>
                </tbody>
              </table>

              {/* Signatures block required by CNC section 4.1 */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200 text-center">
                <div className="border border-slate-200 p-3 rounded">
                  <span className="font-semibold text-slate-700 block mb-8">Établi par le Comptable</span>
                  <span className="text-[10px] text-slate-400">Visa & Date</span>
                </div>
                <div className="border border-slate-200 p-3 rounded">
                  <span className="font-semibold text-slate-700 block mb-8">Vérifié par le Trésorier</span>
                  <span className="text-[10px] text-slate-400">Visa & Date</span>
                </div>
                <div className="border border-slate-200 p-3 rounded">
                  <span className="font-semibold text-slate-700 block mb-8">Approuvé par le Président</span>
                  <span className="text-[10px] text-slate-400">Signature conjointe</span>
                </div>
              </div>
            </div>

            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-2 no-print">
              <button
                type="button"
                onClick={() => setSelectedForPrint(null)}
                className="px-4 py-1.5 rounded border border-slate-300 text-slate-700 hover:bg-white"
              >
                Fermer
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-1.5 rounded bg-blue-700 hover:bg-blue-600 text-white font-bold flex items-center gap-1.5 shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimer Bordereau</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
