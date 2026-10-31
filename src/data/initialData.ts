/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Données initiales authentiques pour ASSOCIATION COMPTA PRO
 */

import {
  AssociationProfile,
  FiscalYear,
  BankAccount,
  Member,
  Project,
  Subvention,
  AccountingEntry,
  Recette,
  Depense,
  Immobilisation,
  BudgetItem,
  DocumentArchive,
  VolunteerWork,
  InKindContribution
} from '../types/accounting';

export const INITIAL_ASSOCIATION_PROFILE: AssociationProfile = {
  name: 'ASSOCIATION JEUNESSE DE DEMAIN POUR LE DÉVELOPPEMENT ET LA COOPÉRATION',
  arabicName: 'جمعية شباب الغد للتنمية والتعاون',
  sigle: 'AJDDC',
  address: '45, Boulevard Zerktouni, 3ème étage, N° 7',
  city: 'Casablanca',
  phone: '+212 5 22 45 89 12',
  email: 'contact@chabab-elghad.ma',
  website: 'https://chabab-elghad.ma',
  ifFiscal: '40285192',
  patente: '34109825',
  cnss: '8192837',
  ice: '002938174000092',
  rib: '007 780 0001234567890123 45',
  bankName: 'Attijariwafa Bank - Agence Zerktouni',
  agency: 'Agence Zerktouni Casablanca',
  president: 'Dr. Youssef EL MANSOURI',
  treasurer: 'Fatima-Zahra EL AMRANI',
  secretary: 'Tariq EL IDRISSI',
  creationDate: '2016-04-15',
  receiptReceiptNumber: 'Dépôt légal Préfecture Casa n° 1482/2016',
  accountingModel: 'normal',
  activeFiscalYear: '2026',
  currency: 'MAD'
};

export const INITIAL_FISCAL_YEARS: FiscalYear[] = [
  { id: 'fy-2026', code: '2026', startDate: '2026-01-01', endDate: '2026-12-31', isClosed: false },
  { id: 'fy-2025', code: '2025', startDate: '2025-01-01', endDate: '2025-12-31', isClosed: true, closedDate: '2026-03-15' }
];

export const INITIAL_BANK_ACCOUNTS: BankAccount[] = [
  {
    id: 'ba-01',
    name: 'Compte Principal Attijariwafa',
    type: 'banque',
    bankName: 'Attijariwafa Bank',
    rib: '007 780 0001234567890123 45',
    accountNumber: '514101',
    initialBalance: 95000,
    currentBalance: 148500,
    signatories: ['Dr. Karim EL AMRANI (Président)', 'Mme Amina BENJELLOUN (Trésorière)']
  },
  {
    id: 'ba-02',
    name: 'Compte Projets & Subventions (Banque Populaire)',
    type: 'banque',
    bankName: 'Banque Populaire',
    rib: '181 810 2111198765432100 89',
    accountNumber: '514102',
    initialBalance: 50000,
    currentBalance: 82000,
    signatories: ['Dr. Karim EL AMRANI', 'Mme Amina BENJELLOUN']
  },
  {
    id: 'ba-03',
    name: 'Caisse Principale (Siège)',
    type: 'caisse',
    bankName: 'Caisse Siège Casablanca',
    rib: 'Caisse physique',
    accountNumber: '516101',
    initialBalance: 3500,
    currentBalance: 6250,
    signatories: ['Mme Amina BENJELLOUN (Trésorière)']
  }
];

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'prj-01',
    code: 'PRJ-SANTE',
    title: 'Caravanes Médicales & Dépistage Rural (Moyen Atlas)',
    description: 'Campagne de consultations pédiatriques, ophtalmologiques et dons de médicaments aux villages isolés.',
    responsible: 'Dr. Karim EL AMRANI',
    startDate: '2026-01-10',
    endDate: '2026-10-30',
    status: 'en_cours',
    budgetPlanned: 120000,
    budgetSpent: 48500,
    revenueAllocated: 120000,
    partner: 'Ministère de la Santé & INDH'
  },
  {
    id: 'prj-02',
    code: 'PRJ-EDU',
    title: 'Équipement Numérique & Soutien Scolaire Écoles Communautaires',
    description: 'Fourniture de tablettes reconditionnées et ateliers de soutien aux collégiens en milieu périurbain.',
    responsible: 'M. Youssef TAZI',
    startDate: '2026-02-01',
    endDate: '2026-12-15',
    status: 'en_cours',
    budgetPlanned: 85000,
    budgetSpent: 26400,
    revenueAllocated: 85000,
    partner: 'Fondation OCP & Conseil Régional'
  }
];

