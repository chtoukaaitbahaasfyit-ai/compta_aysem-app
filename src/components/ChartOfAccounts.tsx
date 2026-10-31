/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Plan Comptable des Associations Marocaines (CNC Avis n°23 de 2023)
 */

import React, { useState } from 'react';
import {
  ListTree,
  Search,
  Plus,
  RotateCcw,
  Download,
  Filter,
  Check,
  Tag,
  Info
} from 'lucide-react';
import { Account } from '../types/accounting';
import { StorageService } from '../services/storageService';

interface ChartOfAccountsProps {
  accounts: Account[];
  onUpdateAccounts: (accounts: Account[]) => void;
}

export const ChartOfAccounts: React.FC<ChartOfAccountsProps> = ({
  accounts,
  onUpdateAccounts
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [onlySpecific, setOnlySpecific] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form for new account
  const [newNumber, setNewNumber] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [newType, setNewType] = useState<'actif' | 'passif' | 'charge' | 'produit' | 'special'>('charge');
  const [newDesc, setNewDesc] = useState('');
  const [newIsSpecific, setNewIsSpecific] = useState(true);
  const [formError, setFormError] = useState('');

  const classDescriptions: Record<number, string> = {
    0: 'Comptes de contributions volontaires en nature (Bénévolat, Dons & Prestations en nature)',
    1: 'Comptes de financement permanent (Fonds propres, Réserves pour projets, Fonds reportés & dédiés)',
    2: 'Comptes d\'actif immobilisé (Immobilisations corporelles, Biens reçus en legs destinés à être cédés)',
    3: 'Comptes d\'actif circulant (Créances des membres et adhérents, Créances des usagers)',
    4: 'Comptes de passif circulant (Dettes envers les membres, usagers et partenaires)',
    5: 'Comptes de trésorerie (Banques, Trésorerie Générale, Chèques à encaisser, Caisses)',
    6: 'Comptes de charges (Achats, Aides financières octroyées, Engagements sur fonds dédiés)',
    7: 'Comptes de produits (Cotisations, Droits d\'entrée, Mécénats, Subventions d\'exploitation)'
  };

  const filteredAccounts = accounts.filter(acc => {
    const matchesSearch =
      acc.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acc.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (acc.description && acc.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesClass = selectedClass === 'all' || acc.classNumber.toString() === selectedClass;
    const matchesSpecific = !onlySpecific || acc.isSpecificAssociation;

    return matchesSearch && matchesClass && matchesSpecific;
  });

  const handleAddAccount = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const trimmedNum = newNumber.trim();
    const trimmedLabel = newLabel.trim();

    if (!trimmedNum || !trimmedLabel) {
      setFormError('Le numéro et l\'intitulé sont obligatoires.');
      return;
    }

    if (accounts.some(a => a.number === trimmedNum)) {
      setFormError('Ce numéro de compte existe déjà.');
      return;
    }

    const classNum = parseInt(trimmedNum.charAt(0)) || 0;

    const newAcc: Account = {
      number: trimmedNum,
      label: trimmedLabel,
      classNumber: classNum,
      type: newType,
      description: newDesc,
      isSpecificAssociation: newIsSpecific
    };

    const updated = [...accounts, newAcc].sort((a, b) => a.number.localeCompare(b.number));
    onUpdateAccounts(updated);
    StorageService.saveAccounts(updated);
    StorageService.addAuditLog('PLAN_COMPTABLE', `Ajout du compte ${newAcc.number} - ${newAcc.label}`);

    setShowAddModal(false);
    setNewNumber('');
    setNewLabel('');
    setNewDesc('');
  };

  const handleResetToCNC = () => {
    if (window.confirm('Voulez-vous réinitialiser le plan comptable aux comptes officiels du Plan Comptable des Associations (CNC Avis n°23) ?')) {
      const reset = StorageService.resetAccountsToCNC();
      onUpdateAccounts(reset);
      StorageService.addAuditLog('PLAN_COMPTABLE', 'Réinitialisation du plan comptable au standard officiel CNC 2023');
    }
  };

  const handleExportCSV = () => {
    const headers = ['Numero_Compte', 'Intitule', 'Classe', 'Type', 'Specifique_Association', 'Description'];
    const rows = filteredAccounts.map(a => [
      `"${a.number}"`,
      `"${a.label.replace(/"/g, '""')}"`,
      a.classNumber,
      a.type,
      a.isSpecificAssociation ? 'OUI' : 'NON',
      `"${(a.description || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Plan_Comptable_Associations_Maroc_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Title & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ListTree className="w-5 h-5 text-blue-700" />
            Plan Comptable des Associations & Organismes à But Non Lucratif
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Nomenclature officielle adoptée par le Conseil National de la Comptabilité (Avis n°23 du CNC du 25 avril 2023)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded bg-blue-700 hover:bg-blue-600 text-white shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nouveau Compte</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Exporter CSV</span>
          </button>
          <button
            onClick={handleResetToCNC}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 shadow-xs transition-colors cursor-pointer"
            title="Réinitialiser au standard officiel CNC"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Réinitialiser CNC</span>
          </button>
        </div>
      </div>

      {/* Class quick explanation banner */}
      <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-md text-xs text-blue-900 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold">Structure comptable spécifique aux associations :</span> Comprend obligatoirement la <strong className="text-blue-950">Classe 0</strong> (Contributions bénévoles et dons en nature non monétaires valorisés hors trésorerie), la <strong className="text-blue-950">Classe 19</strong> (Fonds dédiés aux projets pluriannuels), ainsi que les comptes dédiés aux cotisations (717), mécénats (71832) et subventions (7161).
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search input */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher par numéro (ex: 717, 1941, 044) ou intitulé..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Toggle specific association filter */}
          <button
            onClick={() => setOnlySpecific(!onlySpecific)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium border transition-colors cursor-pointer ${
              onlySpecific
                ? 'bg-blue-100 border-blue-300 text-blue-800'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Tag className="w-3.5 h-3.5 text-blue-600" />
            <span>Spécifique Associations ({accounts.filter(a => a.isSpecificAssociation).length})</span>
          </button>
        </div>

        {/* Class badges filter */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
          <span className="text-[11px] font-semibold text-slate-500 mr-2 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Classe :
          </span>
          <button
            onClick={() => setSelectedClass('all')}
            className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
              selectedClass === 'all'
                ? 'bg-blue-700 text-white font-semibold'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            Toutes ({accounts.length})
          </button>
          {[0, 1, 2, 3, 4, 5, 6, 7].map((num) => {
            const count = accounts.filter(a => a.classNumber === num).length;
            return (
              <button
                key={num}
                onClick={() => setSelectedClass(num.toString())}
                className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
                  selectedClass === num.toString()
                    ? 'bg-blue-700 text-white font-semibold shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
                title={classDescriptions[num]}
              >
                Classe {num} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Active class information */}
      {selectedClass !== 'all' && (
        <div className="text-xs text-slate-600 font-medium px-1 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-600"></span>
          <span>{classDescriptions[parseInt(selectedClass)]}</span>
        </div>
      )}

      {/* Accounts Table Grid */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="w-full text-xs text-left">
            <thead className="sticky top-0 bg-slate-900 text-white z-10">
              <tr>
                <th className="py-2.5 px-4 font-semibold w-28">N° de Compte</th>
                <th className="py-2.5 px-4 font-semibold">Intitulé Officiel</th>
                <th className="py-2.5 px-3 font-semibold text-center w-20">Classe</th>
                <th className="py-2.5 px-3 font-semibold w-24">Nature</th>
                <th className="py-2.5 px-3 font-semibold w-36 text-center">Spécifique Association</th>
                <th className="py-2.5 px-4 font-semibold">Précisions & Modalités CNC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal">
              {filteredAccounts.map((account) => (
                <tr key={account.number} className="hover:bg-blue-50/50 transition-colors">
                  <td className="py-2.5 px-4 font-mono font-semibold text-blue-800">
                    {account.number}
                  </td>
                  <td className="py-2.5 px-4 font-medium text-slate-900">
                    {account.label}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="px-2 py-0.5 rounded font-mono font-semibold text-[10px] bg-slate-100 text-slate-700 border border-slate-200">
                      Cl. {account.classNumber}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                      account.type === 'actif'
                        ? 'bg-sky-50 text-sky-800 border border-sky-200'
                        : account.type === 'passif'
                        ? 'bg-purple-50 text-purple-800 border border-purple-200'
                        : account.type === 'charge'
                        ? 'bg-rose-50 text-rose-800 border border-rose-200'
                        : account.type === 'produit'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}>
                      {account.type}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    {account.isSpecificAssociation ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-800">
                        <Check className="w-3 h-3 text-blue-700" /> Spécifique
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[11px]">-</span>
                    )}
                  </td>
                  <td className="py-2.5 px-4 text-slate-500 text-[11px]">
                    {account.description || 'Compte standard du référentiel comptable associatif'}
                  </td>
                </tr>
              ))}

              {filteredAccounts.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Aucun compte ne correspond à votre recherche.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex justify-between items-center">
          <span>Total comptes affichés : <strong>{filteredAccounts.length}</strong> sur {accounts.length}</span>
          <span className="text-[11px]">Norme CNC Décret n° 2-21-165</span>
        </div>
      </div>

      {/* Modal Add Account */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full border border-slate-300 overflow-hidden">
            <div className="px-5 py-3 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-400" />
                Créer un Compte ou Sous-Compte
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white text-base"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddAccount} className="p-5 space-y-4 text-xs">
              {formError && (
                <div className="p-2.5 rounded bg-rose-50 text-rose-700 border border-rose-200 font-medium">
                  {formError}
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Numéro de compte (ex: 514103, 612810, 718321) *
                </label>
                <input
                  type="text"
                  required
                  value={newNumber}
                  onChange={(e) => setNewNumber(e.target.value)}
                  placeholder="Ex: 612805"
                  className="w-full px-3 py-1.5 font-mono border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Intitulé du compte *
                </label>
                <input
                  type="text"
                  required
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="Ex: Fournitures ateliers enfants ruraux"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nature comptable
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none bg-white"
                  >
                    <option value="charge">Charge (Classe 6)</option>
                    <option value="produit">Produit (Classe 7)</option>
                    <option value="actif">Actif (Classes 2, 3, 5)</option>
                    <option value="passif">Passif (Classes 1, 4)</option>
                    <option value="special">Spécial (Classe 0)</option>
                  </select>
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newIsSpecific}
                      onChange={(e) => setNewIsSpecific(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                    <span className="font-semibold text-slate-700">Spécifique Association</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Description / Justification de l'usage
                </label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  rows={2}
                  placeholder="Détails sur l'utilisation de ce sous-compte..."
                  className="w-full px-3 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                ></textarea>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-1.5 rounded border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-blue-700 hover:bg-blue-600 text-white font-semibold shadow-xs"
                >
                  Enregistrer le compte
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
