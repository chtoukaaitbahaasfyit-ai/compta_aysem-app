/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Gestion des Dépenses & Contrôle des Paiements pour ASSOCIATION COMPTA PRO
 */

import React, { useState } from 'react';
import {
  ArrowUpRight,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Search,
  Download,
  ShieldAlert,
  FileCheck2,
  Paperclip
} from 'lucide-react';
import {
  Depense,
  DepenseCategory,
  PaymentMethod,
  BankAccount,
  Project,
  AccountingEntry,
  AssociationProfile
} from '../types/accounting';
import { AccountingEngine } from '../services/accountingEngine';

interface DepensesManagerProps {
  depenses: Depense[];
  bankAccounts: BankAccount[];
  projects: Project[];
  profile: AssociationProfile;
  fiscalYear: string;
  onAddDepense: (depense: Depense, generatedEntry?: AccountingEntry) => void;
}

export const DepensesManager: React.FC<DepensesManagerProps> = ({
  depenses,
  bankAccounts,
  projects,
  profile,
  fiscalYear,
  onAddDepense
}) => {
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Form states
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [beneficiary, setBeneficiary] = useState('');
  const [category, setCategory] = useState<DepenseCategory>('projet');
  const [amount, setAmount] = useState<number>(1200);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('virement');
  const [checkNumber, setCheckNumber] = useState('');
  const [bankAccountId, setBankAccountId] = useState(bankAccounts[0]?.id || '');
  const [projectId, setProjectId] = useState(projects[0]?.id || '');
  const [justificationName, setJustificationName] = useState('');
  const [notes, setNotes] = useState('');

  const getDefaultAccountForCategory = (cat: DepenseCategory): string => {
    switch (cat) {
      case 'projet': return '6128';       // Fournitures projets et actions
      case 'achats': return '6121';       // Matières consommables
      case 'fonctionnement': return '6131';// Loyers / charges
      case 'deplacement': return '6141';  // Déplacements
      case 'prestation': return '6136';   // Honoraires
      case 'aide_sociale': return '6180'; // Aides financières octroyées
      default: return '6148';
    }
  };

  // Moroccan Legal 5,000 DH Cash Rule check
  const isViolatingCashRule = paymentMethod === 'especes' && amount > 5000;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!beneficiary.trim() || amount <= 0) {
      alert('Veuillez renseigner le bénéficiaire et un montant valide.');
      return;
    }

    if (isViolatingCashRule) {
      alert('INFRACTION RÉGLEMENTAIRE : Conformément au Plan Comptable des Associations du CNC (Section 4.2), tout règlement supérieur à 5.000 DH doit obligatoirement être effectué par chèque barré ou virement bancaire. Le paiement en espèces est prohibé.');
      return;
    }

    const targetAccount = bankAccounts.find(b => b.id === bankAccountId) || bankAccounts[0];
    const accountCharge = getDefaultAccountForCategory(category);
    const pieceNum = `DEP-${fiscalYear}-${Math.floor(1000 + Math.random() * 9000)}`;
    const voucherNum = `VOUCH-${fiscalYear}-${String(depenses.length + 1).padStart(4, '0')}`;

    const newDepense: Depense = {
      id: `dep-${Date.now()}`,
      date,
      pieceNumber: pieceNum,
      voucherNumber: voucherNum,
      beneficiary: beneficiary.trim(),
      category,
      amount,
      paymentMethod,
      checkNumber: checkNumber || undefined,
      bankAccountId: targetAccount.id,
      projectId: projectId || undefined,
      accountNumber: accountCharge,
      justificationName: justificationName || undefined,
      isCompliantWith5000DhRule: true,
      notes: notes.trim()
    };

    // Auto-generate double entry in Journal
    const journalCode = targetAccount.type === 'caisse' ? 'CA' : 'AC';
    const entryId = `ent-${Date.now()}`;
    newDepense.accountingEntryId = entryId;

    const generatedEntry: AccountingEntry = {
      id: entryId,
      pieceNumber: pieceNum,
      journalCode,
      date,
      period: date.substring(0, 7),
      fiscalYear,
      label: `Dépense: ${beneficiary} (${category.toUpperCase()})`,
      lines: [
        {
          id: `l-dep-1-${Date.now()}`,
          lineNumber: 1,
          accountNumber: accountCharge,
          accountLabel: `Charge: ${category}`,
          label: `${category} - ${beneficiary}`,
          debit: amount,
          credit: 0,
          thirdParty: beneficiary,
          projectId: projectId || undefined
        },
        {
          id: `l-dep-2-${Date.now()}`,
          lineNumber: 2,
          accountNumber: targetAccount.accountNumber,
          accountLabel: targetAccount.name,
          label: `Règlement ${paymentMethod} (${beneficiary})`,
          debit: 0,
          credit: amount,
          thirdParty: beneficiary,
          projectId: projectId || undefined
        }
      ],
      totalDebit: amount,
      totalCredit: amount,
      isBalanced: true,
      status: 'valide',
      sourceModule: 'depense',
      attachmentName: justificationName || undefined,
      createdAt: new Date().toISOString(),
      createdBy: 'Trésorier en fonction'
    };

    onAddDepense(newDepense, generatedEntry);
    setShowModal(false);
    setBeneficiary('');
    setJustificationName('');
    setNotes('');
  };

  const filteredDepenses = depenses.filter(d => {
    const matchesSearch =
      d.beneficiary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.pieceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.voucherNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || d.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalAmount = filteredDepenses.reduce((s, d) => s + d.amount, 0);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Title & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ArrowUpRight className="w-5 h-5 text-rose-700" />
            Gestion des Dépenses & Factures Fournisseurs
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Contrôle d'engagement, respect du seuil légal de 5.000 DH et imputation par projet
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded bg-rose-700 hover:bg-rose-600 text-white shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Engager une Dépense / Facture</span>
          </button>
        </div>
      </div>

      {/* Moroccan Legal Banner (5000 DH Rule) */}
      <div className="p-3 bg-amber-50 border border-amber-300 rounded-md text-xs text-amber-900 flex items-start gap-2.5">
        <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <div>
          <strong className="font-semibold text-amber-950">Règle légale marocaine de gestion financière (CNC Sec. 4.2) :</strong> Tout règlement d'une dépense supérieure à <strong>5.000 DH</strong> doit obligatoirement être effectué par chèque barré non endossable, virement bancaire ou moyen de paiement magnétique. Le système bloque automatiquement toute validation en espèces excédant ce montant.
        </div>
      </div>

      {/* Filter and stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs md:col-span-3 flex flex-wrap items-center gap-3 text-xs">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher par bénéficiaire, N° pièce..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="font-semibold text-slate-600">Catégorie :</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-rose-500"
            >
              <option value="all">Toutes catégories</option>
              <option value="projet">Projets associatifs (6128)</option>
              <option value="fonctionnement">Frais de fonctionnement (6131)</option>
              <option value="achats">Achats & Fournitures (6121)</option>
              <option value="prestation">Prestations & Honoraires (6136)</option>
              <option value="deplacement">Déplacements & Missions (6141)</option>
              <option value="aide_sociale">Aides financières octroyées (6180)</option>
            </select>
          </div>
        </div>

        <div className="bg-slate-900 text-white p-4 rounded-lg shadow-xs flex flex-col justify-center">
          <span className="text-[11px] text-slate-400 font-semibold uppercase">Total Dépenses Sélectionnées</span>
          <span className="text-xl font-bold font-mono-acc text-rose-300 mt-1">
            {AccountingEngine.formatMAD(totalAmount)}
          </span>
        </div>
      </div>

      {/* Depenses Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-900 text-white font-semibold">
              <tr>
                <th className="py-2.5 px-3 w-28">N° Pièce</th>
                <th className="py-2.5 px-3 w-24">Date</th>
                <th className="py-2.5 px-3 w-32">Catégorie</th>
                <th className="py-2.5 px-4">Fournisseur / Bénéficiaire</th>
                <th className="py-2.5 px-3 w-28">Mode Paiement</th>
                <th className="py-2.5 px-3 w-36">Projet</th>
                <th className="py-2.5 px-3 text-right w-32">Montant (DH)</th>
                <th className="py-2.5 px-3 text-center w-24">5 000 DH</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal">
              {filteredDepenses.map((d) => {
                const prj = projects.find(p => p.id === d.projectId);
                return (
                  <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-semibold text-rose-800">
                      {d.pieceNumber}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 font-mono">{d.date}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-800 border border-rose-200 uppercase">
                        {d.category}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-medium text-slate-900">
                      {d.beneficiary}
                      {d.justificationName && (
                        <span className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                          <Paperclip className="w-2.5 h-2.5" /> {d.justificationName}
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 capitalize text-slate-700">
                      {d.paymentMethod} {d.checkNumber ? `(${d.checkNumber})` : ''}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 text-[11px]">
                      {prj ? `${prj.code}` : 'Frais Généraux'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono-acc font-semibold text-rose-700">
                      {AccountingEngine.formatMAD(d.amount)}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Conforme
                      </span>
                    </td>
                  </tr>
                );
              })}

              {filteredDepenses.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Aucune dépense enregistrée.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add Depense */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full border border-slate-300 overflow-hidden text-xs">
            <div className="px-5 py-3 bg-slate-900 text-white font-bold flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-rose-400" />
                Enregistrer une Dépense / Facture
              </span>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date de la dépense *</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono focus:ring-1 focus:ring-rose-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Catégorie *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as DepenseCategory)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded bg-white focus:ring-1 focus:ring-rose-500 focus:outline-none font-semibold text-slate-800"
                  >
                    <option value="projet">Dépense de projet social (6128)</option>
                    <option value="achats">Achats & fournitures (6121)</option>
                    <option value="fonctionnement">Frais de fonctionnement (6131)</option>
                    <option value="prestation">Prestation / Honoraires (6136)</option>
                    <option value="deplacement">Déplacement & missions (6141)</option>
                    <option value="aide_sociale">Aide financière directe (6180)</option>
                    <option value="autre">Autre charge</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Bénéficiaire / Fournisseur *
                </label>
                <input
                  type="text"
                  required
                  value={beneficiary}
                  onChange={(e) => setBeneficiary(e.target.value)}
                  placeholder="Ex: Pharmacie Centrale, Librairie Al-Qods, Transporteur"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-rose-500 focus:outline-none font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Montant TTC (DH) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    value={amount}
                    onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 font-mono text-base font-bold text-rose-900 border border-slate-300 rounded focus:ring-1 focus:ring-rose-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mode de règlement *</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded bg-white focus:ring-1 focus:ring-rose-500 focus:outline-none font-semibold text-slate-800"
                  >
                    <option value="virement">Virement bancaire</option>
                    <option value="cheque">Chèque barré non endossable</option>
                    <option value="especes">Espèces (Autorisé ≤ 5.000 DH)</option>
                  </select>
                </div>
              </div>

              {/* Warning if cash > 5000 DH */}
              {isViolatingCashRule && (
                <div className="p-3 bg-rose-100 border border-rose-300 text-rose-900 rounded font-semibold flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-rose-700 shrink-0 mt-0.5" />
                  <div>
                    Violation de l'Article 21 du CNC : Le montant ({amount} DH) dépasse le seuil de 5.000 DH. Le règlement en espèces est strictement interdit. Veuillez sélectionner "Virement bancaire" ou "Chèque barré".
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Compte bancaire / Caisse *</label>
                  <select
                    value={bankAccountId}
                    onChange={(e) => setBankAccountId(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded bg-white focus:ring-1 focus:ring-rose-500 focus:outline-none"
                  >
                    {bankAccounts.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.accountNumber})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Affectation Projet (Optionnel)</label>
                  <select
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded bg-white focus:ring-1 focus:ring-rose-500 focus:outline-none"
                  >
                    <option value="">Frais généraux / Siège</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.code} - {p.title.substring(0, 20)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Pièce Justificative (Nom de fichier facture / bon de commande)
                </label>
                <input
                  type="text"
                  value={justificationName}
                  onChange={(e) => setJustificationName(e.target.value)}
                  placeholder="Ex: Facture_F-4029.pdf"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Détails / Objet de la commande</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Achat de 20 boîtes de pansements pour la caravane médicale"
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
                  disabled={isViolatingCashRule}
                  className="px-4 py-1.5 rounded bg-rose-700 hover:bg-rose-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold shadow-xs cursor-pointer"
                >
                  Valider la dépense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
