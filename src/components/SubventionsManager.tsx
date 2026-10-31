/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Gestion des Subventions & Financements Publics (Circulaire PM 13/2022 & Fonds Dédiés Cl. 19)
 */

import React, { useState } from 'react';
import {
  Award,
  Plus,
  Printer,
  Download,
  Search,
  CheckCircle2,
  FileText,
  Building2,
  AlertTriangle,
  Info
} from 'lucide-react';
import { Subvention, Project, AccountingEntry } from '../types/accounting';
import { AccountingEngine } from '../services/accountingEngine';

interface SubventionsManagerProps {
  subventions: Subvention[];
  projects: Project[];
  fiscalYear: string;
  onAddSubvention: (subvention: Subvention) => void;
  onNewEntry: () => void;
}

export const SubventionsManager: React.FC<SubventionsManagerProps> = ({
  subventions,
  projects,
  fiscalYear,
  onAddSubvention,
  onNewEntry
}) => {
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'liste' | 'circulaire13' | 'fondsDedies'>('liste');

  // New subvention form
  const [bailleur, setBailleur] = useState('');
  const [typeBailleur, setTypeBailleur] = useState<Subvention['typeBailleur']>('collectivite');
  const [projectTitle, setProjectTitle] = useState('');
  const [conventionNumber, setConventionNumber] = useState('');
  const [conventionDate, setConventionDate] = useState(new Date().toISOString().split('T')[0]);
  const [conventionDuration, setConventionDuration] = useState('12 mois');
  const [amountGranted, setAmountGranted] = useState<number>(100000);
  const [amountReceived, setAmountReceived] = useState<number>(60000);
  const [amountSpent, setAmountSpent] = useState<number>(0);
  const [isDedicatedFunds, setIsDedicatedFunds] = useState<boolean>(true);
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bailleur.trim() || !projectTitle.trim() || amountGranted <= 0) {
      alert('Veuillez remplir les champs obligatoires.');
      return;
    }

    const remaining = amountReceived - amountSpent;
    const newSub: Subvention = {
      id: `sub-${Date.now()}`,
      bailleur: bailleur.trim(),
      typeBailleur,
      projectTitle: projectTitle.trim(),
      conventionNumber: conventionNumber.trim() || `CONV-${fiscalYear}-${Math.floor(100 + Math.random() * 900)}`,
      conventionDate,
      conventionDuration,
      amountGranted,
      amountReceived,
      amountCommitted: amountSpent,
      amountSpent,
      balanceRemaining: remaining,
      isDedicatedFunds,
      dedicatedAccountCode: isDedicatedFunds ? '1941' : undefined,
      circularPm13Compliance: true,
      notes: notes.trim()
    };

    onAddSubvention(newSub);
    setShowModal(false);
    setBailleur('');
    setProjectTitle('');
    setNotes('');
  };

  const filtered = subventions.filter(s =>
    s.bailleur.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.projectTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.conventionNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalGranted = subventions.reduce((s, sub) => s + sub.amountGranted, 0);
  const totalReceived = subventions.reduce((s, sub) => s + sub.amountReceived, 0);
  const totalSpent = subventions.reduce((s, sub) => s + sub.amountSpent, 0);
  const totalRemaining = totalReceived - totalSpent;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Title & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4 no-print">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Award className="w-5 h-5 text-blue-700" />
            Gestion des Subventions & Financements Publics
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Conventions d'attribution, fonds dédiés (Classe 19) et conformité Circulaire PM n°13/2022
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Sub tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs mr-2">
            <button
              onClick={() => setActiveTab('liste')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                activeTab === 'liste' ? 'bg-blue-700 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Conventions ({subventions.length})
            </button>
            <button
              onClick={() => setActiveTab('circulaire13')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                activeTab === 'circulaire13' ? 'bg-blue-700 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              État S7 (Circulaire 13/2022)
            </button>
            <button
              onClick={() => setActiveTab('fondsDedies')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                activeTab === 'fondsDedies' ? 'bg-blue-700 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Fonds Dédiés (Cl. 19)
            </button>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded bg-blue-700 hover:bg-blue-600 text-white shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nouvelle Convention</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 no-print">
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Subventions Accordées</span>
          <div className="text-xl font-bold font-mono-acc text-slate-900 mt-1">
            {AccountingEngine.formatMAD(totalGranted)}
          </div>
          <span className="text-[11px] text-slate-500">{subventions.length} conventions actives</span>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Fonds Débloqués (Reçus)</span>
          <div className="text-xl font-bold font-mono-acc text-emerald-700 mt-1">
            {AccountingEngine.formatMAD(totalReceived)}
          </div>
          <span className="text-[11px] text-emerald-600 font-medium">Encaissé sur comptes bancaires</span>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Dépenses Imputées</span>
          <div className="text-xl font-bold font-mono-acc text-rose-700 mt-1">
            {AccountingEngine.formatMAD(totalSpent)}
          </div>
          <span className="text-[11px] text-slate-500">
            {totalReceived > 0 ? ((totalSpent / totalReceived) * 100).toFixed(1) : 0}% consommé
          </span>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Reliquat à Clôture</span>
          <div className="text-xl font-bold font-mono-acc text-blue-700 mt-1">
            {AccountingEngine.formatMAD(totalRemaining)}
          </div>
          <span className="text-[11px] text-blue-600 font-medium">À reporter en fonds dédiés (1941)</span>
        </div>
      </div>

      {/* Tab 1: Liste des Conventions */}
      {activeTab === 'liste' && (
        <div className="bg-white rounded-lg border border-slate-300 shadow-xs overflow-hidden">
          <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
            <div className="relative w-72">
              <Search className="w-4 h-4 absolute left-3 top-2 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher par bailleur, convention..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1 bg-white border border-slate-200 rounded text-xs"
              />
            </div>
            <span className="text-slate-500">Total : {filtered.length} subventions</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-900 text-white font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Bailleur / Organisme</th>
                  <th className="py-2.5 px-3">N° Convention</th>
                  <th className="py-2.5 px-3">Projet / Activité</th>
                  <th className="py-2.5 px-3 text-right">Accordé (DH)</th>
                  <th className="py-2.5 px-3 text-right">Encaissé (DH)</th>
                  <th className="py-2.5 px-3 text-right">Dépensé (DH)</th>
                  <th className="py-2.5 px-3 text-right">Reliquat (DH)</th>
                  <th className="py-2.5 px-3 text-center">Fonds Dédiés</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-slate-900">
                      {s.bailleur}
                      <span className="block text-[10px] text-slate-400 font-normal uppercase">{s.typeBailleur}</span>
                    </td>
                    <td className="py-2.5 px-3 font-mono font-semibold text-blue-700">
                      {s.conventionNumber}
                      <span className="block text-[10px] text-slate-400 font-normal">{s.conventionDate}</span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-800 font-medium">
                      {s.projectTitle}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono-acc text-slate-900 font-semibold">
                      {AccountingEngine.formatMAD(s.amountGranted)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono-acc text-emerald-700 font-semibold">
                      {AccountingEngine.formatMAD(s.amountReceived)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono-acc text-rose-700 font-semibold">
                      {AccountingEngine.formatMAD(s.amountSpent)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono-acc text-blue-700 font-bold">
                      {AccountingEngine.formatMAD(s.balanceRemaining)}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {s.isDedicatedFunds ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                          Compte 1941
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Exploitation</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Circulaire PM 13/2022 (Tableau Officiel État S7) */}
      {activeTab === 'circulaire13' && (
        <div className="bg-white rounded-lg border border-slate-300 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase">
                ÉTAT S7 : COMPTES ANNUELS DES SUBVENTIONS ET CONCOURS PUBLICS REÇUS
              </h3>
              <p className="text-[11px] text-slate-500">
                Conforme à la circulaire de Monsieur le Chef du Gouvernement n° 13/2022 du 12 juillet 2022
              </p>
            </div>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 shadow-2xs no-print cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Imprimer État S7</span>
            </button>
          </div>

          {/* Tableau 1: Ressources reçues */}
          <div>
            <h4 className="font-bold text-xs text-slate-800 mb-2">
              1. Tableau relatif aux ressources reçues dans le cadre des subventions de l'exercice
            </h4>
            <div className="overflow-x-auto border border-slate-200 rounded">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-800 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-2.5 border-r border-slate-200">Bailleur de fonds</th>
                    <th className="py-2 px-2.5 border-r border-slate-200">Cadre conventionnel</th>
                    <th className="py-2 px-2.5 border-r border-slate-200">Date & Durée</th>
                    <th className="py-2 px-2.5 border-r border-slate-200">Objet de la subvention</th>
                    <th className="py-2 px-2.5 text-right border-r border-slate-200">Montant total</th>
                    <th className="py-2 px-2.5 text-right border-r border-slate-200">Montant transféré (N)</th>
                    <th className="py-2 px-2.5 text-right">Montant restant à transférer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {subventions.map((s) => (
                    <tr key={s.id}>
                      <td className="py-2 px-2.5 border-r border-slate-200 font-medium">{s.bailleur}</td>
                      <td className="py-2 px-2.5 border-r border-slate-200 font-mono">{s.conventionNumber}</td>
                      <td className="py-2 px-2.5 border-r border-slate-200">{s.conventionDate} ({s.conventionDuration})</td>
                      <td className="py-2 px-2.5 border-r border-slate-200">{s.projectTitle}</td>
                      <td className="py-2 px-2.5 text-right font-mono border-r border-slate-200">{s.amountGranted.toFixed(2)} DH</td>
                      <td className="py-2 px-2.5 text-right font-mono text-emerald-800 font-semibold border-r border-slate-200">{s.amountReceived.toFixed(2)} DH</td>
                      <td className="py-2 px-2.5 text-right font-mono text-blue-800">{(s.amountGranted - s.amountReceived).toFixed(2)} DH</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tableau 2: Utilisations réalisées */}
          <div>
            <h4 className="font-bold text-xs text-slate-800 mb-2">
              2. Tableau relatif aux utilisations réalisées des subventions au titre de l'exercice
            </h4>
            <div className="overflow-x-auto border border-slate-200 rounded">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-800 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-2.5 border-r border-slate-200">Projet / Activité</th>
                    <th className="py-2 px-2.5 border-r border-slate-200">Convention</th>
                    <th className="py-2 px-2.5 border-r border-slate-200">Montant Subvention</th>
                    <th className="py-2 px-2.5 border-r border-slate-200">Objet de la dépense</th>
                    <th className="py-2 px-2.5 text-right border-r border-slate-200">Montants engagés</th>
                    <th className="py-2 px-2.5 text-right border-r border-slate-200">Montants payés</th>
                    <th className="py-2 px-2.5">Réf. Pièces justificatives</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {subventions.map((s) => (
                    <tr key={s.id}>
                      <td className="py-2 px-2.5 border-r border-slate-200 font-medium">{s.projectTitle}</td>
                      <td className="py-2 px-2.5 border-r border-slate-200 font-mono">{s.conventionNumber}</td>
                      <td className="py-2 px-2.5 border-r border-slate-200 font-mono">{s.amountReceived.toFixed(2)} DH</td>
                      <td className="py-2 px-2.5 border-r border-slate-200">Actions sur le terrain et fournitures</td>
                      <td className="py-2 px-2.5 text-right font-mono border-r border-slate-200">{s.amountSpent.toFixed(2)} DH</td>
                      <td className="py-2 px-2.5 text-right font-mono text-rose-800 font-semibold border-r border-slate-200">{s.amountSpent.toFixed(2)} DH</td>
                      <td className="py-2 px-2.5 text-[11px] text-slate-500">Factures & Ordres de virement bancaire</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Fonds Dédiés (Classe 19 & 6152 / 7152) */}
      {activeTab === 'fondsDedies' && (
        <div className="bg-white rounded-lg border border-slate-300 p-6 shadow-xs space-y-4 text-xs">
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-200">
            <Info className="w-5 h-5 text-blue-700" />
            <h3 className="text-sm font-bold text-slate-900">
              Mécanisme Comptable des Fonds Dédiés (Plan Comptable CNC 2023 - Rubrique 19)
            </h3>
          </div>

          <div className="space-y-3 text-slate-700 leading-relaxed">
            <p>
              Dans les associations marocaines, une subvention affectée à un projet pluriannuel doit être neutralisée à la clôture de l'exercice pour la quote-part non encore consommée :
            </p>
            <div className="p-3 bg-slate-50 rounded border border-slate-200 font-mono space-y-2 text-[11px]">
              <div>
                <strong>1. À la clôture de l'exercice :</strong> Constatation de l'engagement envers le tiers financeur
                <div className="pl-4 text-slate-600 mt-0.5">
                  • Débit : <strong>61521</strong> Engagements à réaliser sur subventions attribuées<br />
                  • Crédit : <strong>1941</strong> Fonds dédiés sur subventions d'exploitation (Passif du Bilan)
                </div>
              </div>
              <div>
                <strong>2. Au cours de l'exercice suivant :</strong> Reprise au rythme des dépenses réelles
                <div className="pl-4 text-slate-600 mt-0.5">
                  • Débit : <strong>1941</strong> Fonds dédiés sur subventions d'exploitation<br />
                  • Crédit : <strong>71521</strong> Utilisations de l'exercice de fonds dédiés (Compte de Produits)
                </div>
              </div>
            </div>
            <p className="text-slate-600">
              Ce mécanisme garantit le respect rigoureux de la convention conclue avec les bailleurs (INDH, ministères ou coopérations internationales) et empêche d'afficher artificiellement un excédent distribuable.
            </p>
          </div>
        </div>
      )}

      {/* Modal Add Subvention */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full border border-slate-300 overflow-hidden text-xs">
            <div className="px-5 py-3 bg-slate-900 text-white font-bold flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-400" />
                Enregistrer une Convention de Subvention
              </span>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Organisme Bailleur *</label>
                <input
                  type="text"
                  required
                  value={bailleur}
                  onChange={(e) => setBailleur(e.target.value)}
                  placeholder="Ex: INDH Préfecture de Casablanca ou Conseil Régional"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded font-medium focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Type de bailleur *</label>
                  <select
                    value={typeBailleur}
                    onChange={(e) => setTypeBailleur(e.target.value as any)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded bg-white"
                  >
                    <option value="collectivite">Collectivité territoriale (Région, Commune, INDH)</option>
                    <option value="etat">Ministère / Organisme d'État</option>
                    <option value="organisme_public">Établissement public</option>
                    <option value="prive">Entreprise / Mécénat privé</option>
                    <option value="international">Coopération internationale / ONG</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">N° Convention de partenariat</label>
                  <input
                    type="text"
                    value={conventionNumber}
                    onChange={(e) => setConventionNumber(e.target.value)}
                    placeholder="Ex: INDH-2026/084"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Intitulé du Projet ou de l'Action Financée *</label>
                <input
                  type="text"
                  required
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  placeholder="Ex: Caravane Médicale et Dépistage Scolaire"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Montant Total Accordé (DH) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    value={amountGranted}
                    onChange={(e) => setAmountGranted(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 font-mono font-bold text-slate-900 border border-slate-300 rounded"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Montant Encaissé (Tranches reçues) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={amountReceived}
                    onChange={(e) => setAmountReceived(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 font-mono font-bold text-emerald-800 border border-slate-300 rounded"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date de signature</label>
                  <input
                    type="date"
                    value={conventionDate}
                    onChange={(e) => setConventionDate(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Durée de la convention</label>
                  <input
                    type="text"
                    value={conventionDuration}
                    onChange={(e) => setConventionDuration(e.target.value)}
                    placeholder="Ex: 12 mois renouvelable"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded"
                  />
                </div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded flex items-center gap-2">
                <input
                  type="checkbox"
                  id="dedicatedCheck"
                  checked={isDedicatedFunds}
                  onChange={(e) => setIsDedicatedFunds(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="dedicatedCheck" className="font-semibold text-blue-950 cursor-pointer">
                  Assujettir au régime des Fonds Dédiés (Classe 19 - Subvention affectée à un projet)
                </label>
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
                  Enregistrer la convention
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