export const INITIAL_SUBVENTIONS: Subvention[] = [
  {
    id: 'sub-01',
    bailleur: 'INDH - Préfecture Casablanca-Anfa',
    typeBailleur: 'collectivite',
    projectTitle: 'Caravanes Médicales & Dépistage Rural (Moyen Atlas)',
    conventionNumber: 'INDH-CAS-2026/084',
    conventionDate: '2026-01-15',
    conventionDuration: '12 mois',
    amountGranted: 90000,
    amountReceived: 60000,
    amountCommitted: 48500,
    amountSpent: 48500,
    balanceRemaining: 11500,
    isDedicatedFunds: true,
    dedicatedAccountCode: '1941',
    circularPm13Compliance: true,
    notes: 'Conforme à la circulaire du Chef de Gouvernement n°13/2022'
  },
  {
    id: 'sub-02',
    bailleur: 'Ministère de la Solidarité, Insertion Sociale et Famille',
    typeBailleur: 'etat',
    projectTitle: 'Équipement Numérique & Soutien Scolaire',
    conventionNumber: 'MSISF-PROG-2025/33',
    conventionDate: '2025-11-20',
    conventionDuration: '14 mois',
    amountGranted: 75000,
    amountReceived: 50000,
    amountCommitted: 26400,
    amountSpent: 26400,
    balanceRemaining: 23600,
    isDedicatedFunds: true,
    dedicatedAccountCode: '1941',
    circularPm13Compliance: true
  }
];

export const INITIAL_MEMBERS: Member[] = [
  {
    id: 'm-01',
    memberNumber: 'ADH-2026-001',
    fullName: 'Dr. Karim EL AMRANI',
    cin: 'BE124890',
    phone: '+212 6 61 23 45 67',
    email: 'k.elamrani@gmail.com',
    address: '12, Rue d\'Ifrane, Gauthier',
    city: 'Casablanca',
    joinDate: '2016-04-15',
    category: 'fondateur',
    annualFee: 1000,
    status: 'a_jour',
    lastPaymentDate: '2026-01-05',
    totalPaid: 1000
  },
  {
    id: 'm-02',
    memberNumber: 'ADH-2026-002',
    fullName: 'Mme Amina BENJELLOUN',
    cin: 'BK340912',
    phone: '+212 6 62 89 12 34',
    email: 'a.benjelloun@yahoo.fr',
    address: '88, Bd Bir Anzarane',
    city: 'Casablanca',
    joinDate: '2016-04-15',
    category: 'fondateur',
    annualFee: 1000,
    status: 'a_jour',
    lastPaymentDate: '2026-01-08',
    totalPaid: 1000
  },
  {
    id: 'm-03',
    memberNumber: 'ADH-2026-003',
    fullName: 'M. Youssef TAZI',
    cin: 'CD567890',
    phone: '+212 6 63 45 67 89',
    email: 'youssef.tazi@hotmail.com',
    address: '15, Rue Ibn Battouta',
    city: 'Casablanca',
    joinDate: '2017-09-10',
    category: 'actif',
    annualFee: 500,
    status: 'a_jour',
    lastPaymentDate: '2026-01-12',
    totalPaid: 500
  },
  {
    id: 'm-04',
    memberNumber: 'ADH-2026-004',
    fullName: 'Dr. Fatima-Zahra CHERKAOUI',
    cin: 'AA890123',
    phone: '+212 6 64 11 22 33',
    email: 'fz.cherkaoui@ch-casa.ma',
    address: '24, Avenue 2 Mars',
    city: 'Casablanca',
    joinDate: '2019-02-01',
    category: 'actif',
    annualFee: 500,
    status: 'a_jour',
    lastPaymentDate: '2026-02-02',
    totalPaid: 500
  },
  {
    id: 'm-05',
    memberNumber: 'ADH-2026-005',
    fullName: 'M. Mehdi ALAOUI',
    cin: 'AB678901',
    phone: '+212 6 65 77 88 99',
    email: 'mehdi.alaoui@gmail.com',
    address: '10, Bd d\'Anfa',
    city: 'Casablanca',
    joinDate: '2022-05-18',
    category: 'actif',
    annualFee: 500,
    status: 'en_retard',
    lastPaymentDate: '2025-01-15',
    totalPaid: 0
  },
  {
    id: 'm-06',
    memberNumber: 'ADH-2026-006',
    fullName: 'Société Marocaine de Mécénat (Représentée par M. Slaoui)',
    cin: 'ICE00182740',
    phone: '+212 5 22 99 00 11',
    email: 'contact@mecenat-maroc.ma',
    address: 'Tour CFC, Casablanca Finance City',
    city: 'Casablanca',
    joinDate: '2021-01-10',
    category: 'bienfaiteur',
    annualFee: 10000,
    status: 'a_jour',
    lastPaymentDate: '2026-01-20',
    totalPaid: 10000
  }
];

