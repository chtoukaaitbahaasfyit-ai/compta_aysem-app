/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Gestion des Recettes & Cotisations pour ASSOCIATION COMPTA PRO
 */

import React, { useState } from 'react';
import {
  ArrowDownRight,
  Plus,
  Printer,
  Download,
  Search,
  CheckCircle2,
  FileText,
  Building,
  User,
  HeartHandshake
} from 'lucide-react';
import {
  Recette,
  RecetteNature,
  PaymentMethod,
  BankAccount,
  Project,
  Member,
  AccountingEntry,
  AssociationProfile
} from '../types/accounting';
import { AccountingEngine } from '../services/accountingEngine';

interface RecettesManagerProps {
  recettes: Recette[];
  bankAccounts: BankAccount[];
  projects: Project[];
  members: Member[];
  profile: AssociationProfile;
  fiscalYear: string;
  onAddRecette: (recette: Recette, generatedEntry?: AccountingEntry) => void;
}

export const RecettesManager: React.FC<RecettesManagerProps> = ({
  recettes,
  bankAccounts,
  projects,
  members,
  profile,
  fiscalYear,
  onAddRecette
}) => {
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNature, setSelectedNature] = useState<string>('all');
  const [selectedReceiptForPrint, setSelectedReceiptForPrint] = useState<Recette | null>(null);

  // Form states
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [nature, setNature] = useState<RecetteNature>('cotisation');
  const [memberId, setMemberId] = useState('');
  const [payerName, setPayerName] = useState('');
  const [amount, setAmount] = useState<number>(500);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('virement');
  const [checkNumber, setCheckNumber] = useState('');
  const [bankAccountId, setBankAccountId] = useState(bankAccounts[0]?.id || '');
  const [projectId, setProjectId] = useState('');
  const [notes, setNotes] = useState('');

  // Propose default account according to nature
  const getDefaultAccountForNature = (nat: RecetteNature): string => {
    switch (nat) {
      case 'cotisation': return '71711'; // Cotisations sans contrepartie
      case 'don': return '71831';        // Dons manuels
      case 'mecenat': return '71832';    // Mécénats d'entreprises
      case 'subvention': return '7161';  // Subventions d'exploitation
      case 'parrainage': return '71244'; // Parrainages au Maroc
      case 'vente': return '7110';       // Ventes de dons en nature
      default: return '7184';
    }
  };

  const handleMemberSelect = (mId: string) => {
    setMemberId(mId);
    const m = members.find(mem => mem.id === mId);
    if (m) {
      setPayerName(m.fullName);
      setAmount(m.annualFee || 500);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payerName.trim() || amount <= 0) {
      alert('Veuillez renseigner le payeur et un montant valide.');
      return;
    }

    const targetAccount = bankAccounts.find(b => b.id === bankAccountId) || bankAccounts[0];
    const accountProduct = getDefaultAccountForNature(nature);
    const pieceNum = `REC-${fiscalYear}-${Math.floor(1000 + Math.random() * 9000)}`;
    const receiptNum = `RECU-${fiscalYear}-${String(recettes.length + 1).padStart(4, '0')}`;

    const newRecette: Recette = {
      id: `rec-${Date.now()}`,
      date,
      pieceNumber: pieceNum,
      receiptNumber: receiptNum,
      nature,
      memberId: memberId || undefined,
      payerName: payerName.trim(),
      amount,
      paymentMethod,
      checkNumber: checkNumber || undefined,
      bankAccountId: targetAccount.id,
      projectId: projectId || undefined,
      accountNumber: accountProduct,
      notes: notes.trim()
    };

    // Auto-generate double entry in Journal
    const journalCode = targetAccount.type === 'caisse' ? 'CA' : 'BQ';
    const entryId = `ent-${Date.now()}`;
    newRecette.accountingEntryId = entryId;

    const generatedEntry: AccountingEntry = {
      id: entryId,
      pieceNumber: pieceNum,
      journalCode,
      date,
      period: date.substring(0, 7),
      fiscalYear,
      label: `Recette: ${payerName} - ${nature.toUpperCase()}`,
      lines: [
        {
          id: `l-rec-1-${Date.now()}`,
          lineNumber: 1,
          accountNumber: targetAccount.accountNumber,
          accountLabel: targetAccount.name,
          label: `Encaissement ${paymentMethod} (${payerName})`,
          debit: amount,
          credit: 0,
          thirdParty: payerName,
          projectId: projectId || undefined
        },
        {
          id: `l-rec-2-${Date.now()}`,
          lineNumber: 2,
          accountNumber: accountProduct,
          accountLabel: `Produit: ${nature}`,
          label: `Ressource ${nature} - ${payerName}`,
          debit: 0,
          credit: amount,
          thirdParty: payerName,
          projectId: projectId || undefined
        }
      ],
      totalDebit: amount,
      totalCredit: amount,
      isBalanced: true,
      status: 'valide',
      sourceModule: 'recette',
      createdAt: new Date().toISOString(),
      createdBy: 'Trésorier en fonction'
    };

    onAddRecette(newRecette, generatedEntry);
    setShowModal(false);
    setPayerName('');
    setNotes('');
  };

  const filteredRecettes = recettes.filter(r => {
    const matchesSearch =
      r.payerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.pieceNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesNature = selectedNature === 'all' || r.nature === selectedNature;
    return matchesSearch && matchesNature;
  });

  const totalAmount = filteredRecettes.reduce((s, r) => s + r.amount, 0);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Title & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4 no-print">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ArrowDownRight className="w-5 h-5 text-emerald-700" />
            Gestion des Recettes, Cotisations & Mécénats
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Enregistrement des ressources avec génération automatique des écritures et reçus légaux
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded bg-emerald-700 hover:bg-emerald-600 text-white shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Encaisser une Recette / Cotisation</span>
          </button>
        </div>
      </div>

      {/* Filter and stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 no-print">
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs md:col-span-3 flex flex-wrap items-center gap-3 text-xs">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher par payeur, N° reçu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="font-semibold text-slate-600">Nature :</label>
            <select
              value={selectedNature}
              onChange={(e) => setSelectedNature(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">Toutes natures</option>
              <option value="cotisation">Cotisations membres (71711)</option>
              <option value="subvention">Subventions publiques (7161)</option>
              <option value="mecenat">Mécénat d'entreprises (71832)</option>
              <option value="don">Dons manuels (71831)</option>
              <option value="parrainage">Parrainages (71244)</option>
            </select>
          </div>
        </div>

        <div className="bg-emerald-900 text-white p-4 rounded-lg shadow-xs flex flex-col justify-center">
          <span className="text-[11px] text-emerald-300 font-semibold uppercase">Total Recettes Sélectionnées</span>
          <span className="text-xl font-bold font-mono-acc text-white mt-1">
            {AccountingEngine.formatMAD(totalAmount)}
          </span>
        </div>
      </div>

      {/* Recettes Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-900 text-white font-semibold">
              <tr>
                <th className="py-2.5 px-3 w-28">N° Reçu</th>
                <th className="py-2.5 px-3 w-24">Date</th>
                <th className="py-2.5 px-3 w-32">Nature</th>
                <th className="py-2.5 px-4">Payeur / Adhérent / Donateur</th>
                <th className="py-2.5 px-3 w-28">Règlement</th>
                <th className="py-2.5 px-3 w-36">Compte Trésorerie</th>
                <th className="py-2.5 px-3 text-right w-32">Montant (DH)</th>
                <th className="py-2.5 px-3 text-center w-28">Reçu Légal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal">
              {filteredRecettes.map((r) => {
                const acc = bankAccounts.find(b => b.id === r.bankAccountId);
                return (
                  <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-semibold text-emerald-800">
                      {r.receiptNumber}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 font-mono">{r.date}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase">
                        {r.nature}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-medium text-slate-900">
                      {r.payerName}
                      {r.notes && (
                        <span className="block text-[11px] text-slate-400">{r.notes}</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 capitalize text-slate-700">
                      {r.paymentMethod} {r.checkNumber ? `(${r.checkNumber})` : ''}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 text-[11px]">
                      {acc?.name || 'Banque'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono-acc font-semibold text-emerald-800">
                      {AccountingEngine.formatMAD(r.amount)}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => setSelectedReceiptForPrint(r)}
                        className="flex items-center justify-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 mx-auto transition-colors cursor-pointer"
                        title="Imprimer le Reçu Officiel / Attestation"
                      >
                        <Printer className="w-3 h-3" />
                        <span>Imprimer</span>
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredRecettes.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Aucune recette enregistrée.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add Recette */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full border border-slate-300 overflow-hidden text-xs">
            <div className="px-5 py-3 bg-slate-900 text-white font-bold flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-400" />
                Enregistrer une Recette / Cotisation
              </span>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date d'encaissement *</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nature de la ressource *</label>
                  <select
                    value={nature}
                    onChange={(e) => setNature(e.target.value as RecetteNature)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded bg-white focus:ring-1 focus:ring-emerald-500 focus:outline-none font-semibold text-emerald-900"
                  >
                    <option value="cotisation">Cotisation Adhérent (71711)</option>
                    <option value="don">Don Manuel (71831)</option>
                    <option value="mecenat">Mécénat d'entreprise (71832)</option>
                    <option value="subvention">Subvention publique (7161)</option>
                    <option value="parrainage">Parrainage / Sponsoring (71244)</option>
                    <option value="autre">Autre ressource</option>
                  </select>
                </div>
              </div>

              {/* If cotisation, show member quick picker */}
              {nature === 'cotisation' && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Sélectionner un adhérent existant (Optionnel)
                  </label>
                  <select
                    value={memberId}
                    onChange={(e) => handleMemberSelect(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded bg-white focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="">-- Saisie libre ou choisir adhérent --</option>
                    {members.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.memberNumber} - {m.fullName} ({m.annualFee} DH - Statut: {m.status})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nom du Payeur / Donateur / Organisme *
                </label>
                <input
                  type="text"
                  required
                  value={payerName}
                  onChange={(e) => setPayerName(e.target.value)}
                  placeholder="Ex: Société Marocaine de Mécénat ou M. Karim Tazi"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500 focus:outline-none font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Montant perçu (DH) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    value={amount}
                    onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 font-mono text-base font-bold text-emerald-900 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mode de règlement *</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded bg-white focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="virement">Virement bancaire</option>
                    <option value="cheque">Chèque bancaire</option>
                    <option value="especes">Espèces (Reçu de caisse)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Compte de Trésorerie *</label>
                  <select
                    value={bankAccountId}
                    onChange={(e) => setBankAccountId(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded bg-white focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  >
                    {bankAccounts.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.accountNumber})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Projet rattaché (Optionnel)</label>
                  <select
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded bg-white focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="">Fonds généraux de l'association</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.code} - {p.title.substring(0, 20)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {paymentMethod === 'cheque' && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">N° du Chèque & Banque émettrice</label>
                  <input
                    type="text"
                    value={checkNumber}
                    onChange={(e) => setCheckNumber(e.target.value)}
                    placeholder="Ex: CHQ-992140 (Attijariwafa)"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono"
                  />
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Observations / Précisions</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Cotisation annuelle 2026 votée lors de l'AG"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded"
                />
              </div>

              <div className="p-3 bg-emerald-50 rounded border border-emerald-200 text-slate-600 text-[11px]">
                <strong className="text-emerald-900 block mb-0.5">Automatisme comptable SAGE 100 :</strong>
                L'enregistrement crée instantanément l'écriture équilibrée dans le journal de trésorerie avec débit du compte de trésorerie et crédit du compte de produit.
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
                  Valider l'encaissement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Receipt / Donation Certificate Print Modal */}
      {selectedReceiptForPrint && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-xl w-full border border-slate-300 overflow-hidden text-xs">
            <div className="px-5 py-3 bg-slate-900 text-white font-bold flex items-center justify-between no-print">
              <span>Reçu Officiel de Versement ({selectedReceiptForPrint.receiptNumber})</span>
              <button onClick={() => setSelectedReceiptForPrint(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="p-6 space-y-4 print:p-0">
              <div className="border-b-2 border-slate-900 pb-3 flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">{profile.name}</h3>
                  <p className="text-slate-600 text-[11px]">{profile.address}, {profile.city}</p>
                  <p className="text-[10px] text-slate-500">IF: {profile.ifFiscal} • CNSS: {profile.cnss} • Dahir 1958</p>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-blue-900 block text-sm">{selectedReceiptForPrint.receiptNumber}</span>
                  <span className="text-slate-600">Date : {selectedReceiptForPrint.date}</span>
                </div>
              </div>

              <div className="text-center py-2 bg-slate-100 rounded border border-slate-200 font-bold text-slate-800 uppercase tracking-wide">
                REÇU OFFICIEL DE {selectedReceiptForPrint.nature.toUpperCase()}
              </div>

              <div className="space-y-2 text-slate-800 leading-relaxed">
                <p>
                  L'association <strong>{profile.name}</strong> certifie par la présente avoir reçu de :
                </p>
                <div className="p-3 bg-slate-50 rounded border border-slate-200 font-semibold text-slate-900 text-sm">
                  {selectedReceiptForPrint.payerName}
                </div>
                <p>
                  La somme de : <strong className="font-mono text-emerald-800 text-sm">{AccountingEngine.formatMAD(selectedReceiptForPrint.amount)}</strong>
                </p>
                <p>
                  Mode de versement : <strong className="capitalize">{selectedReceiptForPrint.paymentMethod}</strong> {selectedReceiptForPrint.checkNumber ? `(Réf: ${selectedReceiptForPrint.checkNumber})` : ''}
                </p>
                {selectedReceiptForPrint.notes && (
                  <p className="text-slate-600 text-[11px]">
                    <strong>Motif :</strong> {selectedReceiptForPrint.notes}
                  </p>
                )}
                <p className="text-[10px] text-slate-500 italic mt-3">
                  * Ce reçu est délivré pour faire valoir ce que de droit, conformément aux dispositions du Dahir n° 1-58-376 et du Code Général des Impôts marocain.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-200 text-center">
                <div>
                  <span className="font-semibold text-slate-700 block mb-10">Le Trésorier</span>
                  <span className="text-[11px] text-slate-500">{profile.treasurer}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-700 block mb-10">Le Président</span>
                  <span className="text-[11px] text-slate-500">{profile.president}</span>
                </div>
              </div>
            </div>

            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-2 no-print">
              <button
                type="button"
                onClick={() => setSelectedReceiptForPrint(null)}
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
                <span>Imprimer le Reçu</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
