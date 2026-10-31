/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Tableau de bord financier inspiré de SAGE 100 pour ASSOCIATION COMPTA PRO
 */

import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Landmark,
  Coins,
  Award,
  Target,
  Users,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  FileSpreadsheet,
  PlusCircle,
  FileCheck2,
  Clock
} from 'lucide-react';
import {
  AccountingEntry,
  BankAccount,
  Project,
  Subvention,
  Member,
  AssociationProfile
} from '../types/accounting';
import { AccountingEngine } from '../services/accountingEngine';

interface DashboardProps {
  profile: AssociationProfile;
  entries: AccountingEntry[];
  bankAccounts: BankAccount[];
  projects: Project[];
  subventions: Subvention[];
  members: Member[];
  onNavigate: (tab: string) => void;
  onNewEntry: () => void;
  isArabic?: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({
  profile,
  entries,
  bankAccounts,
  projects,
  subventions,
  members,
  onNavigate,
  onNewEntry,
  isArabic = false
}) => {
  const cpc = AccountingEngine.calculateCPC(entries);
  const totalBank = bankAccounts
    .filter(b => b.type === 'banque')
    .reduce((sum, b) => sum + b.currentBalance, 0);
  const totalCash = bankAccounts
    .filter(b => b.type === 'caisse')
    .reduce((sum, b) => sum + b.currentBalance, 0);
  const totalTreasury = totalBank + totalCash;

  const totalSubventionsGranted = subventions.reduce((s, sub) => s + sub.amountGranted, 0);
  const totalSubventionsReceived = subventions.reduce((s, sub) => s + sub.amountReceived, 0);
  const totalSubventionsSpent = subventions.reduce((s, sub) => s + sub.amountSpent, 0);
  const remainingSubventions = totalSubventionsReceived - totalSubventionsSpent;

  const upToDateMembers = members.filter(m => m.status === 'a_jour').length;
  const lateMembers = members.filter(m => m.status === 'en_retard').length;

  const activeProjects = projects.filter(p => p.status === 'en_cours');
  const totalProjectBudget = projects.reduce((s, p) => s + p.budgetPlanned, 0);
  const totalProjectSpent = projects.reduce((s, p) => s + p.budgetSpent, 0);
  const projectExecutionRate = totalProjectBudget > 0 ? (totalProjectSpent / totalProjectBudget) * 100 : 0;

  // Recent entries
  const recentEntries = [...entries]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Title & Quick actions bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            {isArabic ? 'لوحة القيادة المالية والمحاسبية' : 'Tableau de Bord Financier & Comptable'}
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-semibold border border-blue-200">
              {isArabic ? `السنة المالية ${profile.activeFiscalYear}` : `Exercice ${profile.activeFiscalYear}`}
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {isArabic
              ? 'مؤشرات موحدة متوافقة مع المخطط المحاسبي للجمعيات بالمغرب (CNC 2023)'
              : 'Indicateurs consolidés conformes au Plan Comptable des Associations du Maroc (CNC 2023)'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onNewEntry}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded bg-blue-700 hover:bg-blue-600 text-white shadow-sm transition-colors cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{isArabic ? 'قيد جديد (F3)' : 'Nouvelle Écriture (F3)'}</span>
          </button>
          <button
            onClick={() => onNavigate('recettes')}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded bg-emerald-700 hover:bg-emerald-600 text-white shadow-sm transition-colors cursor-pointer"
          >
            <TrendingUp className="w-4 h-4" />
            <span>{isArabic ? 'تحصيل مداخيل' : 'Encaisser Recette'}</span>
          </button>
          <button
            onClick={() => onNavigate('depenses')}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded bg-slate-800 hover:bg-slate-700 text-white shadow-sm transition-colors cursor-pointer"
          >
            <TrendingDown className="w-4 h-4" />
            <span>{isArabic ? 'تسجيل مصاريف' : 'Enregistrer Dépense'}</span>
          </button>
        </div>
      </div>

      {/* Main KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Recettes */}
        <div
          onClick={() => onNavigate('recettes')}
          className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs hover:border-emerald-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              {isArabic ? 'إجمالي المداخيل' : 'Total Recettes'}
            </span>
            <div className="p-2 rounded-md bg-emerald-50 text-emerald-600 group-hover:scale-105 transition-transform">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xl font-bold font-mono-acc text-slate-900">
              {AccountingEngine.formatMAD(cpc.totalProduits)}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
            <span>{isArabic ? 'المنح:' : 'Subventions:'} {AccountingEngine.formatMAD(cpc.produitsExploitation.subventionsExploitation)}</span>
            <span className="text-emerald-600 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center">
              {isArabic ? 'التفاصيل' : 'Détails'} <ArrowRight className="w-3 h-3 ml-0.5 rtl:rotate-180" />
            </span>
          </div>
        </div>

        {/* Total Dépenses */}
        <div
          onClick={() => onNavigate('depenses')}
          className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs hover:border-rose-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              {isArabic ? 'إجمالي المصاريف' : 'Total Dépenses'}
            </span>
            <div className="p-2 rounded-md bg-rose-50 text-rose-600 group-hover:scale-105 transition-transform">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xl font-bold font-mono-acc text-slate-900">
              {AccountingEngine.formatMAD(cpc.totalCharges)}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
            <span>{isArabic ? 'المشاريع:' : 'Actions & Projets:'} {AccountingEngine.formatMAD(cpc.chargesExploitation.achatsFournitures)}</span>
            <span className="text-rose-600 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center">
              {isArabic ? 'التفاصيل' : 'Détails'} <ArrowRight className="w-3 h-3 ml-0.5 rtl:rotate-180" />
            </span>
          </div>
        </div>

        {/* Excédent ou Insuffisance (Terminologie CNC Associations) */}
        <div
          onClick={() => onNavigate('reports')}
          className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs hover:border-blue-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              {isArabic
                ? (cpc.isExcedent ? 'الفائض الصافي (النتيجة)' : 'العجز الصافي')
                : (cpc.isExcedent ? 'Excédent Net (Résultat)' : 'Insuffisance Nette')}
            </span>
            <div className={`p-2 rounded-md ${cpc.isExcedent ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'}`}>
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2">
            <span className={`text-xl font-bold font-mono-acc ${cpc.isExcedent ? 'text-blue-700' : 'text-amber-700'}`}>
              {AccountingEngine.formatMAD(Math.abs(cpc.resultatNet))}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
            <span className="text-[11px] italic">
              {isArabic ? 'غير قابل للتوزيع على الأعضاء (ظهير 1958)' : 'Non distribuable aux membres (Dahir 1958)'}
            </span>
            <span className="text-blue-600 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center">
              {isArabic ? 'الميزانية / الحصيلة' : 'Bilan/CPC'} <ArrowRight className="w-3 h-3 ml-0.5 rtl:rotate-180" />
            </span>
          </div>
        </div>

        {/* Trésorerie Globale */}
        <div
          onClick={() => onNavigate('treasury')}
          className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs hover:border-indigo-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              {isArabic ? 'السيولة المتاحة' : 'Trésorerie Disponible'}
            </span>
            <div className="p-2 rounded-md bg-indigo-50 text-indigo-700 group-hover:scale-105 transition-transform">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xl font-bold font-mono-acc text-indigo-950">
              {AccountingEngine.formatMAD(totalTreasury)}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
            <span>{isArabic ? 'الأبناك:' : 'Banques:'} {AccountingEngine.formatMAD(totalBank)}</span>
            <span className="text-indigo-600 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center">
              {isArabic ? 'الصندوق:' : 'Caisse:'} {AccountingEngine.formatMAD(totalCash)}
            </span>
          </div>
        </div>
      </div>

      {/* Middle row: Subventions & Projets progress + Moroccan Compliance block */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Subventions & Financements Publics (Circulaire PM 13/2022) */}
        <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-blue-700" />
              <h3 className="text-sm font-bold text-slate-900">Subventions & Financements</h3>
            </div>
            <button
              onClick={() => onNavigate('subventions')}
              className="text-xs text-blue-600 hover:underline font-semibold"
            >
              Gérer ({subventions.length})
            </button>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Montant total accordé :</span>
              <span className="font-semibold font-mono-acc text-slate-800">{AccountingEngine.formatMAD(totalSubventionsGranted)}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Fonds reçus (Encaissés) :</span>
              <span className="font-semibold font-mono-acc text-emerald-700">{AccountingEngine.formatMAD(totalSubventionsReceived)}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Montants consommés / dépensés :</span>
              <span className="font-semibold font-mono-acc text-rose-700">{AccountingEngine.formatMAD(totalSubventionsSpent)}</span>
            </div>
            <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-100">
              <span className="font-semibold text-slate-700">Reliquat disponible non dépensé :</span>
              <span className="font-bold font-mono-acc text-blue-700">{AccountingEngine.formatMAD(remainingSubventions)}</span>
            </div>

            {/* Progress bar */}
            <div className="mt-2">
              <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                <span>Taux de consommation subventions</span>
                <span className="font-semibold">{totalSubventionsReceived > 0 ? ((totalSubventionsSpent / totalSubventionsReceived) * 100).toFixed(1) : 0}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${totalSubventionsReceived > 0 ? Math.min(100, (totalSubventionsSpent / totalSubventionsReceived) * 100) : 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Projets & Actions de l'Association */}
        <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-700" />
              <h3 className="text-sm font-bold text-slate-900">Projets & Actions Sociales</h3>
            </div>
            <button
              onClick={() => onNavigate('projects')}
              className="text-xs text-blue-600 hover:underline font-semibold"
            >
              Voir tout ({projects.length})
            </button>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Projets en cours d'exécution :</span>
              <span className="font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[11px]">
                {activeProjects.length} actifs
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Budget prévisionnel global :</span>
              <span className="font-semibold font-mono-acc text-slate-800">{AccountingEngine.formatMAD(totalProjectBudget)}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Dépenses imputées :</span>
              <span className="font-semibold font-mono-acc text-slate-800">{AccountingEngine.formatMAD(totalProjectSpent)}</span>
            </div>

            <div className="mt-2">
              <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                <span>Avancement budgétaire global</span>
                <span className="font-semibold">{projectExecutionRate.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, projectExecutionRate)}%` }}
                ></div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Adhérents à jour : <strong className="text-emerald-700">{upToDateMembers}</strong></span>
              <span>En retard : <strong className="text-amber-700">{lateMembers}</strong></span>
            </div>
          </div>
        </div>

        {/* Encadré de Contrôle Interne & Conformité Marocaine */}
        <div className="bg-slate-900 text-white rounded-lg p-5 shadow-xs border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Contrôle & Conformité Marocaine</h3>
            </div>

            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold shrink-0">✓</span>
                <span><strong>Règle des 5 000 DH :</strong> Tout paiement &gt; 5 000 DH obligatoirement par chèque ou virement.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold shrink-0">✓</span>
                <span><strong>Équilibre comptable :</strong> Débit = Crédit contrôlé à chaque validation d'écriture.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold shrink-0">✓</span>
                <span><strong>Circulaire PM 13/2022 :</strong> Suivi des comptes d'emploi des subventions publiques (État S7).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold shrink-0">✓</span>
                <span><strong>Classe 0 :</strong> Valorisation séparée du bénévolat et des dons en nature (sans incidence trésorerie).</span>
              </li>
            </ul>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Dossier : <strong className="text-sky-300">{profile.sigle}</strong></span>
            <span className="text-emerald-400 flex items-center gap-1 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" /> 100% Conforme
            </span>
          </div>
        </div>
      </div>

      {/* Breakdown by resource category & Recent entries */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Répartition des Produits & Ressources */}
        <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Coins className="w-4 h-4 text-blue-700" />
            Structure des Ressources Associatives
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between text-slate-600 mb-1">
                <span>Subventions d'exploitation (7161)</span>
                <span className="font-semibold font-mono-acc">{AccountingEngine.formatMAD(cpc.produitsExploitation.subventionsExploitation)}</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full"
                  style={{ width: `${cpc.totalProduits > 0 ? (cpc.produitsExploitation.subventionsExploitation / cpc.totalProduits) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-600 mb-1">
                <span>Mécénat d'entreprises (71832)</span>
                <span className="font-semibold font-mono-acc">{AccountingEngine.formatMAD(cpc.produitsExploitation.mecenat)}</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full"
                  style={{ width: `${cpc.totalProduits > 0 ? (cpc.produitsExploitation.mecenat / cpc.totalProduits) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-600 mb-1">
                <span>Cotisations & Droits d'adhésion (717)</span>
                <span className="font-semibold font-mono-acc">{AccountingEngine.formatMAD(cpc.produitsExploitation.cotisations + cpc.produitsExploitation.droitsEntree)}</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-600 h-full rounded-full"
                  style={{ width: `${cpc.totalProduits > 0 ? ((cpc.produitsExploitation.cotisations + cpc.produitsExploitation.droitsEntree) / cpc.totalProduits) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-600 mb-1">
                <span>Dons manuels des particuliers (71831)</span>
                <span className="font-semibold font-mono-acc">{AccountingEngine.formatMAD(cpc.produitsExploitation.donsManuels)}</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full"
                  style={{ width: `${cpc.totalProduits > 0 ? (cpc.produitsExploitation.donsManuels / cpc.totalProduits) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Dernières Écritures Comptables */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-700" />
              Dernières Écritures Validées au Journal
            </h3>
            <button
              onClick={() => onNavigate('entries-list')}
              className="text-xs text-blue-600 hover:underline font-semibold"
            >
              Consulter tout le journal ({entries.length})
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 bg-slate-50">
                  <th className="py-2 px-3 font-semibold">N° Pièce</th>
                  <th className="py-2 px-3 font-semibold">Date</th>
                  <th className="py-2 px-3 font-semibold">Journal</th>
                  <th className="py-2 px-3 font-semibold">Libellé de l'opération</th>
                  <th className="py-2 px-3 font-semibold text-right">Montant (DH)</th>
                  <th className="py-2 px-3 font-semibold text-center">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-semibold text-blue-700">{entry.pieceNumber}</td>
                    <td className="py-2.5 px-3 text-slate-600">{entry.date}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                        {entry.journalCode}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-800 max-w-xs truncate">{entry.label}</td>
                    <td className="py-2.5 px-3 text-right font-mono-acc font-semibold text-slate-900">
                      {AccountingEngine.formatMAD(entry.totalDebit)}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        entry.status === 'valide'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : entry.status === 'extourne'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {entry.status === 'valide' ? 'Validé' : entry.status === 'extourne' ? 'Extourné' : 'Brouillon'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