export const INITIAL_IMMOBILISATIONS: Immobilisation[] = [
  {
    id: 'imm-01',
    code: 'IMM-INF-01',
    label: '3x Ordinateurs Portables Lenovo ThinkPad (Gestion administrative)',
    category: 'materiel_informatique',
    acquisitionDate: '2024-03-10',
    acquisitionValue: 24000,
    amortisationMethod: 'lineaire',
    durationYears: 3,
    depreciationRate: 33.33,
    accumulatedDepreciation: 16000,
    netBookValue: 8000,
    location: 'Secrétariat Siège Casablanca',
    state: 'bon',
    accountAsset: '2352',
    accountAmort: '2835',
    accountDotation: '6193'
  },
  {
    id: 'imm-02',
    code: 'IMM-BUR-02',
    label: 'Mobilier de bureau, tables de réunion et armoires métalliques',
    category: 'mobilier',
    acquisitionDate: '2023-01-15',
    acquisitionValue: 18500,
    amortisationMethod: 'lineaire',
    durationYears: 5,
    depreciationRate: 20.0,
    accumulatedDepreciation: 11100,
    netBookValue: 7400,
    location: 'Salle de réunion Siège',
    state: 'bon',
    accountAsset: '2351',
    accountAmort: '2835',
    accountDotation: '6193'
  },
  {
    id: 'imm-03',
    code: 'IMM-MED-03',
    label: 'Matériel médical mobile (Électrocardiographe & glucomètres)',
    category: 'equipement',
    acquisitionDate: '2025-05-20',
    acquisitionValue: 32000,
    amortisationMethod: 'lineaire',
    durationYears: 5,
    depreciationRate: 20.0,
    accumulatedDepreciation: 4267,
    netBookValue: 27733,
    location: 'Dépôt Matériel Médical Caravanes',
    state: 'neuf',
    accountAsset: '2332',
    accountAmort: '2832',
    accountDotation: '6193'
  }
];

