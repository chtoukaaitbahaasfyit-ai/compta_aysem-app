/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Gestion des Projets Associatifs & Rapports Financiers Individuels (État S5)
 */

import React, { useState } from 'react';
import {
  Target,
  Plus,
  Printer,
  Calendar,
  User,
  Building,
  CheckCircle2,
  Clock,
  ArrowRight,
  BarChart2,
  Download
} from 'lucide-react';
import { Project, AccountingEntry } from '../types/accounting';
import { AccountingEngine } from '../services/accountingEngine';

interface ProjectsManagerProps {
  projects: Project[];
  entries: AccountingEntry[];
  fiscalYear: string;
  onAddProject: (project: Project) => void;
}

export const ProjectsManager: React.FC<ProjectsManagerProps> = ({
  projects,
  entries,
  fiscalYear,
  onAddProject
}) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // New project form
  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [responsible, setResponsible] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [budgetPlanned, setBudgetPlanned] = useState<number>(50000);
  const [revenueAllocated, setRevenueAllocated] = useState<number>(50000);
  const [partner, setPartner] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || budgetPlanned <= 0) {
      alert('Veuillez renseigner un titre et un budget valide.');
      return;
    }

    const newPrj: Project = {
      id: `prj-${Date.now()}`,
      code: code.trim().toUpperCase() || `PRJ-${Math.floor(100 + Math.random() * 900)}`,
      title: title.trim(),
      description: description.trim(),
      responsible: responsible.trim() || 'Coordonnateur Projet',
      startDate,
      endDate: endDate || undefined,
      status: 'en_cours',
      budgetPlanned,
      budgetSpent: 0,
      revenueAllocated,
      partner: partner.trim() || undefined
    };

    onAddProject(newPrj);
    setShowModal(false);
    setCode('');
    setTitle('');
    setDescription('');
    setResponsible('');
  };

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  // Project-linked entries
  const projectEntries = selectedProject
    ? entries.filter(e => e.status !== 'extourne' && e.lines.some(l => l.projectId === selectedProject.id))
    : [];

  const actualSpent = selectedProject
    ? projectEntries.reduce((sum, e) => {
        const line = e.lines.find(l => l.projectId === selectedProject.id && l.accountNumber.startsWith('6'));
        return sum + (line?.debit || 0);
      }, 0)
    : 0;

  const actualRevenue = selectedProject
    ? projectEntries.reduce((sum, e) => {
        const line = e.lines.find(l => l.projectId === selectedProject.id && l.accountNumber.startsWith('7'));
        return sum + (line?.credit || 0);
      }, 0)
    : 0;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Title & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4 no-print">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-700" />
            Gestion des Projets & Actions Associatives
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Suivi budgétaire, comptabilité analytique de projet et rapports financiers par action
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded bg-emerald-700 hover:bg-emerald-600 text-white shadow-sm transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Créer un Projet</span>
        </button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 no-print">
        {projects.map((p) => {
          const rate = p.budgetPlanned > 0 ? (p.budgetSpent / p.budgetPlanned) * 100 : 0;
          return (
            <div
              key={p.id}
              onClick={() => setSelectedProjectId(p.id)}
              className={`bg-white rounded-lg border p-5 shadow-xs transition-all cursor-pointer flex flex-col justify-between ${
                selectedProjectId === p.id
                  ? 'border-blue-600 ring-2 ring-blue-100'
                  : 'border-slate-300 hover:border-slate-400'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {p.code}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-blue-50 text-blue-700 border border-blue-200">
                    {p.status.replace('_', ' ')}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{p.title}</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{p.description}</p>

                <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 rounded bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase block">Budget Prévu</span>
                    <span className="font-mono-acc font-bold text-slate-800">
                      {AccountingEngine.formatMAD(p.budgetPlanned)}
                    </span>
                  </div>
                  <div className="p-2.5 rounded bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase block">Dépenses Réalisées</span>
                    <span className="font-mono-acc font-bold text-rose-700">
                      {AccountingEngine.formatMAD(p.budgetSpent)}
                    </span>
                  </div>
                </div>

                {/* Consumption progress */}
                <div className="mt-4">
                  <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                    <span>Taux d'exécution budgétaire</span>
                    <span className="font-semibold">{rate.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        rate > 90 ? 'bg-amber-500' : 'bg-emerald-600'
                      }`}
                      style={{ width: `${Math.min(100, rate)}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3 text-slate-400" /> {p.responsible}
                </span>
                <span className="text-blue-600 font-semibold flex items-center gap-1">
                  Consulter rapport financier <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Project Financial Report (État S5 CNC - Charges & Produits par Projet) */}
      {selectedProject && (
        <div className="bg-white rounded-lg border border-slate-300 p-6 shadow-xs space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <span className="text-xs font-mono font-bold text-blue-700 uppercase">
                {selectedProject.code} • RAPPORT FINANCIER D'ACTIVITÉ
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-0.5">
                {selectedProject.title}
              </h3>
              <p className="text-xs text-slate-500">
                Responsable : {selectedProject.responsible} • Partenaire : {selectedProject.partner || 'Association AMSD'}
              </p>
            </div>

            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 shadow-2xs no-print cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Imprimer Fiche Financière (État S5)</span>
            </button>
          </div>

          {/* Project Summary Numbers */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded border border-slate-200">
              <span className="text-slate-400 uppercase text-[10px] font-semibold block">Budget Total Accordé</span>
              <span className="font-mono-acc text-sm font-bold text-slate-900">
                {AccountingEngine.formatMAD(selectedProject.budgetPlanned)}
              </span>
            </div>
            <div className="p-3 bg-emerald-50 rounded border border-emerald-200">
              <span className="text-emerald-700 uppercase text-[10px] font-semibold block">Recettes Débloquées (71)</span>
              <span className="font-mono-acc text-sm font-bold text-emerald-800">
                {AccountingEngine.formatMAD(actualRevenue || selectedProject.revenueAllocated)}
              </span>
            </div>
            <div className="p-3 bg-rose-50 rounded border border-rose-200">
              <span className="text-rose-700 uppercase text-[10px] font-semibold block">Dépenses Imputées (61)</span>
              <span className="font-mono-acc text-sm font-bold text-rose-800">
                {AccountingEngine.formatMAD(actualSpent || selectedProject.budgetSpent)}
              </span>
            </div>
            <div className="p-3 bg-blue-50 rounded border border-blue-200">
              <span className="text-blue-700 uppercase text-[10px] font-semibold block">Solde / Reliquat</span>
              <span className="font-mono-acc text-sm font-bold text-blue-900">
                {AccountingEngine.formatMAD((selectedProject.budgetPlanned) - (actualSpent || selectedProject.budgetSpent))}
              </span>
            </div>
          </div>

          {/* Table of operations linked to this project */}
          <div>
            <h4 className="font-bold text-xs text-slate-800 mb-2">
              Écritures & Pièces Comptables rattachées à ce projet ({projectEntries.length})
            </h4>
            <div className="overflow-x-auto border border-slate-200 rounded">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-2 w-24">Date</th>
                    <th className="p-2 w-28">N° Pièce</th>
                    <th className="p-2">Libellé de l'opération</th>
                    <th className="p-2 w-28 text-right">Recette (DH)</th>
                    <th className="p-2 w-28 text-right">Dépense (DH)</th>
                    <th className="p-2 w-32">Bénéficiaire / Tiers</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-normal">
                  {projectEntries.map((e) => {
                    const line = e.lines.find(l => l.projectId === selectedProject.id);
                    const isCredit = (line?.credit || 0) > 0;
                    return (
                      <tr key={e.id} className="hover:bg-slate-50">
                        <td className="p-2 font-mono text-slate-600">{e.date}</td>
                        <td className="p-2 font-mono font-semibold text-blue-700">{e.pieceNumber}</td>
                        <td className="p-2 font-medium text-slate-900">{e.label}</td>
                        <td className="p-2 text-right font-mono-acc text-emerald-700 font-semibold">
                          {isCredit ? AccountingEngine.formatMAD(line?.credit || 0) : '-'}
                        </td>
                        <td className="p-2 text-right font-mono-acc text-rose-700 font-semibold">
                          {!isCredit ? AccountingEngine.formatMAD(line?.debit || 0) : '-'}
                        </td>
                        <td className="p-2 text-slate-600">{line?.thirdParty || '-'}</td>
                      </tr>
                    );
                  })}

                  {projectEntries.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-slate-400">
                        Aucune écriture comptable directement affectée au code analytique de ce projet pour le moment.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal Add Project */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full border border-slate-300 overflow-hidden text-xs">
            <div className="px-5 py-3 bg-slate-900 text-white font-bold flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-400" />
                Créer un Nouveau Projet Associatif
              </span>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Code Analytique *</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Ex: PRJ-ENV"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono font-bold uppercase focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Intitulé du Projet *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Reboisement et Protection de l'Environnement"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded font-medium focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description & Objectifs</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="Objectifs opérationnels, public cible, zone géographique..."
                  className="w-full px-3 py-1.5 border border-slate-300 rounded"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Coordonnateur / Responsable</label>
                  <input
                    type="text"
                    value={responsible}
                    onChange={(e) => setResponsible(e.target.value)}
                    placeholder="Ex: M. Youssef TAZI"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Partenaire / Bailleur</label>
                  <input
                    type="text"
                    value={partner}
                    onChange={(e) => setPartner(e.target.value)}
                    placeholder="Ex: Ministère de l'Énergie & INDH"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Budget Prévisionnel (DH) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    value={budgetPlanned}
                    onChange={(e) => setBudgetPlanned(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 font-mono font-bold text-slate-900 border border-slate-300 rounded"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Recettes Dédiées (DH)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={revenueAllocated}
                    onChange={(e) => setRevenueAllocated(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 font-mono font-bold text-emerald-800 border border-slate-300 rounded"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date de démarrage</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date de fin prévisionnelle</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono"
                  />
                </div>
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
                  className="px-4 py-1.5 rounded bg-emerald-700 hover:bg-emerald-600 text-white font-bold shadow-xs cursor-pointer"
                >
                  Enregistrer le Projet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
