/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Gestion de la Trésorerie & Rapprochement Bancaire pour ASSOCIATION COMPTA PRO
 */

import React, { useState, useEffect } from 'react';
import {
  Landmark,
  Wallet,
  ArrowRightLeft,
  CheckCircle2,
  FileSpreadsheet,
  Printer,
  Plus,
  Scale,
  Calendar,
  AlertCircle
} from 'lucide-react';

import { BankAccount, AccountingEntry } from '../types/accounting';
import { AccountingEngine } from '../services/accountingEngine';
import type { Account } from '../types/accounting';

// Safe numeric balance (legacy/partial cloud records may lack the field) and cent-exact rounding.
const bal = (a?: Pick<BankAccount, 'currentBalance'> | null): number => {
  const n = Number(a?.currentBalance);
  return Number.isFinite(n) ? n : 0;
};
const round2 = (n: number): number => Math.round(n * 100) / 100;

interface TreasuryManagerProps {
  bankAccounts: BankAccount[];
  entries: AccountingEntry[];
  fiscalYear: string;
  /** Chart of accounts: a bank/cash account must point to an existing treasury account (514xxx bank, 516xxx cash). */
  accounts?: Account[];
  onUpdateBankAccounts: (accounts: BankAccount[]) => void;
  onAddInternalTransfer: (entry: AccountingEntry) => void;
}