export const INITIAL_ENTRIES: AccountingEntry[] = [
  {
    id: 'ent-01',
    pieceNumber: 'OD-2026-0001',
    journalCode: 'OD',
    date: '2026-01-01',
    period: '2026-01',
    fiscalYear: '2026',
    label: 'Reprise des soldes à nouveau au 01/01/2026',
    totalDebit: 185000,
    totalCredit: 185000,
    isBalanced: true,
    status: 'valide',
    sourceModule: 'general',
    createdAt: '2026-01-01 09:00',
    createdBy: 'Mme Amina BENJELLOUN',
    lines: [
      { id: 'l-01-1', lineNumber: 1, accountNumber: '514101', accountLabel: 'Banque Attijariwafa Bank', label: 'Solde initial banque', debit: 95000, credit: 0 },
      { id: 'l-01-2', lineNumber: 2, accountNumber: '514102', accountLabel: 'Banque Populaire (Projets)', label: 'Solde initial compte projets', debit: 50000, credit: 0 },
      { id: 'l-01-3', lineNumber: 3, accountNumber: '516101', accountLabel: 'Caisse Principale (Siège)', label: 'Solde initial caisse', debit: 3500, credit: 0 },
      { id: 'l-01-4', lineNumber: 4, accountNumber: '2352', accountLabel: 'Matériel informatique', label: 'Parc informatique', debit: 24000, credit: 0 },
      { id: 'l-01-5', lineNumber: 5, accountNumber: '2351', accountLabel: 'Mobilier de bureau', label: 'Mobilier associatif', debit: 18500, credit: 0 },
      { id: 'l-01-6', lineNumber: 6, accountNumber: '2835', accountLabel: 'Amortissements du mobilier et matériel', label: 'Amortissements cumulés', debit: 0, credit: 27100 },
      { id: 'l-01-7', lineNumber: 7, accountNumber: '1114', accountLabel: 'Apports sans droit de reprise', label: 'Fonds propres associatifs', debit: 0, credit: 120000 },
      { id: 'l-01-8', lineNumber: 8, accountNumber: '1181', accountLabel: 'Excédent net en instance d\'affectation', label: 'Excédent 2025 reporté', debit: 0, credit: 37900 }
    ]
  },
  {
    id: 'ent-02',
    pieceNumber: 'BQ-2026-0001',
    journalCode: 'BQ',
    date: '2026-01-15',
    period: '2026-01',
    fiscalYear: '2026',
    label: 'Encaissement 1ère tranche Subvention INDH Caravane Médicale',
    totalDebit: 60000,
    totalCredit: 60000,
    isBalanced: true,
    status: 'valide',
    sourceModule: 'recette',
    createdAt: '2026-01-15 11:30',
    createdBy: 'Mme Amina BENJELLOUN',
    lines: [
      { id: 'l-02-1', lineNumber: 1, accountNumber: '514101', accountLabel: 'Banque Attijariwafa Bank', label: 'Virement reçu INDH Préfecture', debit: 60000, credit: 0, thirdParty: 'INDH', projectId: 'prj-01' },
      { id: 'l-02-2', lineNumber: 2, accountNumber: '7161', accountLabel: 'Subventions d\'exploitation de l\'exercice', label: 'Subvention INDH 2026', debit: 0, credit: 60000, thirdParty: 'INDH', projectId: 'prj-01' }
    ]
  },
  {
    id: 'ent-03',
    pieceNumber: 'VT-2026-0001',
    journalCode: 'VT',
    date: '2026-01-20',
    period: '2026-01',
    fiscalYear: '2026',
    label: 'Encaissement don mécénat Société Marocaine de Mécénat',
    totalDebit: 10000,
    totalCredit: 10000,
    isBalanced: true,
    status: 'valide',
    sourceModule: 'recette',
    createdAt: '2026-01-20 14:00',
    createdBy: 'Dr. Karim EL AMRANI',
    lines: [
      { id: 'l-03-1', lineNumber: 1, accountNumber: '514101', accountLabel: 'Banque Attijariwafa Bank', label: 'Chèque n° 884719 Mécénat', debit: 10000, credit: 0, thirdParty: 'Mécène SMM' },
      { id: 'l-03-2', lineNumber: 2, accountNumber: '71832', accountLabel: 'Mécénats d\'entreprises', label: 'Soutien mécénat 2026', debit: 0, credit: 10000, thirdParty: 'Mécène SMM' }
    ]
  },
  {
    id: 'ent-04',
    pieceNumber: 'AC-2026-0001',
    journalCode: 'AC',
    date: '2026-01-28',
    period: '2026-01',
    fiscalYear: '2026',
    label: 'Achat consommables médicaux et pansements pour caravane',
    totalDebit: 14500,
    totalCredit: 14500,
    isBalanced: true,
    status: 'valide',
    sourceModule: 'depense',
    createdAt: '2026-01-28 16:15',
    createdBy: 'Mme Amina BENJELLOUN',
    lines: [
      { id: 'l-04-1', lineNumber: 1, accountNumber: '6128', accountLabel: 'Fournitures pour ateliers, actions sociales et projets', label: 'Pharmacie Centrale Casa - Facture F-9912', debit: 14500, credit: 0, thirdParty: 'Pharmacie Centrale', projectId: 'prj-01' },
      { id: 'l-04-2', lineNumber: 2, accountNumber: '4411', accountLabel: 'Fournisseurs', label: 'Fournisseur Pharmacie Centrale', debit: 0, credit: 14500, thirdParty: 'Pharmacie Centrale', projectId: 'prj-01' }
    ]
  },
  {
    id: 'ent-05',
    pieceNumber: 'BQ-2026-0002',
    journalCode: 'BQ',
    date: '2026-01-30',
    period: '2026-01',
    fiscalYear: '2026',
    label: 'Règlement par virement facture Pharmacie Centrale',
    totalDebit: 14500,
    totalCredit: 14500,
    isBalanced: true,
    status: 'valide',
    sourceModule: 'tresorerie',
    createdAt: '2026-01-30 10:00',
    createdBy: 'Mme Amina BENJELLOUN',
    lines: [
      { id: 'l-05-1', lineNumber: 1, accountNumber: '4411', accountLabel: 'Fournisseurs', label: 'Règlement Facture F-9912', debit: 14500, credit: 0, thirdParty: 'Pharmacie Centrale' },
      { id: 'l-05-2', lineNumber: 2, accountNumber: '514101', accountLabel: 'Banque Attijariwafa Bank', label: 'Ordre de virement n° VIR-26-001', debit: 0, credit: 14500, thirdParty: 'Pharmacie Centrale' }
    ]
  },
  {
    id: 'ent-06',
    pieceNumber: 'CA-2026-0001',
    journalCode: 'CA',
    date: '2026-02-05',
    period: '2026-02',
    fiscalYear: '2026',
    label: 'Encaissement cotisations en espèces (Adhérents 001 à 004)',
    totalDebit: 3000,
    totalCredit: 3000,
    isBalanced: true,
    status: 'valide',
    sourceModule: 'recette',
    createdAt: '2026-02-05 11:00',
    createdBy: 'M. Youssef TAZI',
    lines: [
      { id: 'l-06-1', lineNumber: 1, accountNumber: '516101', accountLabel: 'Caisse Principale (Siège)', label: 'Encaissement cotisations 2026', debit: 3000, credit: 0 },
      { id: 'l-06-2', lineNumber: 2, accountNumber: '71711', accountLabel: 'Cotisations sans contrepartie', label: 'Cotisations annuelles reçues', debit: 0, credit: 3000 }
    ]
  },
  {
    id: 'ent-07',
    pieceNumber: 'CA-2026-0002',
    journalCode: 'CA',
    date: '2026-02-10',
    period: '2026-02',
    fiscalYear: '2026',
    label: 'Menues dépenses fournitures de bureau et timbres poste',
    totalDebit: 450,
    totalCredit: 450,
    isBalanced: true,
    status: 'valide',
    sourceModule: 'depense',
    createdAt: '2026-02-10 15:30',
    createdBy: 'Mme Amina BENJELLOUN',
    lines: [
      { id: 'l-07-1', lineNumber: 1, accountNumber: '6125', accountLabel: 'Fournitures de bureau et documentation', label: 'Papeterie Gauthier - Reçu 310', debit: 250, credit: 0 },
      { id: 'l-07-2', lineNumber: 2, accountNumber: '6142', accountLabel: 'Frais postaux et télécommunications', label: 'Barid Al-Maghrib - Timbres courriers officiels', debit: 200, credit: 0 },
      { id: 'l-07-3', lineNumber: 3, accountNumber: '516101', accountLabel: 'Caisse Principale (Siège)', label: 'Décaissement caisse menues dépenses', debit: 0, credit: 450 }
    ]
  },
  {
    id: 'ent-08',
    pieceNumber: 'OD-2026-0002',
    journalCode: 'OD',
    date: '2026-02-15',
    period: '2026-02',
    fiscalYear: '2026',
    label: 'Valorisation des contributions volontaires en nature (Classe 0 - Bénévolat médical)',
    totalDebit: 18000,
    totalCredit: 18000,
    isBalanced: true,
    status: 'valide',
    sourceModule: 'general',
    createdAt: '2026-02-15 17:00',
    createdBy: 'Dr. Karim EL AMRANI',
    lines: [
      { id: 'l-08-1', lineNumber: 1, accountNumber: '044', accountLabel: 'Personnel bénévole', label: '60h de consultations médicales bénévoles (300 DH/h)', debit: 18000, credit: 0, projectId: 'prj-01' },
      { id: 'l-08-2', lineNumber: 2, accountNumber: '054', accountLabel: 'Contributions volontaires en nature - Bénévolat', label: 'Valorisation temps bénévole médecins', debit: 0, credit: 18000, projectId: 'prj-01' }
    ]
  }
];

