/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Fichier des Adhérents & Suivi des Cotisations pour ASSOCIATION COMPTA PRO
 */

import React, { useState } from 'react';
import {
  Users,
  Plus,
  Printer,
  Download,
  Search,
  CheckCircle2,
  AlertCircle,
  Phone,
  Mail,
  CreditCard,
  UserCheck
} from 'lucide-react';
import { Member, AssociationProfile } from '../types/accounting';
import { AccountingEngine } from '../services/accountingEngine';

interface MembersManagerProps {
  members: Member[];
  profile: AssociationProfile;
  fiscalYear: string;
  onUpdateMembers: (members: Member[]) => void;
  onAddRecetteQuick?: (member: Member) => void;
}

export const MembersManager: React.FC<MembersManagerProps> = ({
  members,
  profile,
  fiscalYear,
  onUpdateMembers,
  onAddRecetteQuick
}) => {
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'a_jour' | 'en_retard'>('all');
  const [selectedMemberForCard, setSelectedMemberForCard] = useState<Member | null>(null);

  // New member form
  const [fullName, setFullName] = useState('');
  const [cin, setCin] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Casablanca');
  const [category, setCategory] = useState<Member['category']>('actif');
  const [annualFee, setAnnualFee] = useState<number>(500);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !cin.trim()) {
      alert('Veuillez renseigner le nom complet et le CIN de l\'adhérent.');
      return;
    }

    const nextNum = `ADH-${fiscalYear}-${String(members.length + 1).padStart(3, '0')}`;
    const newMember: Member = {
      id: `m-${Date.now()}`,
      memberNumber: nextNum,
      fullName: fullName.trim(),
      cin: cin.trim().toUpperCase(),
      phone: phone.trim(),
      email: email.trim(),
      address: address.trim(),
      city: city.trim(),
      joinDate: new Date().toISOString().split('T')[0],
      category,
      annualFee,
      status: 'en_retard',
      totalPaid: 0
    };

    onUpdateMembers([...members, newMember]);
    setShowModal(false);
    setFullName('');
    setCin('');
    setPhone('');
    setEmail('');
  };

  const markPaid = (mId: string) => {
    const updated = members.map(m => {
      if (m.id === mId) {
        return {
          ...m,
          status: 'a_jour' as const,
          totalPaid: m.annualFee,
          lastPaymentDate: new Date().toISOString().split('T')[0]
        };
      }
      return m;
    });
    onUpdateMembers(updated);
  };

  const filteredMembers = members.filter(m => {
    const matchesSearch =
      m.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.memberNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.cin.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || m.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalFeesExpected = members.reduce((s, m) => s + m.annualFee, 0);
  const totalFeesPaid = members.reduce((s, m) => s + m.totalPaid, 0);
  const upToDateCount = members.filter(m => m.status === 'a_jour').length;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Title & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4 no-print">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-700" />
            Fichier des Adhérents & Suivi des Cotisations
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Gestion du sociétariat, émission des cartes numérotées et attestations de cotisation
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded bg-blue-700 hover:bg-blue-600 text-white shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nouvel Adhérent</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 no-print">
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Membres Inscrits</span>
          <div className="text-xl font-bold font-mono-acc text-slate-900 mt-1">
            {members.length} adhérents
          </div>
          <span className="text-[11px] text-slate-500">{upToDateCount} à jour de cotisation</span>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Cotisations Encaissées</span>
          <div className="text-xl font-bold font-mono-acc text-emerald-700 mt-1">
            {AccountingEngine.formatMAD(totalFeesPaid)}
          </div>
          <span className="text-[11px] text-emerald-600 font-medium">Comptabilisées au compte 71711</span>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Reste à Recouvrer</span>
          <div className="text-xl font-bold font-mono-acc text-amber-700 mt-1">
            {AccountingEngine.formatMAD(totalFeesExpected - totalFeesPaid)}
          </div>
          <span className="text-[11px] text-amber-600 font-medium">Cotisations en attente</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs flex flex-wrap items-center gap-3 text-xs no-print">
        <div className="flex-1 min-w-[240px] relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par nom, CIN, N° adhérent..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded font-semibold transition-colors ${
              filterStatus === 'all' ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Tous ({members.length})
          </button>
          <button
            onClick={() => setFilterStatus('a_jour')}
            className={`px-3 py-1.5 rounded font-semibold transition-colors ${
              filterStatus === 'a_jour' ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            À jour ({upToDateCount})
          </button>
          <button
            onClick={() => setFilterStatus('en_retard')}
            className={`px-3 py-1.5 rounded font-semibold transition-colors ${
              filterStatus === 'en_retard' ? 'bg-amber-700 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            En retard ({members.length - upToDateCount})
          </button>
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-white rounded-lg border border-slate-300 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-900 text-white font-semibold">
              <tr>
                <th className="py-2.5 px-3 w-28">N° Adhérent</th>
                <th className="py-2.5 px-4">Nom Complet</th>
                <th className="py-2.5 px-3 w-24">CIN</th>
                <th className="py-2.5 px-3 w-32">Qualité</th>
                <th className="py-2.5 px-3">Contact</th>
                <th className="py-2.5 px-3 text-right w-28">Cotisation</th>
                <th className="py-2.5 px-3 text-center w-28">Statut</th>
                <th className="py-2.5 px-3 text-center w-36">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal">
              {filteredMembers.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 px-3 font-mono font-semibold text-blue-800">
                    {m.memberNumber}
                  </td>
                  <td className="py-2.5 px-4 font-bold text-slate-900">
                    {m.fullName}
                    <span className="block text-[11px] text-slate-400 font-normal">Inscrit le {m.joinDate}</span>
                  </td>
                  <td className="py-2.5 px-3 font-mono font-medium text-slate-700">{m.cin}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-800 capitalize">
                      {m.category}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">
                    <div className="flex items-center gap-1 text-[11px]"><Phone className="w-3 h-3 text-slate-400" /> {m.phone || '-'}</div>
                    <div className="flex items-center gap-1 text-[11px] text-slate-500"><Mail className="w-3 h-3 text-slate-400" /> {m.email || '-'}</div>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono-acc font-semibold text-slate-900">
                    {AccountingEngine.formatMAD(m.annualFee)}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      m.status === 'a_jour'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {m.status === 'a_jour' ? 'À jour' : 'En retard'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {m.status === 'en_retard' ? (
                        <button
                          type="button"
                          onClick={() => markPaid(m.id)}
                          className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded cursor-pointer"
                        >
                          Encaisser
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setSelectedMemberForCard(m)}
                          className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded cursor-pointer"
                        >
                          <CreditCard className="w-3 h-3" />
                          <span>Attestation</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Official Membership Certificate Print Modal */}
      {selectedMemberForCard && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full border border-slate-300 overflow-hidden text-xs">
            <div className="px-5 py-3 bg-slate-900 text-white font-bold flex items-center justify-between no-print">
              <span>Attestation d'Adhésion & Paiement de Cotisation</span>
              <button onClick={() => setSelectedMemberForCard(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="p-6 space-y-4 print:p-0">
              <div className="border-b-2 border-slate-900 pb-3 flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 uppercase">{profile.name}</h3>
                  <p className="text-[11px] text-slate-600">{profile.address}, {profile.city}</p>
                  <p className="text-[10px] text-slate-500">Récépissé : {profile.receiptReceiptNumber} • IF: {profile.ifFiscal}</p>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-blue-800 text-sm block">{selectedMemberForCard.memberNumber}</span>
                  <span className="text-slate-500">Exercice {fiscalYear}</span>
                </div>
              </div>

              <div className="text-center py-2 bg-blue-50 border border-blue-200 rounded font-bold text-blue-900 uppercase">
                ATTESTATION D'ADHÉSION & QUITTANCE DE COTISATION
              </div>

              <div className="space-y-2 text-slate-800 leading-relaxed">
                <p>
                  Le Bureau Exécutif de l'association <strong>{profile.name}</strong> atteste que :
                </p>
                <div className="p-3 bg-slate-50 rounded border border-slate-200 space-y-1">
                  <div><strong>Nom et Prénom :</strong> {selectedMemberForCard.fullName}</div>
                  <div><strong>CIN :</strong> {selectedMemberForCard.cin}</div>
                  <div><strong>Qualité :</strong> Membre {selectedMemberForCard.category}</div>
                  <div><strong>Date d'adhésion :</strong> {selectedMemberForCard.joinDate}</div>
                </div>
                <p>
                  Est en situation régulière au titre de l'exercice <strong>{fiscalYear}</strong> et s'est valablement acquitté de sa cotisation annuelle d'un montant de :
                </p>
                <div className="text-center font-mono text-base font-bold text-emerald-800 bg-emerald-50 py-1.5 rounded border border-emerald-200">
                  {AccountingEngine.formatMAD(selectedMemberForCard.annualFee)}
                </div>
                <p className="text-[10px] text-slate-500 italic mt-3">
                  * Délivré conformément aux statuts de l'association et aux règles d'organisation comptable des organismes à but non lucratif.
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
                onClick={() => setSelectedMemberForCard(null)}
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
                <span>Imprimer Attestation</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Add Member */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full border border-slate-300 overflow-hidden text-xs">
            <div className="px-5 py-3 bg-slate-900 text-white font-bold flex items-center justify-between">
              <span>Ajouter un Nouvel Adhérent</span>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nom et Prénom *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ex: M. Mehdi BENNOUNA"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded font-medium focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">N° CIN *</label>
                  <input
                    type="text"
                    required
                    value={cin}
                    onChange={(e) => setCin(e.target.value)}
                    placeholder="Ex: BE182901"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Qualité</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded bg-white"
                  >
                    <option value="actif">Membre Actif</option>
                    <option value="fondateur">Membre Fondateur</option>
                    <option value="honneur">Membre d'Honneur</option>
                    <option value="bienfaiteur">Membre Bienfaiteur</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Téléphone</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+212 6..."
                    className="w-full px-3 py-1.5 border border-slate-300 rounded"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Cotisation Annuelle (DH)</label>
                  <input
                    type="number"
                    step="50"
                    min="0"
                    value={annualFee}
                    onChange={(e) => setAnnualFee(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 font-mono font-bold text-slate-900 border border-slate-300 rounded"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Adresse Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nom@exemple.ma"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Adresse de résidence & Ville</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Quartier, Rue, Ville..."
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
                  className="px-4 py-1.5 rounded bg-blue-700 hover:bg-blue-600 text-white font-bold shadow-xs cursor-pointer"
                >
                  Enregistrer l'adhérent
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
