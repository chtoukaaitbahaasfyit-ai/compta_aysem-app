/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ASSOCIATION COMPTA PRO - Types comptables et financiers conformes au CNC 2023
 */

export type AccountingModel = 'normal' | 'simplifie' | 'super_simplifie';

export type UserRole = 'pending' | 'admin' | 'president' | 'tresorier' | 'responsable_administratif' | 'comptable' | 'auditeur';

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface AppAuthUser {
  id: string;
  username: string;
  name: string;
  nameArabic: string;
  email: string;
  role: UserRole;
  roleArabic: string;
  avatar?: string;
  passwordHash?: string;
  salt?: string;
  phone?: string;
}

export interface AssociationProfile {
  name: string;
  arabicName: string;
  sigle: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  website?: string;
  ifFiscal: string;     // Identifiant Fiscal
  patente: string;      // Numéro de patente
  cnss: string;         // Numéro d'affiliation CNSS
  ice?: string;         // Identifiant Commun de l'Entreprise
  rib: string;          // Relevé d'Identité Bancaire principal
  bankName: string;     // Nom de la banque principale
  agency: string;       // Agence bancaire
  president: string;    // Nom du Président
  treasurer: string;    // Nom du Trésorier
  secretary: string;    // Secrétaire Général
  logoUrl?: string;
  creationDate: string;
  receiptReceiptNumber: string; // Récépissé de dépôt légal (Dahir 1958)
  accountingModel: AccountingModel;
  activeFiscalYear: string;
  currency: string;
}

export interface FiscalYear {
  id: string;
  code: string;         // Ex: "2026"
  startDate: string;    // "2026-01-01"
  endDate: string;      // "2026-12-31"
  isClosed: boolean;
  closedDate?: string;
}

export interface Account {
  number: string;
  label: string;
  classNumber: number;  // 0, 1, 2, 3, 4, 5, 6, 7
  type: 'actif' | 'passif' | 'charge' | 'produit' | 'special';
  description?: string;
  isSpecificAssociation?: boolean;
}

export type JournalCode = 'AC' | 'VT' | 'BQ' | 'CA' | 'OD';

export interface Journal {
  code: JournalCode;
  name: string;
  type: 'achats' | 'recettes' | 'banque' | 'caisse' | 'od';
  defaultAccount?: string;
}

export interface EntryLine {
  id: string;
  lineNumber: number;
  accountNumber: string;
  accountLabel: string;
  label: string;
  debit: number;
  credit: number;
  thirdParty?: string;    // Adhérent, Fournisseur, Bailleur...
  projectId?: string;     // Code projet rattaché
  lettrage?: string;      // Lettrage pour pointage des comptes
  isReconciled?: boolean; // Rapprochement bancaire
}

export interface AccountingEntry {
  id: string;
  pieceNumber: string;    // Ex: "OD-2026-0001", "BQ-2026-0004"
  journalCode: JournalCode;
  date: string;
  period: string;         // "2026-01"
  fiscalYear: string;     // "2026"
  label: string;
  lines: EntryLine[];
  totalDebit: number;
  totalCredit: number;
  isBalanced: boolean;
  status: 'brouillon' | 'valide' | 'extourne';
  sourceModule: 'general' | 'recette' | 'depense' | 'tresorerie' | 'extourne';
  attachmentName?: string;
  attachmentData?: string; // base64 / preview
  createdAt: string;
  createdBy: string;
  extourneOfPiece?: string;
}

export type RecetteNature = 'cotisation' | 'don' | 'subvention' | 'mecenat' | 'parrainage' | 'vente' | 'autre';
export type PaymentMethod = 'virement' | 'cheque' | 'especes' | 'prelevement' | 'en_nature';

export interface Recette {
  id: string;
  date: string;
  pieceNumber: string;
  receiptNumber: string;  // Ex: "REC-2026-0012"
  nature: RecetteNature;
  memberId?: string;
  payerName: string;
  amount: number;
  paymentMethod: PaymentMethod;
  checkNumber?: string;
  bankAccountId: string;
  projectId?: string;
  accountNumber: string;
  accountingEntryId?: string;
  justificationName?: string;
  notes?: string;
}