export const INITIAL_RECETTES: Recette[] = [
  {
    id: 'rec-01',
    date: '2026-01-15',
    pieceNumber: 'BQ-2026-0001',
    receiptNumber: 'SUB-2026-001',
    nature: 'subvention',
    payerName: 'INDH Préfecture Casa-Anfa',
    amount: 60000,
    paymentMethod: 'virement',
    bankAccountId: 'ba-01',
    projectId: 'prj-01',
    accountNumber: '7161',
    accountingEntryId: 'ent-02',
    justificationName: 'Notification_Arrete_INDH_2026.pdf',
    notes: '1ère tranche sur convention INDH-CAS-2026/084'
  },
  {
    id: 'rec-02',
    date: '2026-01-20',
    pieceNumber: 'VT-2026-0001',
    receiptNumber: 'DON-2026-001',
    nature: 'mecenat',
    payerName: 'Société Marocaine de Mécénat',
    amount: 10000,
    paymentMethod: 'cheque',
    checkNumber: 'CHQ-884719',
    bankAccountId: 'ba-01',
    accountNumber: '71832',
    accountingEntryId: 'ent-03',
    justificationName: 'Convention_Mecenat_SMM_2026.pdf',
    notes: 'Reçu de mécénat délivré selon la réglementation fiscale marocaine'
  },
  {
    id: 'rec-03',
    date: '2026-02-05',
    pieceNumber: 'CA-2026-0001',
    receiptNumber: 'COT-2026-001',
    nature: 'cotisation',
    payerName: 'Cotisations groupées (4 membres fondateurs)',
    amount: 3000,
    paymentMethod: 'especes',
    bankAccountId: 'ba-03',
    accountNumber: '71711',
    accountingEntryId: 'ent-06',
    justificationName: 'Bordereau_Reçus_Cotisations_1_a_4.pdf',
    notes: 'Cotisations 2026'
  }
];

