/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Saisie des écritures comptables style SAGE 100 pour ASSOCIATION COMPTA PRO
 */

import React, { useState, useEffect } from 'react';
import {
  FileEdit,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Layers,
  Sparkles,
  Save,
  ArrowRight
} from 'lucide-react';
import {
  Account,
  AccountingEntry,
  EntryLine,
  JournalCode,
  Project,
  Member
} from '../types/accounting';
import { JOURNALS_LIST } from '../data/moroccanChartOfAccounts';
import { AccountingEngine } from '../services/accountingEngine';

interface JournalEntryFormProps {
  accounts: Account[];
  projects: Project[];
  members: Member[];
  fiscalYear: string;
  onSaveEntry: (entry: AccountingEntry) => void;
  onCancel: () => void;
}

export const JournalEntryForm: React.FC<JournalEntryFormProps> = ({
  accounts,
  projects,
  members,
  fiscalYear,
  onSaveEntry,
  onCancel
}) => {
  const [journalCode, setJournalCode] = useState<JournalCode>('BQ');
  const [entryDate, setEntryDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [pieceNumber, setPieceNumber] = useState<string>('');
  const [entryLabel, setEntryLabel] = useState<string>('');
  const [attachmentName, setAttachmentName] = useState<string>('');
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Multi-line entries
  const [lines, setLines] = useState<EntryLine[]>([
    {
      id: 'l-1',
      lineNumber: 1,
      accountNumber: '514101',
      accountLabel: 'Banque Attijariwafa Bank - Compte Principal',
      label: '',
      debit: 0,
      credit: 0,
      thirdParty: '',
      projectId: ''
    },
    {
      id: 'l-2',
      lineNumber: 2,
      accountNumber: '71711',
      accountLabel: 'Cotisations sans contrepartie',
      label: '',
      debit: 0,
      credit: 0,
      thirdParty: '',
      projectId: ''
    }
  ]);

  // Generate automated piece number when journal changes
  useEffect(() => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    setPieceNumber(`${journalCode}-${fiscalYear}-${randomSuffix}`);
  }, [journalCode, fiscalYear]);

  // Calculations
  const totalDebit = lines.reduce((sum, l) => sum + (Number(l.debit) || 0), 0);
  const totalCredit = lines.reduce((sum, l) => sum + (Number(l.credit) || 0), 0);
  const difference = Math.abs(Math.round((totalDebit - totalCredit) * 100) / 100);
  const isBalanced = difference < 0.01 && totalDebit > 0;

  const handleAccountChange = (index: number, accNum: string) => {
    const found = accounts.find(a => a.number === accNum);
    const updated = [...lines];
    updated[index].accountNumber = accNum;
    if (found) {
      updated[index].accountLabel = found.label;
    }
    setLines(updated);
  };

  const handleLineFieldChange = (index: number, field: keyof EntryLine, value: any) => {
    const updated = [...lines];
    (updated[index] as any)[field] = value;
    setLines(updated);
  };

  const handleAddLine = () => {
    // Determine suggested balanced amount for convenience (SAGE 100 feature)
    let suggestedDebit = 0;
    let suggestedCredit = 0;
    if (totalDebit > totalCredit) {
      suggestedCredit = totalDebit - totalCredit;
    } else if (totalCredit > totalDebit) {
      suggestedDebit = totalCredit - totalDebit;
    }

    const newLine: EntryLine = {
      id: `l-${Date.now()}-${lines.length + 1}`,
      lineNumber: lines.length + 1,
      accountNumber: '',
      accountLabel: '',
      label: entryLabel || '',
      debit: suggestedDebit,
      credit: suggestedCredit,
      thirdParty: '',
      projectId: ''
    };
    setLines([...lines, newLine]);
  };

  const handleRemoveLine = (index: number) => {
    if (lines.length <= 2) {
      alert('Une écriture comptable doit comporter au minimum 2 lignes.');
      return;
    }
    const updated = lines.filter((_, i) => i !== index).map((l, i) => ({ ...l, lineNumber: i + 1 }));
    setLines(updated);
  };

  // Predefined Moroccan Accounting Templates (SAGE 100 Modèles de saisie)
  const applyTemplate = (templateName: string) => {
    if (templateName === 'cotisation') {
      setJournalCode('CA');
      setEntryLabel('Encaissement cotisations adhérents');
      setLines([
        {
          id: 'l-t-1',
          lineNumber: 1,
          accountNumber: '516101',
          accountLabel: 'Caisse Principale (Siège de l\'association)',
          label: 'Encaissement espèces cotisations',
          debit: 1500,
          credit: 0
        },
        {
          id: 'l-t-2',
          lineNumber: 2,
          accountNumber: '71711',
          accountLabel: 'Cotisations sans contrepartie',
          label: 'Cotisations annuelles des membres',
          debit: 0,
          credit: 1500
        }
      ]);
    } else if (templateName === 'subvention') {
      setJournalCode('BQ');
      setEntryLabel('Encaissement tranche subvention INDH');
      setLines([
        {
          id: 'l-t-1',
          lineNumber: 1,
          accountNumber: '514101',
          accountLabel: 'Banque Attijariwafa Bank - Compte Principal',
          label: 'Virement reçu Trésorerie Préfecture',
          debit: 50000,
          credit: 0,
          thirdParty: 'INDH Préfecture',
          projectId: projects[0]?.id || ''
        },
        {
          id: 'l-t-2',
          lineNumber: 2,
          accountNumber: '7161',
          accountLabel: 'Subventions d\'exploitation de l\'exercice (État, INDH)',
          label: 'Subvention affectée projet',
          debit: 0,
          credit: 50000,
          thirdParty: 'INDH Préfecture',
          projectId: projects[0]?.id || ''
        }
      ]);
    } else if (templateName === 'benevolat') {
      setJournalCode('OD');
      setEntryLabel('Valorisation du temps de bénévolat médical (Classe 0)');
      setLines([
        {
          id: 'l-t-1',
          lineNumber: 1,
          accountNumber: '044',
          accountLabel: 'Personnel bénévole',
          label: 'Consultations médicales bénévoles 30h x 250 DH',
          debit: 7500,
          credit: 0,
          projectId: projects[0]?.id || ''
        },
        {
          id: 'l-t-2',
          lineNumber: 2,
          accountNumber: '054',
          accountLabel: 'Contributions volontaires en nature - Bénévolat',
          label: 'Valorisation des compétences bénévoles',
          debit: 0,
          credit: 7500,
          projectId: projects[0]?.id || ''
        }
      ]);
    } else if (templateName === 'achat') {
      setJournalCode('AC');
      setEntryLabel('Achat fournitures activités projet social');
      setLines([
        {
          id: 'l-t-1',
          lineNumber: 1,
          accountNumber: '6128',
          accountLabel: 'Fournitures pour ateliers, actions sociales et projets',
          label: 'Achat fournitures caravane',
          debit: 3800,
          credit: 0,
          thirdParty: 'Fournisseur Matériel',
          projectId: projects[0]?.id || ''
        },
        {
          id: 'l-t-2',
          lineNumber: 2,
          accountNumber: '4411',
          accountLabel: 'Fournisseurs',
          label: 'Facture Fournisseur',
          debit: 0,
          credit: 3800,
          thirdParty: 'Fournisseur Matériel'
        }
      ]);
    }
  };

  const handlePreSave = () => {
    const validation = AccountingEngine.validateEntry(lines);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      return;
    }

    if (!entryLabel.trim()) {
      setValidationErrors(['Veuillez saisir un libellé général pour l\'écriture comptable.']);
      return;
    }

    setValidationErrors([]);
    setShowConfirmModal(true);
  };

  const handleConfirmSave = () => {
    const period = entryDate.substring(0, 7);
    const newEntry: AccountingEntry = {
      id: `ent-${Date.now()}`,
      pieceNumber: pieceNumber.trim(),
      journalCode,
      date: entryDate,
      period,
      fiscalYear,
      label: entryLabel.trim(),
      lines: lines.map((l, idx) => ({
        ...l,
        lineNumber: idx + 1,
        debit: Number(l.debit) || 0,
        credit: Number(l.credit) || 0,
        label: l.label?.trim() || entryLabel.trim()
      })),
      totalDebit,
      totalCredit,
      isBalanced: true,
      status: 'valide',
      sourceModule: 'general',
      attachmentName: attachmentName || undefined,
      createdAt: new Date().toISOString(),
      createdBy: 'Trésorier en fonction'
    };

    onSaveEntry(newEntry);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Title & Templates bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileEdit className="w-5 h-5 text-blue-700" />
            Saisie des Écritures Comptables (Partie Double)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Grille de saisie conforme au Plan Comptable Marocain des Associations et à l'ergonomie SAGE 100
          </p>
        </div>

        {/* Templates quick selector */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-md text-xs">
          <span className="text-[11px] font-semibold text-slate-500 px-2 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Modèles rapides :
          </span>
          <button
            type="button"
            onClick={() => applyTemplate('cotisation')}
            className="px-2 py-1 rounded bg-white hover:bg-slate-50 text-slate-700 font-medium shadow-2xs border border-slate-200"
          >
            Cotisation Adhérents
          </button>
          <button
            type="button"
            onClick={() => applyTemplate('subvention')}
            className="px-2 py-1 rounded bg-white hover:bg-slate-50 text-slate-700 font-medium shadow-2xs border border-slate-200"
          >
            Subvention INDH
          </button>
          <button
            type="button"
            onClick={() => applyTemplate('achat')}
            className="px-2 py-1 rounded bg-white hover:bg-slate-50 text-slate-700 font-medium shadow-2xs border border-slate-200"
          >
            Achat & Fournitures
          </button>
          <button
            type="button"
            onClick={() => applyTemplate('benevolat')}
            className="px-2 py-1 rounded bg-white hover:bg-slate-50 text-slate-700 font-medium shadow-2xs border border-slate-200"
          >
            Bénévolat (Classe 0)
          </button>
        </div>
      </div>

      {/* Validation Errors banner */}
      {validationErrors.length > 0 && (
        <div className="p-3 bg-rose-50 border border-rose-300 rounded-md text-xs text-rose-800 space-y-1">
          <div className="font-bold flex items-center gap-1.5 text-rose-900">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            Erreurs empêchant la validation de l'écriture :
          </div>
          <ul className="list-disc pl-5 space-y-0.5">
            {validationErrors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Header Form Controls (SAGE 100 style voucher banner) */}
      <div className="bg-white p-4 rounded-lg border border-slate-300 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          {/* Journal selector */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Code Journal *
            </label>
            <select
              value={journalCode}
              onChange={(e) => setJournalCode(e.target.value as JournalCode)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded bg-white font-semibold text-blue-900 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            >
              {JOURNALS_LIST.map((j) => (
                <option key={j.code} value={j.code}>
                  [{j.code}] {j.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Date de l'opération *
            </label>
            <input
              type="date"
              value={entryDate}
              onChange={(e) => setEntryDate(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded bg-white font-mono focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Piece Number */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              N° de Pièce Comptable *
            </label>
            <input
              type="text"
              value={pieceNumber}
              onChange={(e) => setPieceNumber(e.target.value)}
              placeholder="Ex: BQ-2026-0005"
              className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono font-bold text-slate-900 bg-slate-50 focus:bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Document Justificatif / Attachment */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <Upload className="w-3.5 h-3.5 text-slate-500" /> Pièce Justificative (GED / Drive)
            </label>
            <input
              type="text"
              value={attachmentName}
              onChange={(e) => setAttachmentName(e.target.value)}
              placeholder="Ex: Facture_F9821.pdf"
              className="w-full px-3 py-1.5 border border-slate-300 rounded bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none text-[11px]"
            />
          </div>
        </div>

        {/* General Label */}
        <div>
          <label className="block font-semibold text-slate-700 mb-1 text-xs">
            Libellé Général de l'Écriture *
          </label>
          <input
            type="text"
            value={entryLabel}
            onChange={(e) => {
              setEntryLabel(e.target.value);
              // auto-populate empty line labels
              setLines(lines.map(l => ({ ...l, label: l.label || e.target.value })));
            }}
            placeholder="Ex: Règlement facture fournitures scolaires pour collèges ruraux"
            className="w-full px-3 py-2 border border-slate-300 rounded font-medium text-slate-900 bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none text-xs"
          />
        </div>
      </div>

      {/* Grid of Entry Lines (Dense SAGE 100 table) */}
      <div className="bg-white rounded-lg border border-slate-300 shadow-xs overflow-hidden">
        <div className="px-4 py-2.5 bg-slate-100 border-b border-slate-300 flex items-center justify-between text-xs font-semibold text-slate-700">
          <span>Lignes de l'Écriture Comptable ({lines.length} lignes)</span>
          <button
            type="button"
            onClick={handleAddLine}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-blue-700 hover:bg-blue-600 text-white font-medium shadow-2xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Ajouter une ligne</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-800 text-slate-200 border-b border-slate-700 font-semibold">
                <th className="py-2 px-2 text-center w-10">N°</th>
                <th className="py-2 px-3 w-40">Compte</th>
                <th className="py-2 px-3 w-56">Intitulé du Compte</th>
                <th className="py-2 px-3 min-w-[200px]">Libellé de la ligne</th>
                <th className="py-2 px-3 w-32 text-right">Débit (DH)</th>
                <th className="py-2 px-3 w-32 text-right">Crédit (DH)</th>
                <th className="py-2 px-3 w-36">Tiers</th>
                <th className="py-2 px-3 w-36">Projet Rattaché</th>
                <th className="py-2 px-2 text-center w-12">Act.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {lines.map((line, idx) => (
                <tr key={line.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2 px-2 text-center font-mono font-semibold text-slate-400">
                    {idx + 1}
                  </td>

                  {/* Account Selector */}
                  <td className="py-1.5 px-2">
                    <select
                      value={line.accountNumber}
                      onChange={(e) => handleAccountChange(idx, e.target.value)}
                      className="w-full px-2 py-1 font-mono font-semibold text-blue-900 border border-slate-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="">-- Choisir compte --</option>
                      {accounts.map((a) => (
                        <option key={a.number} value={a.number}>
                          {a.number} - {a.label.substring(0, 30)}
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* Account Label (read only preview) */}
                  <td className="py-1.5 px-3 text-slate-600 truncate max-w-xs font-medium">
                    {line.accountLabel || '-'}
                  </td>

                  {/* Line label */}
                  <td className="py-1.5 px-2">
                    <input
                      type="text"
                      value={line.label}
                      onChange={(e) => handleLineFieldChange(idx, 'label', e.target.value)}
                      placeholder="Libellé spécifique..."
                      className="w-full px-2 py-1 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </td>

                  {/* Debit */}
                  <td className="py-1.5 px-2">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={line.debit || ''}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        handleLineFieldChange(idx, 'debit', val);
                        if (val > 0) handleLineFieldChange(idx, 'credit', 0);
                      }}
                      placeholder="0.00"
                      className="w-full px-2 py-1 text-right font-mono font-semibold text-blue-950 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-blue-50/30"
                    />
                  </td>

                  {/* Credit */}
                  <td className="py-1.5 px-2">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={line.credit || ''}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        handleLineFieldChange(idx, 'credit', val);
                        if (val > 0) handleLineFieldChange(idx, 'debit', 0);
                      }}
                      placeholder="0.00"
                      className="w-full px-2 py-1 text-right font-mono font-semibold text-slate-900 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-50/50"
                    />
                  </td>

                  {/* Third party */}
                  <td className="py-1.5 px-2">
                    <input
                      type="text"
                      value={line.thirdParty || ''}
                      onChange={(e) => handleLineFieldChange(idx, 'thirdParty', e.target.value)}
                      placeholder="Adhérent/Fourn."
                      className="w-full px-2 py-1 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </td>

                  {/* Project selector */}
                  <td className="py-1.5 px-2">
                    <select
                      value={line.projectId || ''}
                      onChange={(e) => handleLineFieldChange(idx, 'projectId', e.target.value)}
                      className="w-full px-2 py-1 border border-slate-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-[11px]"
                    >
                      <option value="">Aucun</option>
                      {projects.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.code} - {p.title.substring(0, 20)}
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* Actions */}
                  <td className="py-1.5 px-2 text-center">
                    <button
                      type="button"
                      onClick={() => handleRemoveLine(idx)}
                      disabled={lines.length <= 2}
                      className="p-1 text-slate-400 hover:text-rose-600 disabled:opacity-30 disabled:hover:text-slate-400 cursor-pointer"
                      title="Supprimer cette ligne"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Balance Banner (SAGE 100 Live Balance Bar) */}
        <div className="p-4 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-4 border-t border-slate-800">
          <div className="flex items-center gap-6 text-xs">
            <div>
              <span className="text-slate-400 uppercase text-[10px] font-semibold block">Total Débit</span>
              <span className="font-mono-acc text-sm font-bold text-sky-300">
                {AccountingEngine.formatMAD(totalDebit)}
              </span>
            </div>

            <div>
              <span className="text-slate-400 uppercase text-[10px] font-semibold block">Total Crédit</span>
              <span className="font-mono-acc text-sm font-bold text-emerald-300">
                {AccountingEngine.formatMAD(totalCredit)}
              </span>
            </div>

            <div className="pl-4 border-l border-slate-700">
              <span className="text-slate-400 uppercase text-[10px] font-semibold block">Écart Débit / Crédit</span>
              <span className={`font-mono-acc text-sm font-bold ${isBalanced ? 'text-emerald-400' : 'text-rose-400'}`}>
                {AccountingEngine.formatMAD(difference)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isBalanced ? (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-950 border border-emerald-600 text-emerald-300 text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Écriture équilibrée (Prête pour validation)</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-rose-950 border border-rose-600 text-rose-300 text-xs font-semibold">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>Écriture déséquilibrée (Interdiction d'enregistrement)</span>
              </div>
            )}

            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 rounded text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Annuler
            </button>

            <button
              type="button"
              onClick={handlePreSave}
              disabled={!isBalanced}
              className="flex items-center gap-1.5 px-5 py-2 rounded text-xs font-semibold bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white shadow transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Valider l'Écriture (F10)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal before recording sensitive accounting entry */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full border border-slate-300 overflow-hidden text-xs">
            <div className="px-5 py-3 bg-slate-900 text-white font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Confirmation de Validation Comptable
            </div>

            <div className="p-5 space-y-3 text-slate-700">
              <p>
                Vous êtes sur le point de valider définitivement la pièce comptable :
              </p>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded font-mono space-y-1">
                <div><strong>N° Pièce :</strong> {pieceNumber}</div>
                <div><strong>Journal :</strong> {journalCode}</div>
                <div><strong>Date :</strong> {entryDate}</div>
                <div><strong>Montant :</strong> {AccountingEngine.formatMAD(totalDebit)}</div>
                <div><strong>Lignes :</strong> {lines.length}</div>
              </div>
              <p className="text-[11px] text-slate-500 italic">
                * Note de conformité CNC : Une écriture validée ne peut pas être supprimée. Toute correction ultérieure devra être effectuée par contrepassation / extourne pour conserver la piste d'audit.
              </p>
            </div>

            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-1.5 rounded border border-slate-300 text-slate-700 hover:bg-white font-medium cursor-pointer"
              >
                Retourner à la saisie
              </button>
              <button
                type="button"
                onClick={handleConfirmSave}
                className="px-4 py-1.5 rounded bg-blue-700 hover:bg-blue-600 text-white font-bold shadow-xs cursor-pointer"
              >
                Confirmer & Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
