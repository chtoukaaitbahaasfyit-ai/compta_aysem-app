/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Paramétrage de l'Association & Configuration des Modèles Comptables (SAGE 100)
 */

import React, { useState } from 'react';
import {
  Settings,
  Building2,
  Calendar,
  Layers,
  Save,
  Download,
  Upload,
  Lock,
  Unlock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { AssociationProfile, AccountingModel, FiscalYear } from '../types/accounting';
import { StorageService } from '../services/storageService';

interface AssociationSettingsProps {
  profile: AssociationProfile;
  fiscalYears: FiscalYear[];
  onUpdateProfile: (profile: AssociationProfile) => void;
  onUpdateFiscalYears: (years: FiscalYear[]) => void;
  onResetAllData: () => void;
}

export const AssociationSettings: React.FC<AssociationSettingsProps> = ({
  profile,
  fiscalYears,
  onUpdateProfile,
  onUpdateFiscalYears,
  onResetAllData
}) => {
  const [formData, setFormData] = useState<AssociationProfile>({ ...profile });
  const [activeTab, setActiveTab] = useState<'general' | 'modele' | 'exercices' | 'sauvegarde'>('general');
  const [successMessage, setSuccessMessage] = useState('');

  // New fiscal year
  const [newYearCode, setNewYearCode] = useState('2027');

  const handleChange = (field: keyof AssociationProfile, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(formData);
    setSuccessMessage('Paramètres de l\'association enregistrés avec succès.');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleCreateFiscalYear = () => {
    if (fiscalYears.some(y => y.code === newYearCode)) {
      alert('Cet exercice existe déjà.');
      return;
    }

    const newYear: FiscalYear = {
      id: `fy-${newYearCode}`,
      code: newYearCode,
      startDate: `${newYearCode}-01-01`,
      endDate: `${newYearCode}-12-31`,
      isClosed: false
    };

    const updated = [...fiscalYears, newYear];
    onUpdateFiscalYears(updated);
    setFormData(prev => ({ ...prev, activeFiscalYear: newYearCode }));
    onUpdateProfile({ ...formData, activeFiscalYear: newYearCode });
    alert(`Nouvel exercice ${newYearCode} créé et activé.`);
  };

  const toggleCloseFiscalYear = (yearId: string) => {
    const year = fiscalYears.find(y => y.id === yearId);
    if (!year) return;

    if (!year.isClosed) {
      if (window.confirm(`Confirmez-vous la CLÔTURE DÉFINITIVE de l'exercice ${year.code} ? Cette action fige les écritures comptables et génère le résultat définitif.`)) {
        const updated = fiscalYears.map(y => y.id === yearId ? {
          ...y,
          isClosed: true,
          closedDate: new Date().toISOString().split('T')[0]
        } : y);
        onUpdateFiscalYears(updated);
        StorageService.addAuditLog('EXERCICE', `Clôture de l'exercice ${year.code}`);
      }
    } else {
      if (window.confirm(`Voulez-vous réouvrir l'exercice ${year.code} à des fins d'audit exceptionnel ?`)) {
        const updated = fiscalYears.map(y => y.id === yearId ? {
          ...y,
          isClosed: false,
          closedDate: undefined
        } : y);
        onUpdateFiscalYears(updated);
      }
    }
  };

  const handleFileRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!window.confirm('Attention : la restauration remplace les données actuelles de l\'association (et sera enregistrée dans la base en ligne). Continuer ?')) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const ok = StorageService.importDatabaseJSON(content);
        if (ok) {
          alert('Restauration réussie. Les données importées vont être enregistrées dans la base en ligne.');
        } else {
          alert('Le fichier sélectionné n\'est pas un export valide.');
        }
      } catch (err) {
        alert('Erreur lors de la lecture du fichier de sauvegarde.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Title & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-700" />
            Paramétrage de l'Association & Dossier Comptable
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Fiche légale (Dahir 1958), choix du modèle comptable CNC et gestion des exercices
          </p>
        </div>

        {/* Subtabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
          <button
            onClick={() => setActiveTab('general')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
              activeTab === 'general' ? 'bg-blue-700 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Fiche Juridique
          </button>
          <button
            onClick={() => setActiveTab('modele')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
              activeTab === 'modele' ? 'bg-blue-700 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Modèle Comptable CNC
          </button>
          <button
            onClick={() => setActiveTab('exercices')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
              activeTab === 'exercices' ? 'bg-blue-700 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Exercices & Clôture
          </button>
          <button
            onClick={() => setActiveTab('sauvegarde')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
              activeTab === 'sauvegarde' ? 'bg-blue-700 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sauvegarde & Restauration
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold rounded flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Tab 1: Fiche Juridique */}
      {activeTab === 'general' && (
        <form onSubmit={handleSave} className="bg-white rounded-lg border border-slate-300 p-6 shadow-xs space-y-5 text-xs">
          <h3 className="text-sm font-bold text-slate-900 uppercase border-b pb-2 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-700" />
            Identification Administrative & Fiscale de l'Association
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Dénomination en Français *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded font-bold text-slate-900 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Dénomination en Arabe (الاسم بالعربية)</label>
              <input
                type="text"
                dir="rtl"
                value={formData.arabicName}
                onChange={(e) => handleChange('arabicName', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded font-serif text-slate-900 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Sigle / Acronyme</label>
              <input
                type="text"
                value={formData.sigle}
                onChange={(e) => handleChange('sigle', e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Récépissé Dépôt Légal (Dahir 1958) *</label>
              <input
                type="text"
                required
                value={formData.receiptReceiptNumber}
                onChange={(e) => handleChange('receiptReceiptNumber', e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Date de Constitution</label>
              <input
                type="date"
                value={formData.creationDate}
                onChange={(e) => handleChange('creationDate', e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Identifiant Fiscal (IF)</label>
              <input
                type="text"
                value={formData.ifFiscal}
                onChange={(e) => handleChange('ifFiscal', e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Numéro de Patente</label>
              <input
                type="text"
                value={formData.patente}
                onChange={(e) => handleChange('patente', e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Affiliation CNSS</label>
              <input
                type="text"
                value={formData.cnss}
                onChange={(e) => handleChange('cnss', e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Numéro ICE (Si existant)</label>
              <input
                type="text"
                value={formData.ice || ''}
                onChange={(e) => handleChange('ice', e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Adresse du Siège Social *</label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Ville</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => handleChange('city', e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-slate-200">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Président(e) *</label>
              <input
                type="text"
                required
                value={formData.president}
                onChange={(e) => handleChange('president', e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Trésorier(e) *</label>
              <input
                type="text"
                required
                value={formData.treasurer}
                onChange={(e) => handleChange('treasurer', e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Secrétaire Général(e)</label>
              <input
                type="text"
                value={formData.secretary}
                onChange={(e) => handleChange('secretary', e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 rounded bg-blue-700 hover:bg-blue-600 text-white font-bold shadow-xs cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Enregistrer les Modifications</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab 2: Modèle Comptable CNC */}
      {activeTab === 'modele' && (
        <div className="bg-white rounded-lg border border-slate-300 p-6 shadow-xs space-y-6 text-xs">
          <h3 className="text-sm font-bold text-slate-900 uppercase border-b pb-2 flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-700" />
            Choix du Modèle Comptable CNC (Avis n°23 de 2023)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* 1. Modèle normal */}
            <div
              onClick={() => {
                handleChange('accountingModel', 'normal');
                onUpdateProfile({ ...formData, accountingModel: 'normal' });
              }}
              className={`p-5 rounded-lg border-2 transition-all cursor-pointer flex flex-col justify-between ${
                formData.accountingModel === 'normal'
                  ? 'border-blue-700 bg-blue-50/50 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-blue-900 uppercase text-xs">Modèle Normal</span>
                  {formData.accountingModel === 'normal' && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-700 text-white">Actif</span>
                  )}
                </div>
                <h4 className="font-bold text-slate-900 mb-1">Comptabilité d'engagement en partie double</h4>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Modèle complet avec bilan patrimonial (BL), compte de produits et charges (CPC) et les 8 états de l'ETIC. Recommandé pour les associations reconnues d'utilité publique et celles recevant des subventions publiques (INDH, ministères).
                </p>
              </div>
              <div className="mt-4 pt-2 border-t text-[11px] text-slate-500">
                Classes 0 à 7 complètes • Bilan + CPC + ETIC S1-S8
              </div>
            </div>

            {/* 2. Modèle simplifié */}
            <div
              onClick={() => {
                handleChange('accountingModel', 'simplifie');
                onUpdateProfile({ ...formData, accountingModel: 'simplifie' });
              }}
              className={`p-5 rounded-lg border-2 transition-all cursor-pointer flex flex-col justify-between ${
                formData.accountingModel === 'simplifie'
                  ? 'border-emerald-700 bg-emerald-50/50 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-emerald-900 uppercase text-xs">Modèle Simplifié</span>
                  {formData.accountingModel === 'simplifie' && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-700 text-white">Actif</span>
                  )}
                </div>
                <h4 className="font-bold text-slate-900 mb-1">Comptabilité de trésorerie en partie double</h4>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Pour les associations dont les ressources annuelles ne dépassent pas les seuils légaux. Enregistrement chronologique par encaissements/décaissements et centralisation annuelle par balance générale.
                </p>
              </div>
              <div className="mt-4 pt-2 border-t text-[11px] text-slate-500">
                Bilan simplifié + CPC simplifié + ETIC allégé
              </div>
            </div>

            {/* 3. Modèle super-simplifié */}
            <div
              onClick={() => {
                handleChange('accountingModel', 'super_simplifie');
                onUpdateProfile({ ...formData, accountingModel: 'super_simplifie' });
              }}
              className={`p-5 rounded-lg border-2 transition-all cursor-pointer flex flex-col justify-between ${
                formData.accountingModel === 'super_simplifie'
                  ? 'border-amber-700 bg-amber-50/50 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-amber-900 uppercase text-xs">Modèle Super-Simplifié</span>
                  {formData.accountingModel === 'super_simplifie' && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-700 text-white">Actif</span>
                  )}
                </div>
                <h4 className="font-bold text-slate-900 mb-1">Comptabilité de trésorerie en partie simple</h4>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Mesure dérogatoire pour les très petites associations locales. Suivi simplifié recettes/dépenses, état de réalisation du budget et situation de trésorerie sans mécanisme de partie double.
                </p>
              </div>
              <div className="mt-4 pt-2 border-t text-[11px] text-slate-500">
                Budget fonctionnement + Trésorerie + Dettes/Créances
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Exercices Comptables */}
      {activeTab === 'exercices' && (
        <div className="bg-white rounded-lg border border-slate-300 p-6 shadow-xs space-y-6 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-700" />
                Gestion des Exercices Comptables & Clôture Annuelle
              </h3>
              <p className="text-[11px] text-slate-500">
                Séparation hermétique des exercices conformément au principe de spécialisation (CNC Sec. 3.10)
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newYearCode}
                onChange={(e) => setNewYearCode(e.target.value)}
                placeholder="2027"
                className="w-24 px-3 py-1.5 border border-slate-300 rounded font-mono font-bold text-center"
              />
              <button
                type="button"
                onClick={handleCreateFiscalYear}
                className="px-3.5 py-1.5 rounded bg-blue-700 hover:bg-blue-600 text-white font-bold cursor-pointer"
              >
                + Ouvrir un Exercice
              </button>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-900 text-white font-semibold">
                <tr>
                  <th className="p-2.5">Code Exercice</th>
                  <th className="p-2.5">Date Début</th>
                  <th className="p-2.5">Date Fin</th>
                  <th className="p-2.5 text-center">Statut Actif</th>
                  <th className="p-2.5 text-center">Clôture Définitive</th>
                  <th className="p-2.5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {fiscalYears.map((fy) => (
                  <tr key={fy.id} className="hover:bg-slate-50">
                    <td className="p-2.5 font-mono font-bold text-sm text-blue-900">{fy.code}</td>
                    <td className="p-2.5 font-mono text-slate-600">{fy.startDate}</td>
                    <td className="p-2.5 font-mono text-slate-600">{fy.endDate}</td>
                    <td className="p-2.5 text-center">
                      {formData.activeFiscalYear === fy.code ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-900 border border-blue-200">
                          Exercice en Cours
                        </span>
                      ) : (
                        <button
                          onClick={() => {
                            handleChange('activeFiscalYear', fy.code);
                            onUpdateProfile({ ...formData, activeFiscalYear: fy.code });
                          }}
                          className="text-xs text-blue-600 hover:underline cursor-pointer"
                        >
                          Basculer vers cet exercice
                        </button>
                      )}
                    </td>
                    <td className="p-2.5 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        fy.isClosed ? 'bg-slate-100 text-slate-600' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        {fy.isClosed ? `Clôturé (${fy.closedDate})` : 'Ouvert aux écritures'}
                      </span>
                    </td>
                    <td className="p-2.5 text-center">
                      <button
                        type="button"
                        onClick={() => toggleCloseFiscalYear(fy.id)}
                        className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded mx-auto cursor-pointer ${
                          fy.isClosed
                            ? 'bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100'
                            : 'bg-rose-50 text-rose-800 border border-rose-300 hover:bg-rose-100'
                        }`}
                      >
                        {fy.isClosed ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                        <span>{fy.isClosed ? 'Réouvrir' : 'Clôturer'}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Sauvegarde & Restauration */}
      {activeTab === 'sauvegarde' && (
        <div className="bg-white rounded-lg border border-slate-300 p-6 shadow-xs space-y-6 text-xs">
          <h3 className="text-sm font-bold text-slate-900 uppercase border-b pb-2">
            Sauvegarde Intégrale, Export JSON & Réinitialisation
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="p-4 bg-slate-50 border rounded space-y-3">
              <strong className="text-slate-900 font-bold block text-sm">Sauvegarde Complète (Export JSON)</strong>
              <p className="text-slate-600">
                Téléchargez un instantané complet de votre base de données (profil, écritures, plan comptable, recettes, dépenses, membres, subventions, budgets, immobilisations). Ce fichier peut être restauré à tout moment ou archivé hors ligne.
              </p>
              <button
                type="button"
                onClick={() => {
                  const jsonStr = StorageService.exportDatabaseJSON();
                  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = `Backup_Association_Compta_Pro_${new Date().toISOString().split('T')[0]}.json`;
                  link.click();
                  URL.revokeObjectURL(url);
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-700 hover:bg-blue-600 text-white font-bold rounded shadow-xs cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Télécharger la Sauvegarde JSON</span>
              </button>
            </div>

            <div className="p-4 bg-slate-50 border rounded space-y-3">
              <strong className="text-slate-900 font-bold block text-sm">Restauration depuis un fichier JSON</strong>
              <p className="text-slate-600">
                Sélectionnez un fichier de sauvegarde précédemment exporté pour restaurer immédiatement l'intégralité de la comptabilité associative.
              </p>
              <label className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded shadow-xs cursor-pointer w-fit">
                <Upload className="w-4 h-4" />
                <span>Choisir Fichier de Sauvegarde</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileRestore}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-200">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded">
              <strong className="text-slate-800 font-bold block">Réinitialisation des données de démonstration désactivée</strong>
              <span className="text-slate-600 text-[11px]">Cette version est reliée aux données réelles de l’association. La réinjection de données fictives est désactivée pour protéger la comptabilité.</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