export const INITIAL_DEPENSES: Depense[] = [
  {
    id: 'dep-01',
    date: '2026-01-28',
    pieceNumber: 'AC-2026-0001',
    voucherNumber: 'DEP-2026-001',
    beneficiary: 'Pharmacie Centrale de Casablanca',
    category: 'projet',
    amount: 14500,
    paymentMethod: 'virement',
    bankAccountId: 'ba-01',
    projectId: 'prj-01',
    accountNumber: '6128',
    accountingEntryId: 'ent-04',
    justificationName: 'Facture_Pharmacie_Centrale_F9912.pdf',
    isCompliantWith5000DhRule: true,
    notes: 'Médicaments et compresses stériles pour caravane'
  },
  {
    id: 'dep-02',
    date: '2026-02-10',
    pieceNumber: 'CA-2026-0002',
    voucherNumber: 'DEP-2026-002',
    beneficiary: 'Papeterie Gauthier & Poste Maroc',
    category: 'fonctionnement',
    amount: 450,
    paymentMethod: 'especes',
    bankAccountId: 'ba-03',
    accountNumber: '6125',
    accountingEntryId: 'ent-07',
    justificationName: 'Tickets_Caisse_Fournitures_Timbres.pdf',
    isCompliantWith5000DhRule: true,
    notes: 'Menue dépense inférieure à 5000 DH'
  }
];

export const INITIAL_BUDGET_ITEMS: BudgetItem[] = [
  // Recettes prévues
  { id: 'b-r-1', fiscalYear: '2026', type: 'recette', category: 'Subventions publiques', subCategory: 'INDH & Ministères', accountNumber: '7161', amountPlanned: 165000, amountRealized: 60000 },
  { id: 'b-r-2', fiscalYear: '2026', type: 'recette', category: 'Cotisations des membres', subCategory: 'Cotisations annuelles', accountNumber: '71711', amountPlanned: 18000, amountRealized: 3000 },
  { id: 'b-r-3', fiscalYear: '2026', type: 'recette', category: 'Mécénat & Dons privés', subCategory: 'Entreprises et particuliers', accountNumber: '71832', amountPlanned: 35000, amountRealized: 10000 },
  { id: 'b-r-4', fiscalYear: '2026', type: 'recette', category: 'Ressources générosité publique', subCategory: 'Campagnes d\'appels aux dons', accountNumber: '71831', amountPlanned: 20000, amountRealized: 0 },
  // Dépenses prévues
  { id: 'b-d-1', fiscalYear: '2026', type: 'depense', category: 'Actions & Projets sociaux', subCategory: 'Caravanes médicales', accountNumber: '6128', amountPlanned: 120000, amountRealized: 48500, projectId: 'prj-01' },
  { id: 'b-d-2', fiscalYear: '2026', type: 'depense', category: 'Actions Éducation', subCategory: 'Équipements et ateliers', accountNumber: '6128', amountPlanned: 85000, amountRealized: 26400, projectId: 'prj-02' },
  { id: 'b-d-3', fiscalYear: '2026', type: 'depense', category: 'Frais de fonctionnement', subCategory: 'Locaux, assurances, papeterie', accountNumber: '6131', amountPlanned: 18000, amountRealized: 450 },
  { id: 'b-d-4', fiscalYear: '2026', type: 'depense', category: 'Déplacements & missions', subCategory: 'Frais transport bénévoles', accountNumber: '6141', amountPlanned: 15000, amountRealized: 0 }
];

