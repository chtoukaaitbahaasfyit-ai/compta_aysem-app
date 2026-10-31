/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Gestion Budgétaire Prévisionnel vs Réalisé pour ASSOCIATION COMPTA PRO
 */

import React, { useState } from 'react';
import {
  BarChart3,
  Plus,
  Printer,
  Download,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Filter
} from 'lucide-react';
import { BudgetItem, Project } from '../types/accounting';
import { AccountingEngine } from '../services/accountingEngine';

interface BudgetManagerProps {
  budgets: BudgetItem[];
  projects: Project[];
  fiscalYear: string;
  onUpdateBudgets: (budgets: BudgetItem[]) => void;
}

export const BudgetManager: React.FC<BudgetManagerProps> = ({
  budgets,
  projects,
  fiscalYear,
  onUpdateBudgets
}) => {
  const [filterType, setFilterType] = useState<'all' | 'recette' | 'depense'>('all');
  const [showModal, setShowModal] = useState(false);

  // New budget item form
  const [type, setType] = useState<'recette' | 'depense'>('depense');
  const [category, setCategory] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [accountNumber, setAccountNumber] = useState('6128');
  const [amountPlanned, setAmountPlanned] = useState<number>(25000);
  const [projectId, setProjectId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!category.trim() || amountPlanned <= 0) {
      alert('Veuillez renseigner la catégorie et le montant prévu.');
      return;
    }

    const newItem: BudgetItem = {
      id: `b-${Date.now()}`,
      fiscalYear,
      type,
      category: category.trim(),
      subCategory: subCategory.trim() || category.trim(),
      accountNumber,
      amountPlanned,
      amountRealized: 0,
      projectId: projectId || undefined
    };

    onUpdateBudgets([...budgets, newItem]);
    setShowModal(false);
    setCategory('');
    setSubCategory('');
  };

  const filteredBudgets = budgets.filter(b => {
    return filterType === 'all' || b.type === filterType;
  });

  const totalPlannedRecettes = budgets.filter(b => b.type === 'recette').reduce((s, b) => s + b.amountPlanned, 0);
  const totalRealizedRecettes = budgets.filter(b => b.type === 'recette').reduce((s, b) => s + b.amountRealized, 0);

  const totalPlannedDepenses = budgets.filter(b => b.type === 'depense').reduce((s, b) => s + b.amountPlanned, 0);
  const totalRealizedDepenses = budgets.filter(b => b.type === 'depense').reduce((s, b) => s + b.amountRealized, 0);

  const handleExportCSV = () => {
    const headers = ['Exercice', 'Type', 'Categorie', 'Sous_Categorie', 'Compte', 'Prevu_DH', 'Realise_DH', 'Ecart_DH', 'Taux_Realisation'];
    const rows = filteredBudgets.map(b => {
      const ecart = b.amountRealized - b.amountPlanned;
      const taux = b.amountPlanned > 0 ? ((b.amountRealized / b.amountPlanned) * 100).toFixed(1) : '0';
      return [
        b.fiscalYear,
        b.type,
        `"${b.category.replace(/"/g, '""')}"`,
        `"${b.subCategory.replace(/"/g, '""')}"`,
        b.accountNumber,
        b.amountPlanned.toFixed(2),
        b.amountRealized.toFixed(2),
        ecart.toFixed(2),
        `${taux}%`
      ].join(';');
    });

    const csv = '\uFEFF' + [headers.join(';'), ...rows].join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Budget_Previsionnel_Realise_${fiscalYear}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Title & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4 no-print">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-700" />
            Gestion Budgétaire & Comparatif Prévisionnel / Réalisé
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Budget prévisionnel équilibré exigé par les règles d'organisation financière du CNC (Section 4.1)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-xs cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Imprimer</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-xs cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Exporter CSV</span>
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded bg-blue-700 hover:bg-blue-600 text-white shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter une Ligne Budgétaire</span>
          </button>
        </div>
      </div>

      {/* Global Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 no-print">
        {/* Recettes Card */}
        <div className="bg-white p-5 rounded-lg border border-slate-300 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>Budget des Recettes (Exercice {fiscalYear})</span>
            </div>
            <span className="text-xs font-bold text-emerald-700 font-mono">
              {totalPlannedRecettes > 0 ? ((totalRealizedRecettes / totalPlannedRecettes) * 100).toFixed(1) : 0}% Recouvré
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs mb-3">
            <div className="p-2.5 rounded bg-slate-50 border border-slate-100">
              <span className="text-slate-400 uppercase text-[10px] font-semibold block">Prévu (Objectif)</span>
              <span className="font-mono-acc text-base font-bold text-slate-900">
                {AccountingEngine.formatMAD(totalPlannedRecettes)}
              </span>
            </div>
            <div className="p-2.5 rounded bg-emerald-50 border border-emerald-100">
              <span className="text-emerald-700 uppercase text-[10px] font-semibold block">Réalisé (Encaissé)</span>
              <span className="font-mono-acc text-base font-bold text-emerald-800">
                {AccountingEngine.formatMAD(totalRealizedRecettes)}
              </span>
            </div>
          </div>

          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-600 h-full rounded-full transition-all"
              style={{ width: `${totalPlannedRecettes > 0 ? Math.min(100, (totalRealizedRecettes / totalPlannedRecettes) * 100) : 0}%` }}
            ></div>
          </div>
        </div>

        {/* Dépenses Card */}
        <div className="bg-white p-5 rounded-lg border border-slate-300 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
              <TrendingDown className="w-4 h-4 text-rose-600" />
              <span>Budget des Dépenses (Exercice {fiscalYear})</span>
            </div>
            <span className="text-xs font-bold text-rose-700 font-mono">
              {totalPlannedDepenses > 0 ? ((totalRealizedDepenses / totalPlannedDepenses) * 100).toFixed(1) : 0}% Engagé
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs mb-3">
            <div className="p-2.5 rounded bg-slate-50 border border-slate-100">
              <span className="text-slate-400 uppercase text-[10px] font-semibold block">Plafond Prévu</span>
              <span className="font-mono-acc text-base font-bold text-slate-900">
                {AccountingEngine.formatMAD(totalPlannedDepenses)}
              </span>
            </div>
            <div className="p-2.5 rounded bg-rose-50 border border-rose-100">
              <span className="text-rose-700 uppercase text-[10px] font-semibold block">Réalisé (Payé)</span>
              <span className="font-mono-acc text-base font-bold text-rose-800">
                {AccountingEngine.formatMAD(totalRealizedDepenses)}
              </span>
            </div>
          </div>

          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-rose-600 h-full rounded-full transition-all"
              style={{ width: `${totalPlannedDepenses > 0 ? Math.min(100, (totalRealizedDepenses / totalPlannedDepenses) * 100) : 0}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex items-center gap-2 no-print text-xs">
        <span className="font-semibold text-slate-600">Filtrer par nature :</span>
        <button
          onClick={() => setFilterType('all')}
          className={`px-3 py-1 rounded font-semibold transition-colors ${
            filterType === 'all' ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          Tout le budget ({budgets.length})
        </button>
        <button
          onClick={() => setFilterType('recette')}
          className={`px-3 py-1 rounded font-semibold transition-colors ${
            filterType === 'recette' ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          Recettes uniquement
        </button>
        <button
          onClick={() => setFilterType('depense')}
          className={`px-3 py-1 rounded font-semibold transition-colors ${
            filterType === 'depense' ? 'bg-rose-700 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          Dépenses uniquement
        </button>
      </div>

      {/* Budget Variance Table (Tableau des Écarts Budgétaires) */}
      <div className="bg-white rounded-lg border border-slate-300 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-900 text-white font-semibold">
              <tr>
                <th className="py-2.5 px-3 w-24">Type</th>
                <th className="py-2.5 px-4">Poste Budgétaire</th>
                <th className="py-2.5 px-3">Sous-Catégorie</th>
                <th className="py-2.5 px-3 font-mono w-24">Compte</th>
                <th className="py-2.5 px-3 text-right w-32">Prévu (DH)</th>
                <th className="py-2.5 px-3 text-right w-32">Réalisé (DH)</th>
                <th className="py-2.5 px-3 text-right w-32">Écart en Valeur</th>
                <th className="py-2.5 px-3 text-center w-28">Taux Réalis.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBudgets.map((b) => {
                const ecart = b.type === 'recette'
                  ? b.amountRealized - b.amountPlanned
                  : b.amountPlanned - b.amountRealized;
                const taux = b.amountPlanned > 0 ? (b.amountRealized / b.amountPlanned) * 100 : 0;
                return (
                  <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        b.type === 'recette' ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
                      }`}>
                        {b.type}
                      </span>
                    </td>
                    <td className="py-2 px-4 font-bold text-slate-900">{b.category}</td>
                    <td className="py-2 px-3 text-slate-600">{b.subCategory}</td>
                    <td className="py-2 px-3 font-mono font-semibold text-blue-800">{b.accountNumber}</td>
                    <td className="py-2 px-3 text-right font-mono-acc text-slate-900 font-semibold">
                      {AccountingEngine.formatMAD(b.amountPlanned)}
                    </td>
                    <td className="py-2 px-3 text-right font-mono-acc font-semibold text-blue-900">
                      {AccountingEngine.formatMAD(b.amountRealized)}
                    </td>
                    <td className="py-2 px-3 text-right font-mono-acc font-semibold">
                      <span className={ecart >= 0 ? 'text-emerald-700' : 'text-rose-700'}>
                        {ecart >= 0 ? '+' : ''}{AccountingEngine.formatMAD(ecart)}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded font-mono font-bold text-[11px] ${
                        taux >= 80 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {taux.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add Budget Line */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full border border-slate-300 overflow-hidden text-xs">
            <div className="px-5 py-3 bg-slate-900 text-white font-bold flex items-center justify-between">
              <span>Nouvelle Ligne Budgétaire</span>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Type de flux *</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded bg-white font-semibold"
                  >
                    <option value="depense">Dépense (Emploi)</option>
                    <option value="recette">Recette (Ressource)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Compte Comptable *</label>
                  <input
                    type="text"
                    required
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="Ex: 6128 ou 7161"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Poste Budgétaire Principal *</label>
                <input
                  type="text"
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Ex: Caravanes Médicales ou Subventions publiques"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Sous-Poste / Détail</label>
                <input
                  type="text"
                  value={subCategory}
                  onChange={(e) => setSubCategory(e.target.value)}
                  placeholder="Ex: Achat consommables de santé"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Montant Prévisionnel Voté (DH) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  required
                  value={amountPlanned}
                  onChange={(e) => setAmountPlanned(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 font-mono text-base font-bold text-slate-900 border border-slate-300 rounded"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-1.5 rounded border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-blue-700 hover:bg-blue-600 text-white font-bold shadow-xs cursor-pointer"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
