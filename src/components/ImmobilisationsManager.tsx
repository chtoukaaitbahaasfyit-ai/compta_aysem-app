/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Registre des Immobilisations & Amortissements pour ASSOCIATION COMPTA PRO
 */

import React, { useState } from 'react';
import {
  Package,
  Plus,
  Printer,
  Download,
  Info,
  Building,
  CheckCircle2
} from 'lucide-react';
import { Immobilisation } from '../types/accounting';
import { AccountingEngine } from '../services/accountingEngine';

interface ImmobilisationsManagerProps {
  immobilisations: Immobilisation[];
  fiscalYear: string;
  onUpdateImmobilisations: (immobs: Immobilisation[]) => void;
}

export const ImmobilisationsManager: React.FC<ImmobilisationsManagerProps> = ({
  immobilisations,
  fiscalYear,
  onUpdateImmobilisations
}) => {
  const [showModal, setShowModal] = useState(false);

  // New asset form
  const [code, setCode] = useState('');
  const [label, setLabel] = useState('');
  const [category, setCategory] = useState<Immobilisation['category']>('materiel_informatique');
  const [acquisitionDate, setAcquisitionDate] = useState(new Date().toISOString().split('T')[0]);
  const [acquisitionValue, setAcquisitionValue] = useState<number>(10000);
  const [durationYears, setDurationYears] = useState<number>(3);
  const [location, setLocation] = useState('Siège Casablanca');
  const [state, setState] = useState<Immobilisation['state']>('bon');

  const getAccountsForCategory = (cat: Immobilisation['category']) => {
    switch (cat) {
      case 'materiel_informatique':
        return { asset: '2352', amort: '2835', dotation: '6193' };
      case 'mobilier':
        return { asset: '2351', amort: '2835', dotation: '6193' };
      case 'equipement':
        return { asset: '2332', amort: '2832', dotation: '6193' };
      case 'vehicule':
        return { asset: '2340', amort: '2834', dotation: '6193' };
      default:
        return { asset: '2355', amort: '2835', dotation: '6193' };
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim() || acquisitionValue <= 0) {
      alert('Veuillez renseigner la désignation et la valeur d\'acquisition.');
      return;
    }

    const accounts = getAccountsForCategory(category);
    const rate = durationYears > 0 ? (100 / durationYears) : 20;

    const newImmob: Immobilisation = {
      id: `imm-${Date.now()}`,
      code: code.trim().toUpperCase() || `IMM-${Math.floor(100 + Math.random() * 900)}`,
      label: label.trim(),
      category,
      acquisitionDate,
      acquisitionValue,
      amortisationMethod: 'lineaire',
      durationYears,
      depreciationRate: Math.round(rate * 100) / 100,
      accumulatedDepreciation: 0,
      netBookValue: acquisitionValue,
      location: location.trim(),
      state,
      accountAsset: accounts.asset,
      accountAmort: accounts.amort,
      accountDotation: accounts.dotation
    };

    onUpdateImmobilisations([...immobilisations, newImmob]);
    setShowModal(false);
    setCode('');
    setLabel('');
  };

  const totalAcquisition = immobilisations.reduce((s, i) => s + i.acquisitionValue, 0);
  const totalAmort = immobilisations.reduce((s, i) => s + i.accumulatedDepreciation, 0);
  const totalVNC = immobilisations.reduce((s, i) => s + i.netBookValue, 0);

  const handleExportCSV = () => {
    const headers = ['Code', 'Designation', 'Categorie', 'Date_Acquisition', 'Valeur_Acquisition_DH', 'Duree_Ans', 'Taux_Amort', 'Amort_Cumules_DH', 'VNC_DH', 'Compte_Actif', 'Localisation'];
    const rows = immobilisations.map(i => [
      `"${i.code}"`,
      `"${i.label.replace(/"/g, '""')}"`,
      i.category,
      i.acquisitionDate,
      i.acquisitionValue.toFixed(2),
      i.durationYears,
      `${i.depreciationRate}%`,
      i.accumulatedDepreciation.toFixed(2),
      i.netBookValue.toFixed(2),
      i.accountAsset,
      `"${i.location.replace(/"/g, '""')}"`
    ]);

    const csv = '\uFEFF' + [headers.join(';'), ...rows].join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Registre_Immobilisations_${fiscalYear}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Title & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4 no-print">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-700" />
            Registre des Immobilisations & Tableau des Amortissements
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Suivi des actifs durables de l'association, amortissements linéaires et calcul de la VNC
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
            <span>Nouvelle Immobilisation</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 no-print">
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Valeur Brute d'Acquisition</span>
          <div className="text-xl font-bold font-mono-acc text-slate-900 mt-1">
            {AccountingEngine.formatMAD(totalAcquisition)}
          </div>
          <span className="text-[11px] text-slate-500">{immobilisations.length} biens inscrits à l'actif</span>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Amortissements Cumulés</span>
          <div className="text-xl font-bold font-mono-acc text-slate-700 mt-1">
            {AccountingEngine.formatMAD(totalAmort)}
          </div>
          <span className="text-[11px] text-slate-500">Comptabilisés au compte 28</span>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Valeur Nette Comptable (VNC)</span>
          <div className="text-xl font-bold font-mono-acc text-blue-700 mt-1">
            {AccountingEngine.formatMAD(totalVNC)}
          </div>
          <span className="text-[11px] text-blue-600 font-medium">Actif Net au Bilan</span>
        </div>
      </div>

      {/* Moroccan Specific Rule on Donated Assets */}
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-md text-xs text-blue-900 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
        <div>
          <strong className="font-semibold text-blue-950">Règle CNC 2023 pour les Biens Reçus en Legs ou Donations :</strong> Les biens destinés à être utilisés pour les besoins de l'association sont inscrits en immobilisations corporelles (23) avec pour contrepartie les fonds propres (compte 1115 ou 1125). Les biens destinés à être revendus sont inscrits au compte spécifique <strong>2371</strong> et ne sont pas amortissables (constatation de provisions pour dépréciation au compte 2911 si nécessaire).
        </div>
      </div>

      {/* Assets Table */}
      <div className="bg-white rounded-lg border border-slate-300 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-900 text-white font-semibold">
              <tr>
                <th className="py-2.5 px-3 w-28">Code Bien</th>
                <th className="py-2.5 px-4">Désignation</th>
                <th className="py-2.5 px-3 w-24">Date Acquis.</th>
                <th className="py-2.5 px-3 w-20 font-mono">Compte</th>
                <th className="py-2.5 px-3 text-right w-28">Val. Brut (DH)</th>
                <th className="py-2.5 px-3 text-center w-20">Taux</th>
                <th className="py-2.5 px-3 text-right w-28">Amort. (DH)</th>
                <th className="py-2.5 px-3 text-right w-28">VNC (DH)</th>
                <th className="py-2.5 px-3 w-32">Localisation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {immobilisations.map((i) => (
                <tr key={i.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2 px-3 font-mono font-semibold text-blue-800">{i.code}</td>
                  <td className="py-2 px-4 font-medium text-slate-900">
                    {i.label}
                    <span className="block text-[10px] text-slate-400 capitalize">{i.category.replace('_', ' ')} • État : {i.state}</span>
                  </td>
                  <td className="py-2 px-3 font-mono text-slate-600">{i.acquisitionDate}</td>
                  <td className="py-2 px-3 font-mono font-semibold text-slate-700">{i.accountAsset}</td>
                  <td className="py-2 px-3 text-right font-mono-acc font-semibold text-slate-900">
                    {AccountingEngine.formatMAD(i.acquisitionValue)}
                  </td>
                  <td className="py-2 px-3 text-center font-mono font-semibold text-slate-700">
                    {i.depreciationRate}%
                  </td>
                  <td className="py-2 px-3 text-right font-mono-acc font-semibold text-slate-600">
                    {AccountingEngine.formatMAD(i.accumulatedDepreciation)}
                  </td>
                  <td className="py-2 px-3 text-right font-mono-acc font-bold text-blue-900">
                    {AccountingEngine.formatMAD(i.netBookValue)}
                  </td>
                  <td className="py-2 px-3 text-slate-600 text-[11px]">{i.location}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-50 font-bold border-t-2 border-slate-300 text-slate-900">
                <td colSpan={4} className="py-2.5 px-4 text-right uppercase text-[11px]">Totaux généraux :</td>
                <td className="py-2.5 px-3 text-right font-mono text-slate-900">{totalAcquisition.toFixed(2)}</td>
                <td></td>
                <td className="py-2.5 px-3 text-right font-mono text-slate-600">{totalAmort.toFixed(2)}</td>
                <td className="py-2.5 px-3 text-right font-mono text-blue-900">{totalVNC.toFixed(2)}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Modal Add Asset */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full border border-slate-300 overflow-hidden text-xs">
            <div className="px-5 py-3 bg-slate-900 text-white font-bold flex items-center justify-between">
              <span>Ajouter une Immobilisation</span>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Code Bien *</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Ex: IMM-PC-04"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono uppercase"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Catégorie *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded bg-white"
                  >
                    <option value="materiel_informatique">Matériel Informatique (2352)</option>
                    <option value="mobilier">Mobilier de bureau (2351)</option>
                    <option value="equipement">Équipement & Matériel (2332)</option>
                    <option value="vehicule">Matériel de transport (2340)</option>
                    <option value="autre">Autre immobilisation</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Désignation du bien *</label>
                <input
                  type="text"
                  required
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="Ex: Photocopieur multifonction Canon"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date d'acquisition *</label>
                  <input
                    type="date"
                    required
                    value={acquisitionDate}
                    onChange={(e) => setAcquisitionDate(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Valeur d'origine (DH) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    value={acquisitionValue}
                    onChange={(e) => setAcquisitionValue(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 font-mono font-bold text-slate-900 border border-slate-300 rounded"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Durée d'amortissement</label>
                  <select
                    value={durationYears}
                    onChange={(e) => setDurationYears(parseInt(e.target.value))}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded bg-white"
                  >
                    <option value={3}>3 ans (Informatique - 33.33%)</option>
                    <option value={5}>5 ans (Matériel / Mobilier - 20%)</option>
                    <option value={10}>10 ans (Agencements - 10%)</option>
                    <option value={20}>20 ans (Bâtiments - 5%)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">État du bien</label>
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value as any)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded bg-white"
                  >
                    <option value="neuf">Neuf</option>
                    <option value="bon">Bon état</option>
                    <option value="moyen">État moyen</option>
                    <option value="usage">Usagé</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Emplacement / Affectation</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Ex: Secrétariat ou Local Caravanes"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded"
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