export const INITIAL_DOCUMENTS: DocumentArchive[] = [
  {
    id: 'doc-01',
    title: 'Convention de partenariat INDH n° 084/2026',
    type: 'convention',
    date: '2026-01-15',
    fileName: 'Convention_INDH_2026.pdf',
    fileSize: '1.4 MB',
    googleDriveFolder: 'Drive / Association / Conventions / 2026',
    linkedPieceNumber: 'BQ-2026-0001',
    description: 'Convention officielle signée avec M. le Gouverneur de la Préfecture'
  },
  {
    id: 'doc-02',
    title: 'Facture F-9912 Pharmacie Centrale (Achats Médicaments Caravane)',
    type: 'facture',
    date: '2026-01-28',
    fileName: 'Facture_Pharmacie_Centrale_F9912.pdf',
    fileSize: '420 KB',
    googleDriveFolder: 'Drive / Association / Factures Fournisseurs / 2026',
    linkedPieceNumber: 'AC-2026-0001',
    description: 'Facture avec bon de livraison conforme et cachet acquitté'
  },
  {
    id: 'doc-03',
    title: 'Reçu de don / Mécénat délivré à la Société Marocaine de Mécénat',
    type: 'recu',
    date: '2026-01-20',
    fileName: 'Recu_Fiscal_Mecenat_SMM_2026.pdf',
    fileSize: '280 KB',
    googleDriveFolder: 'Drive / Association / Reçus de dons / 2026',
    linkedPieceNumber: 'VT-2026-0001',
    description: 'Reçu officiel numéroté pour déductibilité fiscale'
  },
  {
    id: 'doc-04',
    title: 'Procès-Verbal de l\'Assemblée Générale Ordinaire 2025',
    type: 'pv',
    date: '2025-12-20',
    fileName: 'PV_Assemblee_Generale_Ordinaire_2025.pdf',
    fileSize: '2.1 MB',
    googleDriveFolder: 'Drive / Association / Administration & PV',
    description: 'Approbation des rapports moral et financier et quitus au bureau'
  }
];

export const INITIAL_VOLUNTEERS: VolunteerWork[] = [
  {
    id: 'vol-01',
    volunteerName: 'Dr. Karim EL AMRANI',
    type: 'regulier',
    taskDescription: 'Consultations de médecine générale et coordination des caravanes',
    hoursWorked: 40,
    hourlyRateEstimated: 300,
    totalValueEstimated: 12000,
    date: '2026-02-15'
  },
  {
    id: 'vol-02',
    volunteerName: 'Dr. Fatima-Zahra CHERKAOUI',
    type: 'occasionnel',
    taskDescription: 'Dépistage ophtalmologique pédiatrique en milieu rural',
    hoursWorked: 20,
    hourlyRateEstimated: 300,
    totalValueEstimated: 6000,
    date: '2026-02-15'
  }
];

export const INITIAL_IN_KIND: InKindContribution[] = [
  {
    id: 'ink-01',
    nature: 'biens',
    description: 'Don de 150 kits scolaires complets (cartables, cahiers, trousses)',
    quantity: 150,
    estimatedValue: 22500,
    providerName: 'Fondation Éducation & Avenir',
    date: '2026-02-01',
    valuationMethod: 'Prix de gros unitaire moyen du marché (150 DH / kit)'
  },
  {
    id: 'ink-02',
    nature: 'locaux',
    description: 'Mise à disposition gratuite d\'une salle de formation 3 samedis par mois',
    estimatedValue: 9000,
    providerName: 'Centre Culturel Toubkal',
    date: '2026-01-10',
    valuationMethod: 'Valeur locative de référence'
  }
];