export type DepenseCategory = 'achats' | 'fonctionnement' | 'deplacement' | 'prestation' | 'projet' | 'aide_sociale' | 'autre';

export interface Depense {
  id: string;
  date: string;
  pieceNumber: string;
  voucherNumber: string; // Ex: "DEP-2026-0045"
  beneficiary: string;
  category: DepenseCategory;
  amount: number;
  paymentMethod: PaymentMethod;
  checkNumber?: string;
  bankAccountId: string;
  projectId?: string;
  accountNumber: string;
  accountingEntryId?: string;
  justificationName?: string;
  isCompliantWith5000DhRule: boolean; // Alerte si > 5000 DH en espèces (Article CNC / Dahir)
  notes?: string;
}

export interface BankAccount {
  id: string;
  name: string;
  type: 'banque' | 'caisse';
  bankName: string;
  rib: string;
  accountNumber: string; // Compte comptable, ex: 514101 ou 516101
  initialBalance: number;
  currentBalance: number;
  signatories: string[];
}

export interface BankReconciliation {
  id: string;
  bankAccountId: string;
  date: string;
  bankStatementBalance: number;
  bookBalance: number;
  reconciledEntriesIds: string[];
  difference: number;
}

export interface Subvention {
  id: string;
  bailleur: string;
  typeBailleur: 'etat' | 'collectivite' | 'organisme_public' | 'prive' | 'international';
  projectTitle: string;
  conventionNumber: string;
  conventionDate: string;
  conventionDuration: string;
  amountGranted: number;
  amountReceived: number;
  amountCommitted: number;
  amountSpent: number;
  balanceRemaining: number;
  isDedicatedFunds: boolean; // Fonds dédiés (Classe 19)
  dedicatedAccountCode?: string;
  circularPm13Compliance: boolean; // Circulaire PM n°13/2022
  notes?: string;
}

export interface Project {
  id: string;
  code: string;
  title: string;
  description: string;
  responsible: string;
  startDate: string;
  endDate?: string;
  status: 'en_cours' | 'cloture' | 'en_attente';
  budgetPlanned: number;
  budgetSpent: number;
  revenueAllocated: number;
  partner?: string;
}

export interface BudgetItem {
  id: string;
  fiscalYear: string;
  type: 'recette' | 'depense';
  category: string;
  subCategory: string;
  accountNumber: string;
  amountPlanned: number;
  amountRealized: number;
  projectId?: string;
}

export interface Immobilisation {
  id: string;
  code: string;
  label: string;
  category: 'materiel_informatique' | 'mobilier' | 'equipement' | 'vehicule' | 'construction' | 'autre';
  acquisitionDate: string;
  acquisitionValue: number;
  amortisationMethod: 'lineaire' | 'degressif';
  durationYears: number;
  depreciationRate: number; // e.g. 20%
  accumulatedDepreciation: number;
  netBookValue: number;
  location: string;
  state: 'neuf' | 'bon' | 'moyen' | 'usage';
  accountAsset: string;     // Ex: 2351 Matériel de bureau
  accountAmort: string;     // Ex: 2835 Amortissements
  accountDotation: string;  // Ex: 6193 Dotations d'exploitation
}

export interface Member {
  id: string;
  memberNumber: string; // Ex: "ADH-2026-001"
  fullName: string;
  cin: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  joinDate: string;
  category: 'actif' | 'fondateur' | 'honneur' | 'bienfaiteur';
  annualFee: number;
  status: 'a_jour' | 'en_retard';
  lastPaymentDate?: string;
  totalPaid: number;
}