export const TreasuryManager: React.FC<TreasuryManagerProps> = ({
  bankAccounts,
  entries,
  fiscalYear,
  accounts = [],
  onUpdateBankAccounts,
  onAddInternalTransfer
}) => {
  const [activeSubTab, setActiveSubTab] = useState<
    'comptes' | 'virement' | 'rapprochement'
  >('comptes');

  // Formulaire d'ajout de compte ou caisse
  const [showAccountForm, setShowAccountForm] = useState(false);
  const [newAccountType, setNewAccountType] = useState<'banque' | 'caisse'>('banque');
  const [newAccountName, setNewAccountName] = useState('');
  const [newBankName, setNewBankName] = useState('');
  const [newRib, setNewRib] = useState('');
  const [newAccountNumber, setNewAccountNumber] = useState('');
  const [newInitialBalance, setNewInitialBalance] = useState(0);
  const [newSignatories, setNewSignatories] = useState('');

  // Virement interne
  const [sourceAccountId, setSourceAccountId] = useState(bankAccounts[0]?.id || '');
  const [targetAccountId, setTargetAccountId] = useState(bankAccounts[1]?.id || '');
  const [transferAmount, setTransferAmount] = useState<number>(3000);
  const [transferDate, setTransferDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [transferReason, setTransferReason] = useState<string>(
    'Alimentation caisse siège pour menues dépenses'
  );

  // Rapprochement bancaire
  const [reconcileAccountId, setReconcileAccountId] = useState(
    bankAccounts.find(b => b.type === 'banque')?.id || ''
  );
  const [bankStatementBalance, setBankStatementBalance] = useState<number>(0);
  const [checkedEntryIds, setCheckedEntryIds] = useState<string[]>([]);

  // Keep the selected accounts valid when the list loads/changes (ids chosen at mount may no longer exist).
  useEffect(() => {
    const ids = bankAccounts.map(b => b.id);
    const firstBank = bankAccounts.find(b => b.type === 'banque')?.id || '';
    if (!ids.includes(sourceAccountId)) setSourceAccountId(ids[0] || '');
    if (!ids.includes(targetAccountId) || targetAccountId === sourceAccountId) {
      setTargetAccountId(ids.find(id => id !== (ids.includes(sourceAccountId) ? sourceAccountId : ids[0])) || '');
    }
    if (!ids.includes(reconcileAccountId)) setReconcileAccountId(firstBank);
  }, [bankAccounts]);

  // Ajouter un compte bancaire ou une caisse
  const handleAddAccount = (e: React.FormEvent) => {
    e.preventDefault();

    const accountName = newAccountName.trim();
    const accountNumber = newAccountNumber.trim();

    if (!accountName || !accountNumber) {
      alert('Veuillez remplir le nom et le numéro comptable.');
      return;
    }

    // The account number is posted on every journal line: it must exist in the chart and be a treasury account.
    if (accounts.length > 0) {
      const prefix = newAccountType === 'banque' ? '514' : '516';
      const chartAccount = accounts.find(a => a.number === accountNumber);
      if (!chartAccount) {
        alert(`Le numéro ${accountNumber} n'existe pas dans le plan comptable. Créez-le d'abord ou choisissez un compte ${prefix}xxx existant.`);
        return;
      }
      if (!accountNumber.startsWith(prefix)) {
        alert(`Un compte ${newAccountType === 'banque' ? 'bancaire' : 'de caisse'} doit utiliser un numéro ${prefix}xxx (trésorerie).`);
        return;
      }
    }

    if (bankAccounts.some(b => b.accountNumber === accountNumber)) {
      alert('Ce numéro comptable existe déjà.');
      return;
    }

    if (!Number.isFinite(newInitialBalance) || newInitialBalance < 0) {
      alert('Le solde initial ne peut pas être négatif.');
      return;
    }

    const newAccount: BankAccount = {
      id: `acc-${Date.now()}`,
      name: accountName,
      type: newAccountType,
      bankName: newAccountType === 'banque' ? newBankName.trim() : 'Caisse',
      rib: newAccountType === 'banque' ? newRib.trim() : '',
      accountNumber,
      initialBalance: round2(newInitialBalance),
      currentBalance: round2(newInitialBalance),
      signatories: newAccountType === 'banque'
        ? newSignatories.split(',').map(s => s.trim()).filter(Boolean)
        : []
    };

    onUpdateBankAccounts([...bankAccounts, newAccount]);

    // Sélectionner automatiquement le nouveau compte
    if (bankAccounts.length === 0) {
      setSourceAccountId(newAccount.id);
      setTargetAccountId('');
    } else if (!sourceAccountId) {
      setSourceAccountId(newAccount.id);
    }

    if (newAccount.type === 'banque' && !reconcileAccountId) {
      setReconcileAccountId(newAccount.id);
    }

    // Réinitialiser le formulaire
    setNewAccountName('');
    setNewBankName('');
    setNewRib('');
    setNewAccountNumber('');
    setNewInitialBalance(0);
    setNewSignatories('');
    setNewAccountType('banque');
    setShowAccountForm(false);

    alert('Compte ajouté avec succès.');
  };

  // Virement interne
  const handleInternalTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const srcAcc = bankAccounts.find(b => b.id === sourceAccountId);
    const tgtAcc = bankAccounts.find(b => b.id === targetAccountId);

    if (!srcAcc || !tgtAcc) {
      alert('Veuillez sélectionner un compte source et un compte destination.');
      return;
    }

    if (sourceAccountId === targetAccountId) {
      alert('Le compte source et le compte de destination doivent être différents.');
      return;
    }

    if (!Number.isFinite(transferAmount) || transferAmount <= 0) {
      alert('Veuillez spécifier un montant positif.');
      return;
    }

    if (bal(srcAcc) < transferAmount) {
      alert('Le solde du compte source est insuffisant.');
      return;
    }

    // Sequential, collision-free piece number (the previous random 4-digit number could repeat).
    const virPrefix = `VIR-${fiscalYear}-`;
    const lastVirSeq = entries.reduce((max, e) => {
      if (!e.pieceNumber?.startsWith(virPrefix)) return max;
      const n = parseInt(e.pieceNumber.slice(virPrefix.length), 10);
      return Number.isFinite(n) && n > max ? n : max;
    }, 0);
    const pieceNum = `${virPrefix}${String(lastVirSeq + 1).padStart(4, '0')}`;
    const operationDate = new Date().toISOString();

    const entry: AccountingEntry = {
      id: `ent-vir-${Date.now()}`,
      pieceNumber: pieceNum,
      journalCode: 'OD',
      date: transferDate,
      period: transferDate.substring(0, 7),
      fiscalYear,
      label: `Virement interne: ${srcAcc.name} -> ${tgtAcc.name}`,
      lines: [
        {
          id: `l-vir-1-${Date.now()}`,
          lineNumber: 1,
          accountNumber: tgtAcc.accountNumber,
          accountLabel: tgtAcc.name,
          label: `Réception virement (${transferReason})`,
          debit: transferAmount,
          credit: 0
        },
        {
          id: `l-vir-2-${Date.now()}`,
          lineNumber: 2,
          accountNumber: srcAcc.accountNumber,
          accountLabel: srcAcc.name,
          label: `Émission virement (${transferReason})`,
          debit: 0,
          credit: transferAmount
        }
      ],
      totalDebit: transferAmount,
      totalCredit: transferAmount,
      isBalanced: true,
      status: 'valide',
      sourceModule: 'tresorerie',
      createdAt: operationDate,
      createdBy: 'Trésorier en fonction'
    };

    const updated = bankAccounts.map(b => {
      if (b.id === srcAcc.id) {
        return { ...b, currentBalance: round2(bal(b) - transferAmount) };
      }

      if (b.id === tgtAcc.id) {
        return { ...b, currentBalance: round2(bal(b) + transferAmount) };
      }

      return b;
    });

    onUpdateBankAccounts(updated);
    onAddInternalTransfer(entry);

    alert(`Virement interne de ${transferAmount} DH enregistré avec succès (Pièce : ${pieceNum}).`);

    setActiveSubTab('comptes');
  };

  // Pointage bancaire
  const toggleCheckReconciliation = (id: string) => {
    if (checkedEntryIds.includes(id)) {
      setCheckedEntryIds(checkedEntryIds.filter(i => i !== id));
    } else {
      setCheckedEntryIds([...checkedEntryIds, id]);
    }
  };

  // Compte sélectionné pour le rapprochement
  const currentReconcileAcc =
    bankAccounts.find(b => b.id === reconcileAccountId) ||
    bankAccounts.find(b => b.type === 'banque') ||
    bankAccounts[0];

  const accountEntries = currentReconcileAcc
    ? entries.filter(e =>
        e.status !== 'extourne' &&
        e.lines.some(l =>
          l.accountNumber === currentReconcileAcc.accountNumber
        )
      )
    : [];

  const bookBalance = bal(currentReconcileAcc);

  const reconciliationDifference =
    Math.round((bookBalance - bankStatementBalance) * 100) / 100;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">

      {/* Titre et navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4 no-print">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Landmark className="w-5 h-5 text-blue-700" />
            Gestion de Trésorerie & Rapprochement Bancaire
          </h2>

          <p className="text-xs text-slate-500 mt-1">
            Comptes bancaires, journaux de caisse, virements internes (5115) et pointage périodique
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
          <button
            onClick={() => setActiveSubTab('comptes')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
              activeSubTab === 'comptes'
                ? 'bg-blue-700 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Comptes & Caisses
          </button>

          <button
            onClick={() => setActiveSubTab('virement')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
              activeSubTab === 'virement'
                ? 'bg-blue-700 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Virement Interne (5115)
          </button>

          <button
            onClick={() => setActiveSubTab('rapprochement')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
              activeSubTab === 'rapprochement'
                ? 'bg-blue-700 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Rapprochement Bancaire
          </button>
        </div>
      </div>

      {/* Sous-onglet 1 : Comptes et caisses */}
      {activeSubTab === 'comptes' && (
        <div className="space-y-6">

          {/* Bouton Ajouter */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setShowAccountForm(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-600 text-white font-semibold text-sm"
            >
              <Plus className="w-4 h-4" />
              Ajouter un compte / une caisse
            </button>
          </div>

          {/* Formulaire d'ajout */}
          {showAccountForm && (
            <div className="bg-white border border-slate-300 rounded-lg p-5 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4">
                Ajouter un compte bancaire ou une caisse
              </h3>

              <form onSubmit={handleAddAccount} className="space-y-4">

                <div>
                  <label className="block text-xs font-semibold mb-1">
                    Type de compte *
                  </label>

                  <select
                    value={newAccountType}
                    onChange={e => setNewAccountType(e.target.value as 'banque' | 'caisse')}
                    className="w-full border border-slate-300 rounded-lg p-2 text-sm"
                  >
                    <option value="banque">Compte bancaire</option>
                    <option value="caisse">Caisse</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1">
                      Nom du compte *
                    </label>

                    <input
                      required
                      value={newAccountName}
                      onChange={e => setNewAccountName(e.target.value)}
                      placeholder="Ex: Compte principal"
                      className="w-full border border-slate-300 rounded-lg p-2 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1">
                      Numéro comptable *
                    </label>

                    <input
                      required
                      value={newAccountNumber}
                      onChange={e => setNewAccountNumber(e.target.value)}
                      placeholder={newAccountType === 'banque' ? 'Ex: 5141' : 'Ex: 5161'}
                      className="w-full border border-slate-300 rounded-lg p-2 text-sm"
                    />
                  </div>
                </div>

                {newAccountType === 'banque' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold mb-1">
                        Nom de la banque
                      </label>

                      <input
                        value={newBankName}
                        onChange={e => setNewBankName(e.target.value)}
                        placeholder="Ex: Banque Populaire"
                        className="w-full border border-slate-300 rounded-lg p-2 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold mb-1">
                        RIB
                      </label>

                      <input
                        value={newRib}
                        onChange={e => setNewRib(e.target.value)}
                        placeholder="RIB bancaire"
                        className="w-full border border-slate-300 rounded-lg p-2 text-sm"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold mb-1">
                    Solde initial (DH)
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={newInitialBalance}
                    onChange={e => setNewInitialBalance(parseFloat(e.target.value) || 0)}
                    className="w-full border border-slate-300 rounded-lg p-2 text-sm"
                  />
                </div>

                {newAccountType === 'banque' && (
                  <div>
                    <label className="block text-xs font-semibold mb-1">
                      Signataires (séparer les noms par des virgules)
                    </label>

                    <input
                      value={newSignatories}
                      onChange={e => setNewSignatories(e.target.value)}
                      placeholder="Président, Trésorier"
                      className="w-full border border-slate-300 rounded-lg p-2 text-sm"
                    />
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setShowAccountForm(false)}
                    className="px-4 py-2 border border-slate-300 rounded-lg text-sm"
                  >
                    Annuler
                  </button>

                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-700 hover:bg-blue-600 text-white rounded-lg text-sm font-bold"
                  >
                    Enregistrer
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Liste des comptes */}
          {bankAccounts.length === 0 ? (
            <div className="p-6 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm">
              Aucun compte bancaire ou caisse n'est enregistré.
              Cliquez sur « Ajouter un compte / une caisse » pour commencer.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {bankAccounts.map(acc => (
                <div
                  key={acc.id}
                  className="bg-white rounded-lg border border-slate-300 p-5 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-900">
                        {acc.accountNumber}
                      </span>

                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        acc.type === 'banque'
                          ? 'bg-sky-50 text-sky-800'
                          : 'bg-amber-50 text-amber-800'
                      }`}>
                        {acc.type}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 mt-2">
                      {acc.name}
                    </h3>

                    <p className="text-xs text-slate-500 font-mono mt-0.5">
                      {acc.bankName}
                    </p>

                    {acc.type === 'banque' && (
                      <div className="mt-4 p-3 bg-slate-50 rounded border border-slate-200 space-y-1 text-xs">
                        <div className="text-slate-500 text-[11px]">
                          Relevé d'Identité Bancaire (RIB) :
                        </div>

                        <div className="font-mono font-medium text-slate-800 break-all select-all">
                          {acc.rib || 'Non renseigné'}
                        </div>
                      </div>
                    )}

                    <div className="mt-4">
                      <span className="text-[11px] text-slate-400 block uppercase font-semibold">
                        Solde Comptable Actuel
                      </span>

                      <span className="text-2xl font-bold font-mono-acc text-slate-900">
                        {AccountingEngine.formatMAD(bal(acc))}
                      </span>
                    </div>
                  </div>

                  {acc.type === 'banque' && (
                    <div className="mt-5 pt-3 border-t border-slate-200 text-[11px] text-slate-500">
                      <strong>Signataires statutaires :</strong>

                      <ul className="list-disc pl-4 mt-1 text-slate-600">
                        {acc.signatories?.length
                          ? acc.signatories.map((sig, i) => (
                              <li key={i}>{sig}</li>
                            ))
                          : <li>Non renseignés</li>
                        }
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Note juridique */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md text-xs text-blue-900">
            <strong>Gouvernance & Sécurité financière :</strong>
            Tout moyen de paiement doit respecter les délégations et signatures
            autorisées par les statuts et les décisions du Bureau de l'association.
          </div>
        </div>
      )}

      {/* Sous-onglet 2 : Virement interne */}
      {activeSubTab === 'virement' && (
        <div className="bg-white rounded-lg border border-slate-300 p-6 shadow-xs max-w-2xl mx-auto text-xs">

          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-200">
            <ArrowRightLeft className="w-5 h-5 text-blue-700" />

            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Opération de Virement Interne (Compte 5115)
              </h3>

              <p className="text-[11px] text-slate-500">
                Transfert de fonds entre compte bancaire et caisse, ou entre deux banques
              </p>
            </div>
          </div>

          {bankAccounts.length < 2 ? (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded text-amber-800">
              Il faut enregistrer au moins deux comptes ou caisses pour effectuer un virement interne.
            </div>
          ) : (
            <form onSubmit={handleInternalTransferSubmit} className="space-y-4">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Compte Source (Émetteur) *
                  </label>

                  <select
                    value={sourceAccountId}
                    onChange={e => setSourceAccountId(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded bg-white font-medium"
                  >
                    {bankAccounts.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.accountNumber}) - Solde: {bal(b)} DH
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Compte Destination (Récepteur) *
                  </label>

                  <select
                    value={targetAccountId}
                    onChange={e => setTargetAccountId(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded bg-white font-medium"
                  >
                    {bankAccounts.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.accountNumber}) - Solde: {bal(b)} DH
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Montant transféré (DH) *
                  </label>

                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={transferAmount}
                    onChange={e => setTransferAmount(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 font-mono text-base font-bold text-blue-900 border border-slate-300 rounded"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Date d'opération *
                  </label>

                  <input
                    type="date"
                    required
                    value={transferDate}
                    onChange={e => setTransferDate(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Motif / Justification du virement *
                </label>

                <input
                  type="text"
                  required
                  value={transferReason}
                  onChange={e => setTransferReason(e.target.value)}
                  placeholder="Ex: Retrait bancaire pour approvisionnement caisse de projet"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded"
                />
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded text-slate-600 text-[11px]">
                <strong>Schéma comptable :</strong>
                L'opération débitera le compte cible et créditera le compte source.
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveSubTab('comptes')}
                  className="px-4 py-1.5 rounded border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium"
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-blue-700 hover:bg-blue-600 text-white font-bold shadow-xs cursor-pointer"
                >
                  Exécuter le Virement Interne
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Sous-onglet 3 : Rapprochement bancaire */}
      {activeSubTab === 'rapprochement' && (
        <div className="space-y-6">

          {bankAccounts.filter(b => b.type === 'banque').length === 0 ? (
            <div className="p-5 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
              Aucun compte bancaire n'est enregistré.
              Ajoutez d'abord un compte bancaire dans « Comptes & Caisses ».
            </div>
          ) : (
            <>
              <div className="bg-white p-5 rounded-lg border border-slate-300 shadow-xs flex flex-wrap items-center justify-between gap-4 text-xs">

                <div className="flex flex-wrap items-center gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Compte bancaire à rapprocher :
                    </label>

                    <select
                      value={currentReconcileAcc?.id || ''}
                      onChange={e => setReconcileAccountId(e.target.value)}
                      className="px-3 py-1.5 border border-slate-300 rounded bg-white font-semibold text-blue-900"
                    >
                      {bankAccounts.filter(b => b.type === 'banque').map(b => (
                        <option key={b.id} value={b.id}>
                          {b.name} ({b.accountNumber})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Solde selon Relevé Bancaire Papier (DH) :
                    </label>

                    <input
                      type="number"
                      step="0.01"
                      value={bankStatementBalance}
                      onChange={e => setBankStatementBalance(parseFloat(e.target.value) || 0)}
                      className="px-3 py-1.5 border border-slate-300 rounded font-mono font-bold text-slate-900"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase block">
                      Solde Comptable
                    </span>

                    <span className="font-mono-acc font-bold text-sm text-slate-800">
                      {AccountingEngine.formatMAD(bookBalance)}
                    </span>
                  </div>

                  <div className="pl-4 border-l border-slate-200">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase block">
                      Écart de rapprochement
                    </span>

                    <span className={`font-mono-acc font-bold text-sm ${
                      reconciliationDifference === 0
                        ? 'text-emerald-600'
                        : 'text-amber-600'
                    }`}>
                      {AccountingEngine.formatMAD(reconciliationDifference)}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold shadow-2xs"
                  >
                    <Printer className="w-3.5 h-3.5 text-slate-500" />
                    <span>Imprimer l'état</span>
                  </button>
                </div>
              </div>

              {/* Tableau de rapprochement */}
              <div className="bg-white rounded-lg border border-slate-300 shadow-xs overflow-hidden">

                <div className="px-4 py-2 bg-slate-100 border-b border-slate-200 font-semibold text-xs text-slate-700 flex justify-between items-center">
                  <span>
                    Écritures comptables sur ce compte bancaire
                  </span>

                  <span className="text-slate-500 text-[11px]">
                    Pointées : {checkedEntryIds.length} sur {accountEntries.length}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-900 text-white font-semibold">
                      <tr>
                        <th className="py-2 px-3 text-center w-12">Pointé</th>
                        <th className="py-2 px-3 w-24">Date</th>
                        <th className="py-2 px-3 w-32">N° Pièce</th>
                        <th className="py-2 px-4">Libellé de l'opération</th>
                        <th className="py-2 px-3 text-right w-32">Débit (Encaissement)</th>
                        <th className="py-2 px-3 text-right w-32">Crédit (Décaissement)</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {accountEntries.map(e => {
                        const line = e.lines.find(
                          l => l.accountNumber === currentReconcileAcc?.accountNumber
                        );

                        const isChecked = checkedEntryIds.includes(e.id);

                        return (
                          <tr
                            key={e.id}
                            className={`hover:bg-blue-50/50 transition-colors ${
                              isChecked ? 'bg-emerald-50/30' : ''
                            }`}
                          >
                            <td className="py-2 px-3 text-center">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleCheckReconciliation(e.id)}
                                className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                              />
                            </td>

                            <td className="py-2 px-3 text-slate-600 font-mono">
                              {e.date}
                            </td>

                            <td className="py-2 px-3 font-mono font-semibold text-blue-700">
                              {e.pieceNumber}
                            </td>

                            <td className="py-2 px-4 text-slate-800 font-medium">
                              {e.label}
                            </td>

                            <td className="py-2 px-3 text-right font-mono-acc text-emerald-700 font-semibold">
                              {line && line.debit > 0
                                ? AccountingEngine.formatMAD(line.debit)
                                : '-'}
                            </td>

                            <td className="py-2 px-3 text-right font-mono-acc text-rose-700 font-semibold">
                              {line && line.credit > 0
                                ? AccountingEngine.formatMAD(line.credit)
                                : '-'}
                            </td>
                          </tr>
                        );
                      })}

                      {accountEntries.length === 0 && (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-slate-400">
                            Aucune écriture comptable enregistrée sur ce compte.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
