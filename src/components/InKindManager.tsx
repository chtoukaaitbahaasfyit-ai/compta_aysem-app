/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Contributions Volontaires en Nature & Bénévolat (Classe 0 / ETIC S2 & S3)
 */

import React, { useState } from 'react';
import {
  HeartHandshake,
  Plus,
  Printer,
  Download,
  Info,
  Clock,
  Gift,
  Building,
  CheckCircle2
} from 'lucide-react';
import { VolunteerWork, InKindContribution, AccountingEntry } from '../types/accounting';
import { AccountingEngine } from '../services/accountingEngine';

interface InKindManagerProps {
  volunteers: VolunteerWork[];
  inKindContributions: InKindContribution[];
  fiscalYear: string;
  onUpdateVolunteers: (vols: VolunteerWork[]) => void;
  onUpdateInKind: (ink: InKindContribution[]) => void;
  onAddClass0Entry: (entry: AccountingEntry) => void;
}

export const InKindManager: React.FC<InKindManagerProps> = ({
  volunteers,
  inKindContributions,
  fiscalYear,
  onUpdateVolunteers,
  onUpdateInKind,
  onAddClass0Entry
}) => {
  const [activeTab, setActiveTab] = useState<'benevolat' | 'nature'>('benevolat');
  const [showVolModal, setShowVolModal] = useState(false);
  const [showInkModal, setShowInkModal] = useState(false);

  // New Volunteer Form
  const [volName, setVolName] = useState('');
  const [volType, setVolType] = useState<VolunteerWork['type']>('regulier');
  const [volTask, setVolTask] = useState('');
  const [volHours, setVolHours] = useState<number>(20);
  const [volRate, setVolRate] = useState<number>(250);

  // New In-Kind Form
  const [inkNature, setInkNature] = useState<InKindContribution['nature']>('biens');
  const [inkDesc, setInkDesc] = useState('');
  const [inkValue, setInkValue] = useState<number>(5000);
  const [inkProvider, setInkProvider] = useState('');
  const [inkMethod, setInkMethod] = useState('Prix de marché de référence');

  const totalVolHours = volunteers.reduce((s, v) => s + v.hoursWorked, 0);
  const totalVolValue = volunteers.reduce((s, v) => s + v.totalValueEstimated, 0);
  const totalInkValue = inKindContributions.reduce((s, i) => s + i.estimatedValue, 0);
  const totalClass0 = totalVolValue + totalInkValue;

  const handleAddVolunteer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!volName.trim() || volHours <= 0) return;

    const totalVal = volHours * volRate;
    const newVol: VolunteerWork = {
      id: `vol-${Date.now()}`,
      volunteerName: volName.trim(),
      type: volType,
      taskDescription: volTask.trim() || 'Prestation bénévole',
      hoursWorked: volHours,
      hourlyRateEstimated: volRate,
      totalValueEstimated: totalVal,
      date: new Date().toISOString().split('T')[0]
    };

    onUpdateVolunteers([...volunteers, newVol]);
    setShowVolModal(false);
    setVolName('');
    setVolTask('');
  };

  const handleAddInKind = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inkDesc.trim() || inkValue <= 0) return;

    const newInk: InKindContribution = {
      id: `ink-${Date.now()}`,
      nature: inkNature,
      description: inkDesc.trim(),
      estimatedValue: inkValue,
      providerName: inkProvider.trim() || 'Donateur anonyme',
      date: new Date().toISOString().split('T')[0],
      valuationMethod: inkMethod
    };

    onUpdateInKind([...inKindContributions, newInk]);
    setShowInkModal(false);
    setInkDesc('');
    setInkProvider('');
  };

  const generateClass0AccountingEntry = () => {
    if (totalClass0 <= 0) {
      alert('Aucune contribution valorisée à comptabiliser.');
      return;
    }

    const pieceNum = `OD-CL0-${fiscalYear}-${Math.floor(100 + Math.random() * 900)}`;
    const dateStr = new Date().toISOString().split('T')[0];

    const lines = [
      {
        id: `l-c0-1-${Date.now()}`,
        lineNumber: 1,
        accountNumber: '044',
        accountLabel: 'Personnel bénévole',
        label: `Valorisation ${totalVolHours}h de bénévolat`,
        debit: totalVolValue,
        credit: 0
      },
      {
        id: `l-c0-2-${Date.now()}`,
        lineNumber: 2,
        accountNumber: '041',
        accountLabel: 'Secours en nature & Mises à disposition',
        label: 'Valorisation des dons matériels et locaux',
        debit: totalInkValue,
        credit: 0
      },
      {
        id: `l-c0-3-${Date.now()}`,
        lineNumber: 3,
        accountNumber: '054',
        accountLabel: 'Contributions volontaires - Bénévolat',
        label: 'Contrepartie bénévolat',
        debit: 0,
        credit: totalVolValue
      },
      {
        id: `l-c0-4-${Date.now()}`,
        lineNumber: 4,
        accountNumber: '051',
        accountLabel: 'Contributions volontaires - Dons en nature',
        label: 'Contrepartie dons en nature',
        debit: 0,
        credit: totalInkValue
      }
    ];

    const entry: AccountingEntry = {
      id: `ent-cl0-${Date.now()}`,
      pieceNumber: pieceNum,
      journalCode: 'OD',
      date: dateStr,
      period: dateStr.substring(0, 7),
      fiscalYear,
      label: 'Comptabilisation des Contributions Volontaires en Nature (Classe 0)',
      lines,
      totalDebit: totalClass0,
      totalCredit: totalClass0,
      isBalanced: true,
      status: 'valide',
      sourceModule: 'general',
      createdAt: new Date().toISOString(),
      createdBy: 'Trésorier en fonction'
    };

    onAddClass0Entry(entry);
    alert(`Écriture en Classe 0 validée avec succès (Pièce : ${pieceNum}) pour un total de ${totalClass0.toFixed(2)} DH. Conformément au CNC, les comptes de classe 0 n'affectent pas la trésorerie.`);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Title & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4 no-print">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-purple-700" />
            Contributions Volontaires en Nature & Bénévolat (Classe 0)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Valorisation obligatoire du travail bénévole et des dons en nature (États S2 & S3 de l'ETIC CNC)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-xs cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Imprimer États S2 / S3</span>
          </button>
          <button
            onClick={generateClass0AccountingEntry}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded bg-purple-700 hover:bg-purple-600 text-white shadow-sm cursor-pointer"
            title="Générer l'écriture comptable en partie double de Classe 0"
          >
            <span>Comptabiliser en Classe 0</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 no-print">
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Temps Bénévole Valorisé</span>
          <div className="text-xl font-bold font-mono-acc text-purple-900 mt-1">
            {AccountingEngine.formatMAD(totalVolValue)}
          </div>
          <span className="text-[11px] text-slate-500">{totalVolHours} heures d'engagement bénévole</span>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Dons & Mises à Disposition</span>
          <div className="text-xl font-bold font-mono-acc text-indigo-900 mt-1">
            {AccountingEngine.formatMAD(totalInkValue)}
          </div>
          <span className="text-[11px] text-slate-500">{inKindContributions.length} apports matériels valorisés</span>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Total Valorisation Classe 0</span>
          <div className="text-xl font-bold font-mono-acc text-blue-900 mt-1">
            {AccountingEngine.formatMAD(totalClass0)}
          </div>
          <span className="text-[11px] text-blue-600 font-medium">Mentionné dans l'ETIC (État S3)</span>
        </div>
      </div>

      {/* Moroccan Accounting Doctrine on Class 0 */}
      <div className="p-3 bg-purple-50 border border-purple-200 rounded-md text-xs text-purple-900 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
        <div>
          <strong className="font-semibold text-purple-950">Principe CNC des comptes de la Classe 0 (Section 3.8) :</strong> Les contributions volontaires en nature (bénévolat, prêts gratuits de locaux ou matériel, dons de vivres) n'entraînent aucun flux monétaire. Elles sont enregistrées au débit des comptes <strong>04</strong> (Emplois) et au crédit des comptes <strong>05</strong> (Contributions). Ces écritures reflètent l'économie réelle apportée à la société par l'action bénévole sans impacter la trésorerie.
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs w-fit no-print">
        <button
          onClick={() => setActiveTab('benevolat')}
          className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
            activeTab === 'benevolat' ? 'bg-purple-700 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          État S2 : Effectifs Bénévoles ({volunteers.length})
        </button>
        <button
          onClick={() => setActiveTab('nature')}
          className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
            activeTab === 'nature' ? 'bg-purple-700 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          État S3 : Dons en Nature & Mises à Disposition ({inKindContributions.length})
        </button>
      </div>

      {/* Tab 1: État S2 - Effectifs Bénévoles */}
      {activeTab === 'benevolat' && (
        <div className="bg-white rounded-lg border border-slate-300 shadow-xs overflow-hidden">
          <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs no-print">
            <span className="font-bold text-slate-800 uppercase">ÉTAT S2 : ÉTAT DES EFFECTIFS BÉNÉVOLES (CNC 2023)</span>
            <button
              onClick={() => setShowVolModal(true)}
              className="flex items-center gap-1 px-3 py-1 bg-purple-700 hover:bg-purple-600 text-white rounded font-semibold cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Ajouter une Action Bénévole</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-900 text-white font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Nom du Bénévole</th>
                  <th className="py-2.5 px-3 w-32">Type de Bénévolat</th>
                  <th className="py-2.5 px-4">Description de la nature des tâches</th>
                  <th className="py-2.5 px-3 text-right w-24">Heures</th>
                  <th className="py-2.5 px-3 text-right w-28">Taux Estimé</th>
                  <th className="py-2.5 px-3 text-right w-32">Valeur Estimée (DH)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {volunteers.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50">
                    <td className="py-2 px-3 font-bold text-slate-900">{v.volunteerName}</td>
                    <td className="py-2 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        v.type === 'regulier' ? 'bg-purple-50 text-purple-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {v.type === 'regulier' ? 'Régulier' : 'Occasionnel'}
                      </span>
                    </td>
                    <td className="py-2 px-4 text-slate-700 font-medium">{v.taskDescription}</td>
                    <td className="py-2 px-3 text-right font-mono font-semibold text-slate-900">{v.hoursWorked} h</td>
                    <td className="py-2 px-3 text-right font-mono text-slate-600">{v.hourlyRateEstimated} DH/h</td>
                    <td className="py-2 px-3 text-right font-mono-acc font-bold text-purple-900">
                      {AccountingEngine.formatMAD(v.totalValueEstimated)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50 font-bold border-t-2 border-slate-300 text-slate-900">
                  <td colSpan={3} className="py-2 px-3 text-right uppercase text-[11px]">Totaux généraux bénévolat :</td>
                  <td className="py-2 px-3 text-right font-mono">{totalVolHours} h</td>
                  <td></td>
                  <td className="py-2 px-3 text-right font-mono text-purple-900">{totalVolValue.toFixed(2)} DH</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: État S3 - Tableau d'Évaluation des Contributions Volontaires en Nature */}
      {activeTab === 'nature' && (
        <div className="bg-white rounded-lg border border-slate-300 shadow-xs overflow-hidden">
          <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs no-print">
            <span className="font-bold text-slate-800 uppercase">ÉTAT S3 : TABLEAU D'ÉVALUATION DES CONTRIBUTIONS EN NATURE</span>
            <button
              onClick={() => setShowInkModal(true)}
              className="flex items-center gap-1 px-3 py-1 bg-indigo-700 hover:bg-indigo-600 text-white rounded font-semibold cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Ajouter une Contribution en Nature</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-900 text-white font-semibold">
                <tr>
                  <th className="py-2.5 px-3 w-28">Nature</th>
                  <th className="py-2.5 px-4">Désignation des Biens / Prestations</th>
                  <th className="py-2.5 px-3">Origine / Fournisseur</th>
                  <th className="py-2.5 px-3">Méthode de Valorisation</th>
                  <th className="py-2.5 px-3 text-right w-32">Valeur Estimée (DH)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {inKindContributions.map((i) => (
                  <tr key={i.id} className="hover:bg-slate-50">
                    <td className="py-2 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-indigo-50 text-indigo-800 border border-indigo-200">
                        {i.nature}
                      </span>
                    </td>
                    <td className="py-2 px-4 font-bold text-slate-900">{i.description}</td>
                    <td className="py-2 px-3 text-slate-600">{i.providerName}</td>
                    <td className="py-2 px-3 text-slate-500 text-[11px]">{i.valuationMethod}</td>
                    <td className="py-2 px-3 text-right font-mono-acc font-bold text-indigo-900">
                      {AccountingEngine.formatMAD(i.estimatedValue)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50 font-bold border-t-2 border-slate-300 text-slate-900">
                  <td colSpan={4} className="py-2 px-3 text-right uppercase text-[11px]">Total des dons matériels valorisés :</td>
                  <td className="py-2 px-3 text-right font-mono text-indigo-900">{totalInkValue.toFixed(2)} DH</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Modal Add Volunteer */}
      {showVolModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full border border-slate-300 overflow-hidden text-xs">
            <div className="px-5 py-3 bg-slate-900 text-white font-bold flex items-center justify-between">
              <span>Ajouter un Bénévole / Prestation</span>
              <button onClick={() => setShowVolModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleAddVolunteer} className="p-5 space-y-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nom du bénévole *</label>
                <input
                  type="text"
                  required
                  value={volName}
                  onChange={(e) => setVolName(e.target.value)}
                  placeholder="Ex: Dr. Ahmed SLAOUI"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Type de bénévolat</label>
                <select
                  value={volType}
                  onChange={(e) => setVolType(e.target.value as any)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded bg-white"
                >
                  <option value="regulier">Régulier (Intervention continue)</option>
                  <option value="occasionnel">Occasionnel (Événementiel, action spécifique)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nature des tâches exécutées</label>
                <input
                  type="text"
                  value={volTask}
                  onChange={(e) => setVolTask(e.target.value)}
                  placeholder="Ex: Consultations pédiatriques gratuites"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Heures effectuées *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={volHours}
                    onChange={(e) => setVolHours(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Taux horaire estimé (DH/h)</label>
                  <input
                    type="number"
                    min="10"
                    value={volRate}
                    onChange={(e) => setVolRate(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono font-bold"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowVolModal(false)}
                  className="px-4 py-1.5 rounded border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-purple-700 hover:bg-purple-600 text-white font-bold cursor-pointer"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Add In-Kind */}
      {showInkModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full border border-slate-300 overflow-hidden text-xs">
            <div className="px-5 py-3 bg-slate-900 text-white font-bold flex items-center justify-between">
              <span>Ajouter un Don en Nature / Service</span>
              <button onClick={() => setShowInkModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleAddInKind} className="p-5 space-y-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nature de la contribution *</label>
                <select
                  value={inkNature}
                  onChange={(e) => setInkNature(e.target.value as any)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded bg-white"
                >
                  <option value="biens">Dons en biens consommables (vivres, vêtements)</option>
                  <option value="locaux">Mise à disposition gratuite de locaux</option>
                  <option value="services">Prestation de services bénévole</option>
                  <option value="autre">Autre contribution</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description du bien / prestation *</label>
                <input
                  type="text"
                  required
                  value={inkDesc}
                  onChange={(e) => setInkDesc(e.target.value)}
                  placeholder="Ex: Don de 200 cartables scolaires équipés"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Valeur estimée (DH) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    value={inkValue}
                    onChange={(e) => setInkValue(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Donateur / Fournisseur</label>
                  <input
                    type="text"
                    value={inkProvider}
                    onChange={(e) => setInkProvider(e.target.value)}
                    placeholder="Ex: Entreprise X ou Particulier"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Méthode de quantification retenue</label>
                <input
                  type="text"
                  value={inkMethod}
                  onChange={(e) => setInkMethod(e.target.value)}
                  placeholder="Ex: Prix unitaire moyen du marché de gros"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowInkModal(false)}
                  className="px-4 py-1.5 rounded border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-indigo-700 hover:bg-indigo-600 text-white font-bold cursor-pointer"
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