export interface DocumentArchive {
  id: string;
  title: string;
  type: 'facture' | 'recu' | 'bon_commande' | 'convention' | 'releve' | 'pv' | 'autre';
  date: string;
  fileName: string;
  fileSize?: string;
  fileData?: string;
  googleDriveFolder: string;
  linkedPieceNumber?: string;
  description?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  details: string;
  entityType: string;
}

export interface VolunteerWork {
  id: string;
  volunteerName: string;
  type: 'regulier' | 'occasionnel';
  taskDescription: string;
  hoursWorked: number;
  hourlyRateEstimated: number; // En DH pour valorisation Classe 0 (044/054)
  totalValueEstimated: number;
  date: string;
}

export interface InKindContribution {
  id: string;
  nature: 'biens' | 'services' | 'locaux' | 'autre';
  description: string;
  quantity?: number;
  estimatedValue: number; // En DH pour valorisation Classe 0 (041/042/043 vs 051/052)
  providerName: string;
  date: string;
  valuationMethod: string;
}

// -------------------------------------------------------------
// Système de Gestion des Décaissements et Validations (الصرف والموافقات)
// -------------------------------------------------------------

export type DisbursementStatus =
  | 'brouillon'             // مسودة
  | 'en_attente_tresorier'  // في انتظار موافقة أمين المال
  | 'approuve_tresorier'    // تمت موافقة أمين المال
  | 'rejete'                // مرفوض
  | 'a_completer'           // يحتاج إلى استكمال المعلومات
  | 'en_attente_president'  // في انتظار التنفيذ من الرئيس
  | 'execute'               // تم الصرف
  | 'annule';               // ملغى

export interface DisbursementAttachment {
  id: string;
  name: string;
  type: string;
  size: string;
  dataUrl?: string;
  uploadedAt: string;
}

export interface DisbursementHistoryItem {
  id: string;
  timestamp: string;
  status: DisbursementStatus;
  action: string;
  actionArabic: string;
  userName: string;
  userRole: UserRole | string;
  notes?: string;
}

export interface DisbursementOrder {
  id: string;
  orderNumber: string;               // Ex: "ORD-2026-0001"
  date: string;                      // YYYY-MM-DD
  fiscalYear: string;                // "2026"
  beneficiary: string;               // اسم المستفيد
  cinOrIce?: string;                 // ب.ت.و أو المعرف الموحد للمقاولة
  subject: string;                   // موضوع الصرف / الغرض
  amount: number;                    // المبلغ بالأرقام
  amountInWords: string;             // المبلغ بالحروف
  projectId?: string;                // المشروع أو النشاط المرتبط
  projectTitle?: string;
  budgetItemId?: string;             // بند الميزانية
  budgetItemCategory?: string;
  accountNumber: string;             // حساب المصاريف المعني (مثال: 6128, 6131)
  proposedPaymentMethod: 'especes' | 'cheque' | 'virement';
  notesAdministrative?: string;      // ملاحظات المسؤول الإداري
  attachments: DisbursementAttachment[];
  status: DisbursementStatus;

  // Création administrative
  createdById: string;
  createdByRole: string;
  createdByName: string;
  createdAt: string;

  // Revue par le Trésorier
  treasurerReviewDate?: string;
  treasurerId?: string;
  treasurerName?: string;
  treasurerDecision?: 'approuve' | 'rejete' | 'a_completer';
  treasurerNotes?: string;

  // Ordonnancement & Exécution par le Président
  executionDate?: string;
  presidentId?: string;
  presidentName?: string;
  actualPaymentMethod?: 'especes' | 'cheque' | 'virement';
  bankAccountId?: string;
  bankAccountName?: string;
  checkNumber?: string;              // رقم الشيك
  transferReference?: string;        // مرجع التحويل
  paymentProofName?: string;
  paymentProofData?: string;

  // Lien et verrouillage comptable strict (منع التكرار المحاسبي)
  isExecutedAccounting: boolean;
  accountingEntryId?: string;
  accountingPieceNumber?: string;

  // Historique et traçabilité inaltérable
  history: DisbursementHistoryItem[];
  updatedAt: string;
}
