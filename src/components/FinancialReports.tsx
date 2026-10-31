/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * États Financiers & Rapports Officiels des Associations Marocaines (CNC Avis n°23 de 2023)
 */

import React, { useState } from 'react';
import {
  FileText,
  Printer,
  Download,
  Building2,
  Calendar,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Info
} from 'lucide-react';
import {
  AccountingEntry,
  Account,
  AssociationProfile,
  Project,
  Subvention,
  VolunteerWork,
  InKindContribution,
  BudgetItem
} from '../types/accounting';
import { AccountingEngine } from '../services/accountingEngine';

interface FinancialReportsProps {
  profile: AssociationProfile;
  entries: AccountingEntry[];
  accounts: Account[];
  projects: Project[];
  subventions: Subvention[];
  volunteers: VolunteerWork[];
  inKind: InKindContribution[];
  budgets: BudgetItem[];
}

export const FinancialReports: React.FC<FinancialReportsProps> = ({
  profile,
  entries,
  accounts,
  projects,
  subventions,
  volunteers,
  inKind,
  budgets
}) => {
  const [reportType, setReportType] = useState<'bilan' | 'cpc' | 'etic' | 'simplifie' | 'supersimplifie'>(
    profile.accountingModel === 'normal' ? 'bilan' : profile.accountingModel === 'simplifie' ? 'simplifie' : 'supersimplifie'
  );
  const [activeEticState, setActiveEticState] = useState<'S1' | 'S2' | 'S3' | 'S4' | 'S5' | 'S6' | 'S7' | 'S8'>('S1');

  const bilan = AccountingEngine.calculateBilan(entries, accounts);
  const cpc = AccountingEngine.calculateCPC(entries);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Title & Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4 no-print">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-700" />
            États Comptables & Rapports Financiers Officiels
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Conformes aux formulaires officiels du CNC (Avis n°23 de 2023) pour les associations marocaines
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Main model / report picker */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
            <button
              onClick={() => setReportType('bilan')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                reportType === 'bilan' ? 'bg-blue-700 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Bilan (BL)
            </button>
            <button
              onClick={() => setReportType('cpc')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                reportType === 'cpc' ? 'bg-blue-700 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Compte Produits & Charges (CPC)
            </button>
            <button
              onClick={() => setReportType('etic')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                reportType === 'etic' ? 'bg-blue-700 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ETIC (États S1 à S8)
            </button>
            <button
              onClick={() => setReportType('simplifie')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                reportType === 'simplifie' ? 'bg-emerald-700 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Modèle Simplifié
            </button>
            <button
              onClick={() => setReportType('supersimplifie')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                reportType === 'supersimplifie' ? 'bg-amber-700 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Super-Simplifié
            </button>
          </div>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded bg-blue-700 hover:bg-blue-600 text-white shadow-sm transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimer l'État Officiel</span>
          </button>
        </div>
      </div>

      {/* Official Association Header for Printing */}
      <div className="bg-white p-6 rounded-lg border border-slate-300 shadow-xs print:border-none print:shadow-none print:p-0">
        <div className="border-b-2 border-slate-900 pb-4 mb-6 flex flex-wrap justify-between items-start">
          <div>
            <h1 className="text-base font-bold text-slate-950 uppercase">{profile.name}</h1>
            <p className="text-xs text-slate-600">{profile.address}, {profile.city}</p>
            <p className="text-[11px] text-slate-500">
              Récépissé Dahir 1958 : {profile.receiptReceiptNumber} • IF: {profile.ifFiscal} • CNSS: {profile.cnss}
            </p>
          </div>
          <div className="text-right text-xs">
            <span className="font-bold text-slate-900 text-sm block">CONSEIL NATIONAL DE LA COMPTABILITÉ (CNC)</span>
            <span className="text-slate-600">Exercice clos le 31/12/{profile.activeFiscalYear}</span>
            <span className="block font-mono text-[11px] text-blue-900 font-semibold">Devise : Dirham marocain (MAD)</span>
          </div>
        </div>

        {/* ================= REPORT: BILAN OFFICIEL (Pages 46-47 CNC) ================= */}
        {reportType === 'bilan' && (
          <div className="space-y-6">
            <div className="text-center py-2 bg-slate-100 border border-slate-200 rounded font-bold text-slate-900 text-sm uppercase">
              BILAN COMPTABLE AU 31 DÉCEMBRE {profile.activeFiscalYear} (MODÈLE NORMAL)
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* ACTIF */}
              <div className="border border-slate-300 rounded overflow-hidden">
                <div className="bg-slate-900 text-white p-2.5 font-bold text-xs uppercase text-center">
                  BILAN (ACTIF)
                </div>
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-300">
                    <tr>
                      <th className="p-2 border-r border-slate-200">Rubrique Actif</th>
                      <th className="p-2 text-right w-28">Net (DH)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr className="bg-slate-50 font-bold text-slate-900">
                      <td colSpan={2} className="p-2 uppercase">I. ACTIF IMMOBILISÉ</td>
                    </tr>
                    <tr>
                      <td className="p-2 pl-4">Immobilisations incorporelles</td>
                      <td className="p-2 text-right font-mono">{bilan.actif.immobilise.incorporelles.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td className="p-2 pl-4">Immobilisations corporelles (siège, matériel, transport)</td>
                      <td className="p-2 text-right font-mono">{bilan.actif.immobilise.corporelles.toFixed(2)}</td>
                    </tr>
                    <tr className="bg-blue-50/40">
                      <td className="p-2 pl-4 font-semibold text-blue-950">Biens reçus par legs ou donations destinés à être cédés (2371)</td>
                      <td className="p-2 text-right font-mono font-semibold text-blue-950">{bilan.actif.immobilise.legsACeder.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td className="p-2 pl-4">Immobilisations financières (Prêts aux partenaires 2412)</td>
                      <td className="p-2 text-right font-mono">{bilan.actif.immobilise.financieres.toFixed(2)}</td>
                    </tr>
                    <tr className="text-slate-500 italic">
                      <td className="p-2 pl-4">Moins : Amortissements cumulés (28)</td>
                      <td className="p-2 text-right font-mono">-{bilan.actif.immobilise.amortissements.toFixed(2)}</td>
                    </tr>
                    <tr className="font-semibold bg-slate-100">
                      <td className="p-2 text-right">TOTAL ACTIF IMMOBILISÉ (I)</td>
                      <td className="p-2 text-right font-mono text-blue-900">{bilan.actif.immobilise.net.toFixed(2)}</td>
                    </tr>

                    <tr className="bg-slate-50 font-bold text-slate-900">
                      <td colSpan={2} className="p-2 uppercase">II. ACTIF CIRCULANT (HORS TRÉSORERIE)</td>
                    </tr>
                    <tr>
                      <td className="p-2 pl-4">Stocks de marchandises & fournitures (31)</td>
                      <td className="p-2 text-right font-mono">{bilan.actif.circulant.stocks.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td className="p-2 pl-4">Comptes des membres et adhérents - débiteurs (346)</td>
                      <td className="p-2 text-right font-mono">{bilan.actif.circulant.creancesMembres.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td className="p-2 pl-4">Usagers et comptes rattachés - débiteurs (347)</td>
                      <td className="p-2 text-right font-mono">{bilan.actif.circulant.creancesUsagers.toFixed(2)}</td>
                    </tr>
                    <tr className="bg-blue-50/40">
                      <td className="p-2 pl-4 font-semibold text-blue-950">Créances reçues par legs ou donations (3480)</td>
                      <td className="p-2 text-right font-mono font-semibold text-blue-950">{bilan.actif.circulant.creancesLegs.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td className="p-2 pl-4">Autres débiteurs & avances fournisseurs (341/348)</td>
                      <td className="p-2 text-right font-mono">{bilan.actif.circulant.autresDebiteurs.toFixed(2)}</td>
                    </tr>
                    <tr className="font-semibold bg-slate-100">
                      <td className="p-2 text-right">TOTAL ACTIF CIRCULANT (II)</td>
                      <td className="p-2 text-right font-mono text-blue-900">{bilan.actif.circulant.net.toFixed(2)}</td>
                    </tr>

                    <tr className="bg-slate-50 font-bold text-slate-900">
                      <td colSpan={2} className="p-2 uppercase">III. TRÉSORERIE - ACTIF</td>
                    </tr>
                    <tr>
                      <td className="p-2 pl-4">Banques et chèques postaux (514)</td>
                      <td className="p-2 text-right font-mono">{bilan.actif.tresorerie.banques.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td className="p-2 pl-4">Caisses & régies d'avance (516)</td>
                      <td className="p-2 text-right font-mono">{bilan.actif.tresorerie.caisses.toFixed(2)}</td>
                    </tr>
                    <tr className="font-semibold bg-slate-100">
                      <td className="p-2 text-right">TOTAL TRÉSORERIE ACTIF (III)</td>
                      <td className="p-2 text-right font-mono text-blue-900">{bilan.actif.tresorerie.net.toFixed(2)}</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-900 text-white font-bold border-t-2 border-slate-950">
                      <td className="p-2.5 uppercase text-right">TOTAL GÉNÉRAL ACTIF (I + II + III)</td>
                      <td className="p-2.5 text-right font-mono text-sky-300 text-sm">
                        {bilan.actif.totalGeneral.toFixed(2)} DH
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* PASSIF */}
              <div className="border border-slate-300 rounded overflow-hidden">
                <div className="bg-slate-900 text-white p-2.5 font-bold text-xs uppercase text-center">
                  BILAN (PASSIF)
                </div>
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-300">
                    <tr>
                      <th className="p-2 border-r border-slate-200">Rubrique Passif</th>
                      <th className="p-2 text-right w-28">Exercice N (DH)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr className="bg-slate-50 font-bold text-slate-900">
                      <td colSpan={2} className="p-2 uppercase">I. FINANCEMENT PERMANENT</td>
                    </tr>
                    <tr>
                      <td className="p-2 pl-4">Fonds propres sans droit de reprise (111)</td>
                      <td className="p-2 text-right font-mono">{bilan.passif.fondsPropres.sansDroitReprise.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td className="p-2 pl-4">Fonds propres avec droit de reprise (112)</td>
                      <td className="p-2 text-right font-mono">{bilan.passif.fondsPropres.avecDroitReprise.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td className="p-2 pl-4">Écarts de réévaluation (113) & Réserves (115)</td>
                      <td className="p-2 text-right font-mono">{(bilan.passif.fondsPropres.ecartsReevaluation + bilan.passif.fondsPropres.reserves).toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td className="p-2 pl-4">Excédent / Insuffisance nets en instance d'affectation (118)</td>
                      <td className="p-2 text-right font-mono">{bilan.passif.fondsPropres.reportsNets.toFixed(2)}</td>
                    </tr>
                    <tr className="bg-emerald-50/50">
                      <td className="p-2 pl-4 font-bold text-emerald-950">
                        {bilan.passif.fondsPropres.resultatExercice >= 0 ? 'Excédent de l\'exercice (1191)' : 'Insuffisance de l\'exercice (1199)'}
                      </td>
                      <td className="p-2 text-right font-mono font-bold text-emerald-900">
                        {bilan.passif.fondsPropres.resultatExercice.toFixed(2)}
                      </td>
                    </tr>
                    <tr className="font-semibold bg-slate-100">
                      <td className="p-2 text-right">TOTAL FONDS PROPRES</td>
                      <td className="p-2 text-right font-mono text-blue-900">{bilan.passif.fondsPropres.totalFondsPropres.toFixed(2)}</td>
                    </tr>

                    <tr>
                      <td className="p-2 pl-4">Subventions d'investissement (131)</td>
                      <td className="p-2 text-right font-mono">{bilan.passif.fondsAssimiles.subventionsInvestissement.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td className="p-2 pl-4">Emprunts auprès des partenaires (144)</td>
                      <td className="p-2 text-right font-mono">{bilan.passif.dettesFinancement.empruntsPartenaires.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td className="p-2 pl-4">Provisions pour charges sur legs ou donations (1557)</td>
                      <td className="p-2 text-right font-mono">{bilan.passif.dettesFinancement.provisionsChargesLegs.toFixed(2)}</td>
                    </tr>
                    <tr className="bg-blue-50/40">
                      <td className="p-2 pl-4 font-semibold text-blue-950">Fonds reportés liés aux legs/usufruit (Rubrique 18)</td>
                      <td className="p-2 text-right font-mono font-semibold text-blue-950">{bilan.passif.dettesFinancement.fondsReportes.toFixed(2)}</td>
                    </tr>
                    <tr className="bg-blue-50/40">
                      <td className="p-2 pl-4 font-semibold text-blue-950">Fonds dédiés sur subventions & dons affectés (Rubrique 19)</td>
                      <td className="p-2 text-right font-mono font-semibold text-blue-950">{bilan.passif.dettesFinancement.fondsDedies.toFixed(2)}</td>
                    </tr>

                    <tr className="bg-slate-50 font-bold text-slate-900">
                      <td colSpan={2} className="p-2 uppercase">II. PASSIF CIRCULANT (HORS TRÉSORERIE)</td>
                    </tr>
                    <tr>
                      <td className="p-2 pl-4">Fournisseurs et comptes rattachés (441)</td>
                      <td className="p-2 text-right font-mono">{bilan.passif.passifCirculant.fournisseurs.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td className="p-2 pl-4">Comptes des membres et adhérents créditeurs (446)</td>
                      <td className="p-2 text-right font-mono">{bilan.passif.passifCirculant.dettesMembres.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td className="p-2 pl-4">Usagers créditeurs (447) & Dettes des legs (4480)</td>
                      <td className="p-2 text-right font-mono">{(bilan.passif.passifCirculant.dettesUsagers + bilan.passif.passifCirculant.dettesLegs).toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td className="p-2 pl-4">Organismes sociaux & État (443, 444, 445)</td>
                      <td className="p-2 text-right font-mono">{bilan.passif.passifCirculant.organismesSociauxEtEtat.toFixed(2)}</td>
                    </tr>

                    <tr className="bg-slate-50 font-bold text-slate-900">
                      <td colSpan={2} className="p-2 uppercase">III. TRÉSORERIE - PASSIF</td>
                    </tr>
                    <tr>
                      <td className="p-2 pl-4">Banques (soldes créditeurs / découverts)</td>
                      <td className="p-2 text-right font-mono">{bilan.passif.tresoreriePassif.decouverts.toFixed(2)}</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-900 text-white font-bold border-t-2 border-slate-950">
                      <td className="p-2.5 uppercase text-right">TOTAL GÉNÉRAL PASSIF (I + II + III)</td>
                      <td className="p-2.5 text-right font-mono text-emerald-300 text-sm">
                        {bilan.passif.totalGeneral.toFixed(2)} DH
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Bilan Balance verification message */}
            <div className={`p-3 rounded border text-xs flex items-center justify-between ${
              bilan.equilibre ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span><strong>Contrôle d'équilibre patrimonial :</strong> Total Actif = {bilan.actif.totalGeneral.toFixed(2)} DH | Total Passif = {bilan.passif.totalGeneral.toFixed(2)} DH</span>
              </div>
              <span className="font-mono font-bold">Écart : {bilan.ecartBilan.toFixed(2)} DH</span>
            </div>
          </div>
        )}

        {/* ================= REPORT: CPC (Pages 48-49 CNC) ================= */}
        {reportType === 'cpc' && (
          <div className="space-y-6">
            <div className="text-center py-2 bg-slate-100 border border-slate-200 rounded font-bold text-slate-900 text-sm uppercase">
              COMPTE DE PRODUITS ET CHARGES (CPC) - EXERCICE CLOS LE 31/12/{profile.activeFiscalYear}
            </div>

            <div className="border border-slate-300 rounded overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-900 text-white font-semibold">
                  <tr>
                    <th className="p-2.5">Postes Comptables Spécifiques aux Associations</th>
                    <th className="p-2.5 text-right w-36">Exercice N (DH)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {/* PRODUITS D'EXPLOITATION */}
                  <tr className="bg-slate-100 font-bold text-slate-900">
                    <td colSpan={2} className="p-2 uppercase">I. PRODUITS D'EXPLOITATION</td>
                  </tr>
                  <tr>
                    <td className="p-2 pl-4">Ventes de marchandises (Dons en nature vendus - Compte 7110)</td>
                    <td className="p-2 text-right font-mono">{cpc.produitsExploitation.ventesDonsNature.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className="p-2 pl-4">Ventes de services et parrainages / sponsoring au Maroc (71244)</td>
                    <td className="p-2 text-right font-mono">{cpc.produitsExploitation.parrainages.toFixed(2)}</td>
                  </tr>
                  <tr className="bg-blue-50/30">
                    <td className="p-2 pl-4 font-semibold text-blue-950">Utilisations de l'exercice de fonds dédiés ou reportés (715)</td>
                    <td className="p-2 text-right font-mono font-semibold text-blue-950">{cpc.produitsExploitation.utilisationsFondsDedies.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className="p-2 pl-4">Subventions d'exploitation de l'exercice (7161)</td>
                    <td className="p-2 text-right font-mono">{cpc.produitsExploitation.subventionsExploitation.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className="p-2 pl-4">Cotisations et droits d'entrée sans contrepartie (7171)</td>
                    <td className="p-2 text-right font-mono">{(cpc.produitsExploitation.cotisations + cpc.produitsExploitation.droitsEntree).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className="p-2 pl-4">Ressources liées à la générosité du public (Dons manuels 71831)</td>
                    <td className="p-2 text-right font-mono">{cpc.produitsExploitation.donsManuels.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className="p-2 pl-4">Mécénats d'entreprises (71832)</td>
                    <td className="p-2 text-right font-mono">{cpc.produitsExploitation.mecenat.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className="p-2 pl-4">Contributions financières de partenaires (7184) & Concours publics (7187)</td>
                    <td className="p-2 text-right font-mono">{(cpc.produitsExploitation.contributionsFinancieres + cpc.produitsExploitation.concoursPublics).toFixed(2)}</td>
                  </tr>
                  <tr className="bg-slate-100 font-bold text-slate-900">
                    <td className="p-2 text-right uppercase">TOTAL PRODUITS D'EXPLOITATION (I)</td>
                    <td className="p-2 text-right font-mono text-emerald-800 font-bold">{cpc.produitsExploitation.total.toFixed(2)}</td>
                  </tr>

                  {/* CHARGES D'EXPLOITATION */}
                  <tr className="bg-slate-100 font-bold text-slate-900">
                    <td colSpan={2} className="p-2 uppercase">II. CHARGES D'EXPLOITATION</td>
                  </tr>
                  <tr>
                    <td className="p-2 pl-4">Achats consommés de matières et fournitures (612)</td>
                    <td className="p-2 text-right font-mono">{cpc.chargesExploitation.achatsFournitures.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className="p-2 pl-4">Locations, charges locatives, entretien et assurances (613)</td>
                    <td className="p-2 text-right font-mono">{(cpc.chargesExploitation.locationsEtCharges + cpc.chargesExploitation.entretiens + cpc.chargesExploitation.assurances).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className="p-2 pl-4">Rémunérations d'intermédiaires et honoraires (6136)</td>
                    <td className="p-2 text-right font-mono">{cpc.chargesExploitation.honoraires.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className="p-2 pl-4">Déplacements, missions et frais des bénévoles (6141)</td>
                    <td className="p-2 text-right font-mono">{cpc.chargesExploitation.deplacementsMissions.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className="p-2 pl-4">Charges de personnel & cotisations sociales (617)</td>
                    <td className="p-2 text-right font-mono">{cpc.chargesExploitation.personnelEtSocial.toFixed(2)}</td>
                  </tr>
                  <tr className="bg-blue-50/30">
                    <td className="p-2 pl-4 font-semibold text-blue-950">Engagements à réaliser sur fonds reportés ou dédiés (615)</td>
                    <td className="p-2 text-right font-mono font-semibold text-blue-950">{cpc.chargesExploitation.engagementsFondsDedies.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className="p-2 pl-4">Aides financières octroyées (secours d'urgence, aides sociales - 6180)</td>
                    <td className="p-2 text-right font-mono">{cpc.chargesExploitation.aidesFinancieres.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className="p-2 pl-4">Dotations d'exploitation aux amortissements (619)</td>
                    <td className="p-2 text-right font-mono">{cpc.chargesExploitation.dotationsAmortissements.toFixed(2)}</td>
                  </tr>
                  <tr className="bg-slate-100 font-bold text-slate-900">
                    <td className="p-2 text-right uppercase">TOTAL CHARGES D'EXPLOITATION (II)</td>
                    <td className="p-2 text-right font-mono text-rose-800 font-bold">{cpc.chargesExploitation.total.toFixed(2)}</td>
                  </tr>

                  {/* EXCÉDENT OU INSUFFISANCE D'EXPLOITATION */}
                  <tr className="bg-slate-200 font-bold text-slate-900">
                    <td className="p-2.5 uppercase">III. EXCÉDENT (+) OU INSUFFISANCE (-) D'EXPLOITATION (I - II)</td>
                    <td className={`p-2.5 text-right font-mono font-bold text-sm ${cpc.excedentExploitation >= 0 ? 'text-emerald-800' : 'text-rose-800'}`}>
                      {cpc.excedentExploitation.toFixed(2)} DH
                    </td>
                  </tr>

                  {/* RÉSULTAT NET DE L'EXERCICE */}
                  <tr className="bg-slate-900 text-white font-bold text-sm">
                    <td className="p-3 uppercase">
                      RÉSULTAT NET DE L'EXERCICE ({cpc.isExcedent ? 'EXCÉDENT' : 'INSUFFISANCE'})
                    </td>
                    <td className="p-3 text-right font-mono text-emerald-300 text-base">
                      {cpc.resultatNet.toFixed(2)} DH
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded text-xs text-slate-600">
              <strong>Note juridique Dahir 1958 :</strong> Les associations ne poursuivant aucun but lucratif, le solde positif constitue un « Excédent » non partageable entre les membres, reporté pour la réalisation des missions sociales de l'association.
            </div>
          </div>
        )}

        {/* ================= REPORT: ETIC (États S1 à S8) ================= */}
        {reportType === 'etic' && (
          <div className="space-y-6">
            <div className="text-center py-2 bg-slate-100 border border-slate-200 rounded font-bold text-slate-900 text-sm uppercase">
              ÉTAT DES INFORMATIONS COMPLÉMENTAIRES (ETIC - CNC AVIS N°23)
            </div>

            {/* ETIC selector buttons */}
            <div className="flex flex-wrap gap-1.5 no-print text-xs">
              {[
                { id: 'S1', label: 'S1 : Informations Générales' },
                { id: 'S2', label: 'S2 : Effectifs Bénévoles' },
                { id: 'S3', label: 'S3 : Contributions en Nature' },
                { id: 'S4', label: 'S4 : Fonds Dédiés' },
                { id: 'S5', label: 'S5 : Charges/Produits Projets' },
                { id: 'S6', label: 'S6 : Générosité Publique' },
                { id: 'S7', label: 'S7 : Subventions Publiques (PM 13/2022)' },
                { id: 'S8', label: 'S8 : Autres Infos' }
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveEticState(item.id as any)}
                  className={`px-3 py-1.5 rounded font-semibold transition-colors cursor-pointer ${
                    activeEticState === item.id ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* S1: Informations Générales */}
            {activeEticState === 'S1' && (
              <div className="border border-slate-300 rounded p-5 space-y-4 text-xs">
                <h3 className="font-bold text-sm text-slate-900 uppercase border-b pb-2">
                  ÉTAT S1 : INFORMATIONS GÉNÉRALES SUR L'ASSOCIATION ET L'EXERCICE EN COURS
                </h3>
                <div className="space-y-3">
                  <div>
                    <strong className="block text-slate-800 mb-1">1. Descriptif de l'objet social de l'entité :</strong>
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded text-slate-700 leading-relaxed">
                      L'association a pour mission le renforcement de la solidarité humaine, l'organisation de caravanes médicales et de dépistage sanitaire en milieu rural isolé (Moyen Atlas et zones périurbaines), ainsi que le soutien scolaire et l'équipement numérique des écoles communautaires défavorisées.
                    </div>
                  </div>
                  <div>
                    <strong className="block text-slate-800 mb-1">2. Nature et périmètre des activités ou missions sociales réalisées :</strong>
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded text-slate-700">
                      Organisation de 4 caravanes de consultations pédiatriques gratuites, distribution de médicaments essentiels, distribution de kits scolaires et installation de 15 tablettes éducatives dans deux écoles de la région de Casablanca-Settat.
                    </div>
                  </div>
                  <div>
                    <strong className="block text-slate-800 mb-1">3. Faits majeurs et faits caractéristiques de l'exercice :</strong>
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded text-slate-700">
                      Signature de la convention de partenariat avec l'INDH (Arrêté 2026/084) portant sur un financement de 90 000 DH et mise en application stricte du nouveau Plan Comptable des Associations (CNC Avis n°23 de 2023).
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* S2: Effectifs bénévoles */}
            {activeEticState === 'S2' && (
              <div className="border border-slate-300 rounded p-5 space-y-3 text-xs">
                <h3 className="font-bold text-sm text-slate-900 uppercase border-b pb-2">
                  ÉTAT S2 : ÉTAT DES EFFECTIFS BÉNÉVOLES
                </h3>
                <table className="w-full text-xs text-left border">
                  <thead className="bg-slate-100 font-semibold border-b">
                    <tr>
                      <th className="p-2 border-r">Nom du bénévole</th>
                      <th className="p-2 border-r">Type</th>
                      <th className="p-2 border-r">Description des tâches</th>
                      <th className="p-2 text-right">Nombre total d'heures</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {volunteers.map(v => (
                      <tr key={v.id}>
                        <td className="p-2 border-r font-medium">{v.volunteerName}</td>
                        <td className="p-2 border-r capitalize">{v.type}</td>
                        <td className="p-2 border-r">{v.taskDescription}</td>
                        <td className="p-2 text-right font-mono font-bold">{v.hoursWorked} h</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* S3: Contributions volontaires en nature */}
            {activeEticState === 'S3' && (
              <div className="border border-slate-300 rounded p-5 space-y-3 text-xs">
                <h3 className="font-bold text-sm text-slate-900 uppercase border-b pb-2">
                  ÉTAT S3 : TABLEAU D'ÉVALUATION DES CONTRIBUTIONS VOLONTAIRES EN NATURE
                </h3>
                <table className="w-full text-xs text-left border">
                  <thead className="bg-slate-100 font-semibold border-b">
                    <tr>
                      <th className="p-2 border-r">Nature de la contribution</th>
                      <th className="p-2 border-r">Description & Tiers</th>
                      <th className="p-2 border-r">Méthode d'estimation</th>
                      <th className="p-2 text-right">Montant estimé (DH)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {inKind.map(i => (
                      <tr key={i.id}>
                        <td className="p-2 border-r font-semibold uppercase">{i.nature}</td>
                        <td className="p-2 border-r">{i.description} ({i.providerName})</td>
                        <td className="p-2 border-r text-slate-500">{i.valuationMethod}</td>
                        <td className="p-2 text-right font-mono font-bold text-blue-900">{i.estimatedValue.toFixed(2)} DH</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* S4 to S8 representations */}
            {activeEticState === 'S4' && (
              <div className="border border-slate-300 rounded p-5 space-y-3 text-xs">
                <h3 className="font-bold text-sm text-slate-900 uppercase border-b pb-2">
                  ÉTAT S4 : TABLEAU RELATIF AUX FONDS DÉDIÉS (RUBRIQUE 19)
                </h3>
                <p className="text-slate-600">
                  Suivi pluriannuel des fonds affectés par des financeurs à des projets définis non encore consommés à la clôture.
                </p>
                <div className="p-4 bg-slate-50 border rounded font-mono">
                  • Variation des fonds dédiés sur subventions d'exploitation (Compte 1941) : Reliquat disponible de 35 100 DH<br />
                  • Reprises en produits au rythme de réalisation des dépenses (Compte 71521).
                </div>
              </div>
            )}

            {activeEticState === 'S5' && (
              <div className="border border-slate-300 rounded p-5 space-y-3 text-xs">
                <h3 className="font-bold text-sm text-slate-900 uppercase border-b pb-2">
                  ÉTAT S5 : TABLEAU DES CHARGES ET DES PRODUITS PAR PROJET
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {projects.map(p => (
                    <div key={p.id} className="p-4 border rounded bg-slate-50">
                      <div className="font-bold text-slate-900">{p.code} - {p.title}</div>
                      <div className="mt-2 text-[11px] text-slate-600 space-y-1">
                        <div>Budget prévisionnel : {p.budgetPlanned.toFixed(2)} DH</div>
                        <div>Dépenses réalisées : {p.budgetSpent.toFixed(2)} DH</div>
                        <div>Taux de consommation : {p.budgetPlanned > 0 ? ((p.budgetSpent / p.budgetPlanned) * 100).toFixed(1) : 0}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeEticState === 'S6' && (
              <div className="border border-slate-300 rounded p-5 space-y-3 text-xs">
                <h3 className="font-bold text-sm text-slate-900 uppercase border-b pb-2">
                  ÉTAT S6 : COMPTE D'EMPLOI DES RESSOURCES COLLECTÉES AUPRÈS DU PUBLIC
                </h3>
                <p className="text-slate-600">
                  Établi en application de la Loi n° 18-18 relative à l'organisation des appels à la générosité publique.
                </p>
                <div className="p-4 bg-slate-50 border rounded font-mono text-[11px] space-y-1">
                  <div>1. Ressources de générosité perçues (Dons & Mécénats) : {cpc.produitsExploitation.donsManuels + cpc.produitsExploitation.mecenat} DH</div>
                  <div>2. Emplois affectés aux missions sociales directes : 100%</div>
                  <div>3. Frais de collecte et d'appel à la générosité : 0 DH</div>
                </div>
              </div>
            )}

            {activeEticState === 'S7' && (
              <div className="border border-slate-300 rounded p-5 space-y-3 text-xs">
                <h3 className="font-bold text-sm text-slate-900 uppercase border-b pb-2">
                  ÉTAT S7 : SUBVENTIONS ET CONCOURS PUBLICS REÇUS (CIRCULAIRE PM N° 13/2022)
                </h3>
                <p className="text-slate-600">
                  Conventions en cours : INDH (90 000 DH accordés, 60 000 DH débloqués) et Ministère de la Solidarité (75 000 DH accordés, 50 000 DH débloqués).
                </p>
              </div>
            )}

            {activeEticState === 'S8' && (
              <div className="border border-slate-300 rounded p-5 space-y-3 text-xs">
                <h3 className="font-bold text-sm text-slate-900 uppercase border-b pb-2">
                  ÉTAT S8 : AUTRES INFORMATIONS COMPTABLES ET FINANCIÈRES UTILES
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  L'association applique les méthodes d'évaluation prévues par le Code Général de Normalisation Comptable (CGNC) et respecte le principe de sincérité et de séparation des exercices. Aucune sûreté réelle ou garantie n'a été accordée sur les biens associatifs.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ================= REPORT: MODÈLE SIMPLIFIÉ (Pages 67-72 CNC) ================= */}
        {reportType === 'simplifie' && (
          <div className="space-y-6">
            <div className="text-center py-2 bg-emerald-50 border border-emerald-200 rounded font-bold text-emerald-950 text-sm uppercase">
              ÉTATS COMPTABLES DU MODÈLE SIMPLIFIÉ (COMPTABILITÉ DE TRÉSORERIE EN PARTIE DOUBLE)
            </div>
            <div className="p-4 bg-slate-50 border rounded text-xs text-slate-700 leading-relaxed">
              <strong>Champ d'application (Chapitre III du CNC) :</strong> Ce modèle s'adresse aux associations dont le total annuel des produits d'exploitation ne dépasse pas les seuils réglementaires. Il dispense l'association de l'établissement du manuel d'organisation et autorise une comptabilité de trésorerie en partie double centralisée par la balance générale.
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-4 bg-white border rounded">
                <div className="font-bold text-slate-900 mb-2">BILAN SIMPLIFIÉ</div>
                <div>• Immobilisations nettes : {bilan.actif.immobilise.net.toFixed(2)} DH</div>
                <div>• Créances membres & usagers : {bilan.actif.circulant.net.toFixed(2)} DH</div>
                <div>• Trésorerie active (Banque/Caisse) : {bilan.actif.tresorerie.net.toFixed(2)} DH</div>
                <div className="font-bold mt-2 pt-2 border-t text-blue-900">Total Général : {bilan.actif.totalGeneral.toFixed(2)} DH</div>
              </div>
              <div className="p-4 bg-white border rounded">
                <div className="font-bold text-slate-900 mb-2">CPC SIMPLIFIÉ</div>
                <div>• Total Produits courants : {cpc.totalProduits.toFixed(2)} DH</div>
                <div>• Total Charges courantes : {cpc.totalCharges.toFixed(2)} DH</div>
                <div className="font-bold mt-2 pt-2 border-t text-emerald-800">
                  {cpc.isExcedent ? 'Excédent de l\'exercice' : 'Insuffisance'} : {cpc.resultatNet.toFixed(2)} DH
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= REPORT: MODÈLE SUPER-SIMPLIFIÉ (Pages 75-80 CNC) ================= */}
        {reportType === 'supersimplifie' && (
          <div className="space-y-6">
            <div className="text-center py-2 bg-amber-50 border border-amber-200 rounded font-bold text-amber-950 text-sm uppercase">
              ÉTATS COMPTABLES DU MODÈLE SUPER-SIMPLIFIÉ (COMPTABILITÉ EN PARTIE SIMPLE)
            </div>
            <div className="p-4 bg-slate-50 border rounded text-xs text-slate-700 leading-relaxed">
              <strong>Champ d'application (Chapitre IV du CNC) :</strong> Destiné aux très petites associations pour faciliter leur gestion au moindre coût sur la base d'un enregistrement chronologique des encaissements (recettes) et décaissements (dépenses).
            </div>
            <div className="space-y-4 text-xs">
              <h4 className="font-bold text-slate-900 uppercase">1. État de réalisation du budget de fonctionnement</h4>
              <table className="w-full text-xs text-left border">
                <thead className="bg-slate-100 font-semibold border-b">
                  <tr>
                    <th className="p-2 border-r">Intitulé</th>
                    <th className="p-2 text-right border-r">Prévisions (DH)</th>
                    <th className="p-2 text-right border-r">Réalisations (DH)</th>
                    <th className="p-2 text-right">Écart</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {budgets.map(b => (
                    <tr key={b.id}>
                      <td className="p-2 border-r font-medium">{b.category}</td>
                      <td className="p-2 text-right font-mono border-r">{b.amountPlanned.toFixed(2)}</td>
                      <td className="p-2 text-right font-mono border-r font-bold">{b.amountRealized.toFixed(2)}</td>
                      <td className="p-2 text-right font-mono">{(b.amountRealized - b.amountPlanned).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Signatures block for official CNC submission */}
        <div className="grid grid-cols-2 gap-8 pt-10 mt-8 border-t-2 border-slate-900 text-center text-xs">
          <div>
            <span className="font-bold text-slate-900 uppercase block mb-12">Le Trésorier de l'Association</span>
            <span className="text-slate-600">{profile.treasurer}</span>
          </div>
          <div>
            <span className="font-bold text-slate-900 uppercase block mb-12">Le Président de l'Association</span>
            <span className="text-slate-600">{profile.president}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
