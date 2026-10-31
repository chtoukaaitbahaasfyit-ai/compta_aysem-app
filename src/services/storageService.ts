/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Service de persistance locale et de gestion des données ASSOCIATION COMPTA PRO
 */

import {
  AssociationProfile,
  FiscalYear,
  Account,
  AccountingEntry,
  Recette,
  Depense,
  BankAccount,
  Subvention,
  Project,
  BudgetItem,
  Immobilisation,
  Member,
  DocumentArchive,
  VolunteerWork,
  InKindContribution,
  AuditLog,
  DisbursementOrder
} from '../types/accounting';
import { MOROCCAN_ASSOCIATION_ACCOUNTS } from '../data/moroccanChartOfAccounts';
import {
  INITIAL_ASSOCIATION_PROFILE,
  INITIAL_FISCAL_YEARS,
  INITIAL_BANK_ACCOUNTS,
  INITIAL_PROJECTS,
  INITIAL_SUBVENTIONS,
  INITIAL_MEMBERS,
  INITIAL_IMMOBILISATIONS,
  INITIAL_ENTRIES,
  INITIAL_RECETTES,
  INITIAL_DEPENSES,
  INITIAL_BUDGET_ITEMS,
  INITIAL_DOCUMENTS,
  INITIAL_VOLUNTEERS,
  INITIAL_IN_KIND
} from '../data/initialData';
import { INITIAL_DISBURSEMENTS } from '../data/initialDisbursements';
import { CloudDataService } from './cloudDataService';

const STORAGE_KEYS = {
  PROFILE: 'acp_association_profile',
  FISCAL_YEARS: 'acp_fiscal_years',
  ACCOUNTS: 'acp_chart_of_accounts',
  ENTRIES: 'acp_accounting_entries',
  RECETTES: 'acp_recettes',
  DEPENSES: 'acp_depenses',
  DISBURSEMENTS: 'acp_disbursements_v2',
  BANK_ACCOUNTS: 'acp_bank_accounts',
  SUBVENTIONS: 'acp_subventions',
  PROJECTS: 'acp_projects',
  BUDGETS: 'acp_budgets',
  IMMOBILISATIONS: 'acp_immobilisations',
  MEMBERS: 'acp_members',
  DOCUMENTS: 'acp_documents',
  VOLUNTEERS: 'acp_volunteers',
  IN_KIND: 'acp_in_kind',
  AUDIT_LOGS: 'acp_audit_logs',
  GAS_WEBHOOK_URL: 'acp_gas_webhook_url'
};

function safeGet<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return defaultValue;
    const parsed = JSON.parse(item);
    if (Array.isArray(defaultValue)) {
      return Array.isArray(parsed) ? (parsed as unknown as T) : defaultValue;
    }
    if (typeof defaultValue === 'object' && defaultValue !== null) {
      return { ...defaultValue, ...parsed };
    }
    return parsed;
  } catch (err) {
    console.error(`Error reading ${key} from localStorage`, err);
    return defaultValue;
  }
}

function safeSet<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error saving ${key} to localStorage`, err);
  }
}

export const StorageService = {
  // Profil de l'association
  getProfile: (): AssociationProfile => safeGet(STORAGE_KEYS.PROFILE, INITIAL_ASSOCIATION_PROFILE),
  saveProfile: (profile: AssociationProfile): void => {
    safeSet(STORAGE_KEYS.PROFILE, profile);
    StorageService.addAuditLog('PARAMETRAGE', 'Mise à jour des coordonnées et configuration de l\'association');
  },

  // Exercices comptables
  getFiscalYears: (): FiscalYear[] => safeGet(STORAGE_KEYS.FISCAL_YEARS, INITIAL_FISCAL_YEARS),
  saveFiscalYears: (years: FiscalYear[]): void => safeSet(STORAGE_KEYS.FISCAL_YEARS, years),

  // Plan comptable
  getAccounts: (): Account[] => safeGet(STORAGE_KEYS.ACCOUNTS, MOROCCAN_ASSOCIATION_ACCOUNTS),
  saveAccounts: (accounts: Account[]): void => safeSet(STORAGE_KEYS.ACCOUNTS, accounts),
  resetAccountsToCNC: (): Account[] => {
    safeSet(STORAGE_KEYS.ACCOUNTS, MOROCCAN_ASSOCIATION_ACCOUNTS);
    return MOROCCAN_ASSOCIATION_ACCOUNTS;
  },

  // Écritures comptables
  getEntries: (): AccountingEntry[] => safeGet(STORAGE_KEYS.ENTRIES, INITIAL_ENTRIES),
  saveEntries: (entries: AccountingEntry[]): void => safeSet(STORAGE_KEYS.ENTRIES, entries),
  addEntry: (entry: AccountingEntry): AccountingEntry[] => {
    const entries = StorageService.getEntries();
    const updated = [entry, ...entries];
    safeSet(STORAGE_KEYS.ENTRIES, updated);
    StorageService.addAuditLog('ECRITURE', `Validation de l'écriture ${entry.pieceNumber} (${entry.label})`);
    return updated;
  },

  // Recettes
  getRecettes: (): Recette[] => safeGet(STORAGE_KEYS.RECETTES, INITIAL_RECETTES),
  saveRecettes: (recettes: Recette[]): void => safeSet(STORAGE_KEYS.RECETTES, recettes),

  // Dépenses
  getDepenses: (): Depense[] => safeGet(STORAGE_KEYS.DEPENSES, INITIAL_DEPENSES),
  saveDepenses: (depenses: Depense[]): void => safeSet(STORAGE_KEYS.DEPENSES, depenses),

  // Ordres de décaissement et validations (نظام الصرف والموافقات الإدارية والمالية)
  getDisbursements: (): DisbursementOrder[] => safeGet(STORAGE_KEYS.DISBURSEMENTS, INITIAL_DISBURSEMENTS),
  saveDisbursements: (orders: DisbursementOrder[]): void => safeSet(STORAGE_KEYS.DISBURSEMENTS, orders),

  addDisbursement: (order: DisbursementOrder): DisbursementOrder[] => {
    const orders = StorageService.getDisbursements();
    const updated = [order, ...orders];
    safeSet(STORAGE_KEYS.DISBURSEMENTS, updated);
    StorageService.addAuditLog(
      'ORDRE_DECAISSEMENT_CREATION',
      `Création de la demande de décaissement ${order.orderNumber} (${order.subject}) par ${order.createdByName}`,
      order.createdByName
    );
    return updated;
  },

  updateDisbursement: (order: DisbursementOrder): DisbursementOrder[] => {
    const orders = StorageService.getDisbursements();
    const updated = orders.map(o => o.id === order.id ? order : o);
    safeSet(STORAGE_KEYS.DISBURSEMENTS, updated);
    return updated;
  },

  // Exécution financière du décaissement et génération automatique du قيد المحاسبي
  executeDisbursementAndRecordAccounting: (
    orderId: string,
    executionDetails: {
      bankAccountId: string;
      actualPaymentMethod: 'especes' | 'cheque' | 'virement';
      checkNumber?: string;
      transferReference?: string;
      paymentProofName?: string;
      paymentProofData?: string;
      presidentUser: { id: string; name: string };
      notes?: string;
    }
  ): { success: boolean; error?: string; order?: DisbursementOrder; entry?: AccountingEntry } => {
    const orders = StorageService.getDisbursements();
    const order = orders.find(o => o.id === orderId);

    if (!order) {
      return { success: false, error: 'طلب الصرف غير موجود في النظام.' };
    }

    if (order.isExecutedAccounting) {
      return { success: false, error: 'تم تنفيذ هذا الطلب وتسجيله محاسبياً مسبقاً (ممنوع التكرار المحاسبي).' };
    }

    const bankAccounts = StorageService.getBankAccounts();
    const bankAccount = bankAccounts.find(b => b.id === executionDetails.bankAccountId);

    if (!bankAccount) {
      return { success: false, error: 'الحساب البنكي أو الصندوق المحدد غير موجود.' };
    }

    // Contrôle de solde disponible
    if (bankAccount.currentBalance < order.amount) {
      return {
        success: false,
        error: `الرصيد المتاح في ${bankAccount.name} (${bankAccount.currentBalance.toLocaleString()} درهم) غير كافٍ لصرف مبلغ ${order.amount.toLocaleString()} درهم.`
      };
    }

    // Détermination du journal comptable approprié
    const journalCode = executionDetails.actualPaymentMethod === 'especes' ? 'CA' : 'BQ';
    const entries = StorageService.getEntries();
    const journalEntriesCount = entries.filter(e => e.journalCode === journalCode).length + 1;
    const pieceNumber = `${journalCode}-${order.fiscalYear}-${String(journalEntriesCount).padStart(4, '0')}`;

    const accounts = StorageService.getAccounts();
    const chargeAccount = accounts.find(a => a.number === order.accountNumber);
    const chargeLabel = chargeAccount ? chargeAccount.label : 'Charges d\'exploitation associatives';

    const executionTimestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const executionDate = executionTimestamp.split(' ')[0];

    // Création de l'écriture comptable équilibrée (Partie Double CNC)
    const newEntry: AccountingEntry = {
      id: `entry-${Date.now()}`,
      pieceNumber: pieceNumber,
      journalCode: journalCode,
      date: executionDate,
      period: executionDate.substring(0, 7),
      fiscalYear: order.fiscalYear,
      label: `Règlement ${order.orderNumber} - ${order.beneficiary} (${order.subject})`,
      lines: [
        {
          id: `line-${Date.now()}-1`,
          lineNumber: 1,
          accountNumber: order.accountNumber,
          accountLabel: chargeLabel,
          label: `${order.subject} - ${order.beneficiary}`,
          debit: order.amount,
          credit: 0,
          thirdParty: order.beneficiary,
          projectId: order.projectId
        },
        {
          id: `line-${Date.now()}-2`,
          lineNumber: 2,
          accountNumber: bankAccount.accountNumber,
          accountLabel: bankAccount.name,
          label: `${executionDetails.actualPaymentMethod.toUpperCase()} ${executionDetails.checkNumber || executionDetails.transferReference || ''} - ${order.beneficiary}`,
          debit: 0,
          credit: order.amount,
          thirdParty: order.beneficiary,
          projectId: order.projectId
        }
      ],
      totalDebit: order.amount,
      totalCredit: order.amount,
      isBalanced: true,
      status: 'valide',
      sourceModule: 'depense',
      attachmentName: executionDetails.paymentProofName || order.attachments[0]?.name,
      attachmentData: executionDetails.paymentProofData,
      createdAt: executionTimestamp,
      createdBy: executionDetails.presidentUser.name
    };

    // 1. Enregistrer l'écriture dans le journal
    const updatedEntries = StorageService.addEntry(newEntry);

    // 2. Mettre à jour le solde du compte bancaire/caisse
    const updatedBankAccounts = bankAccounts.map(b =>
      b.id === bankAccount.id ? { ...b, currentBalance: b.currentBalance - order.amount } : b
    );
    StorageService.saveBankAccounts(updatedBankAccounts);

    // 3. Mettre à jour les dépenses
    const depenses = StorageService.getDepenses();
    const newDepense: Depense = {
      id: `dep-${Date.now()}`,
      date: executionDate,
      pieceNumber: pieceNumber,
      voucherNumber: order.orderNumber,
      beneficiary: order.beneficiary,
      category: 'projet',
      amount: order.amount,
      paymentMethod: executionDetails.actualPaymentMethod,
      checkNumber: executionDetails.checkNumber,
      bankAccountId: bankAccount.id,
      projectId: order.projectId,
      accountNumber: order.accountNumber,
      accountingEntryId: newEntry.id,
      justificationName: executionDetails.paymentProofName || order.attachments[0]?.name || order.orderNumber,
      isCompliantWith5000DhRule: !(executionDetails.actualPaymentMethod === 'especes' && order.amount > 5000),
      notes: `Décaissement ${order.orderNumber} ordonnancé par le Président : ${order.subject}`
    };
    StorageService.saveDepenses([newDepense, ...depenses]);

    // 4. Mettre à jour le budget du projet si rattaché
    if (order.projectId) {
      const projects = StorageService.getProjects();
      const updatedProjects = projects.map(p =>
        p.id === order.projectId ? { ...p, budgetSpent: p.budgetSpent + order.amount } : p
      );
      StorageService.saveProjects(updatedProjects);
    }

    // 5. Mettre à jour la ligne budgétaire si rattachée
    if (order.budgetItemId) {
      const budgets = StorageService.getBudgets();
      const updatedBudgets = budgets.map(bg =>
        bg.id === order.budgetItemId ? { ...bg, amountRealized: bg.amountRealized + order.amount } : bg
      );
      StorageService.saveBudgets(updatedBudgets);
    }

    // 6. Mettre à jour l'ordre de décaissement avec verrouillage comptable
    const updatedOrder: DisbursementOrder = {
      ...order,
      status: 'execute',
      executionDate: executionTimestamp,
      presidentId: executionDetails.presidentUser.id,
      presidentName: executionDetails.presidentUser.name,
      actualPaymentMethod: executionDetails.actualPaymentMethod,
      bankAccountId: bankAccount.id,
      bankAccountName: bankAccount.name,
      checkNumber: executionDetails.checkNumber,
      transferReference: executionDetails.transferReference,
      paymentProofName: executionDetails.paymentProofName,
      paymentProofData: executionDetails.paymentProofData,
      isExecutedAccounting: true,
      accountingEntryId: newEntry.id,
      accountingPieceNumber: pieceNumber,
      history: [
        ...order.history,
        {
          id: `hist-${Date.now()}`,
          timestamp: executionTimestamp,
          status: 'execute',
          action: 'Exécution du paiement et comptabilisation automatique',
          actionArabic: 'تنفيذ الصرف والتسجيل المحاسبي بالدفتر واليومية',
          userName: executionDetails.presidentUser.name,
          userRole: 'president',
          notes: executionDetails.notes || `Règlement effectué par ${executionDetails.actualPaymentMethod.toUpperCase()} (${executionDetails.checkNumber || executionDetails.transferReference || 'Caisse'}) - Pièce comptable ${pieceNumber}`
        }
      ],
      updatedAt: executionTimestamp
    };

    const finalOrders = orders.map(o => o.id === order.id ? updatedOrder : o);
    StorageService.saveDisbursements(finalOrders);

    StorageService.addAuditLog(
      'ORDRE_DECAISSEMENT_EXECUTION',
      `Exécution et imputation comptable de l'ordre ${order.orderNumber} (${order.amount} MAD) sous la pièce ${pieceNumber}`,
      executionDetails.presidentUser.name
    );

    return {
      success: true,
      order: updatedOrder,
      entry: newEntry
    };
  },

  // Comptes bancaires et caisses
  getBankAccounts: (): BankAccount[] => safeGet(STORAGE_KEYS.BANK_ACCOUNTS, INITIAL_BANK_ACCOUNTS),
  saveBankAccounts: (accounts: BankAccount[]): void => safeSet(STORAGE_KEYS.BANK_ACCOUNTS, accounts),

  // Subventions
  getSubventions: (): Subvention[] => safeGet(STORAGE_KEYS.SUBVENTIONS, INITIAL_SUBVENTIONS),
  saveSubventions: (subventions: Subvention[]): void => safeSet(STORAGE_KEYS.SUBVENTIONS, subventions),

  // Projets
  getProjects: (): Project[] => safeGet(STORAGE_KEYS.PROJECTS, INITIAL_PROJECTS),
  saveProjects: (projects: Project[]): void => safeSet(STORAGE_KEYS.PROJECTS, projects),

  // Budgets
  getBudgets: (): BudgetItem[] => safeGet(STORAGE_KEYS.BUDGETS, INITIAL_BUDGET_ITEMS),
  saveBudgets: (budgets: BudgetItem[]): void => safeSet(STORAGE_KEYS.BUDGETS, budgets),

  // Immobilisations
  getImmobilisations: (): Immobilisation[] => safeGet(STORAGE_KEYS.IMMOBILISATIONS, INITIAL_IMMOBILISATIONS),
  saveImmobilisations: (immobs: Immobilisation[]): void => safeSet(STORAGE_KEYS.IMMOBILISATIONS, immobs),

  // Membres / Adhérents
  getMembers: (): Member[] => safeGet(STORAGE_KEYS.MEMBERS, INITIAL_MEMBERS),
  saveMembers: (members: Member[]): void => safeSet(STORAGE_KEYS.MEMBERS, members),

  // GED / Documents
  getDocuments: (): DocumentArchive[] => safeGet(STORAGE_KEYS.DOCUMENTS, INITIAL_DOCUMENTS),
  saveDocuments: (docs: DocumentArchive[]): void => safeSet(STORAGE_KEYS.DOCUMENTS, docs),

  // Bénévolat et Contributions en nature (Classe 0 / ETIC S2, S3)
  getVolunteers: (): VolunteerWork[] => safeGet(STORAGE_KEYS.VOLUNTEERS, INITIAL_VOLUNTEERS),
  saveVolunteers: (vols: VolunteerWork[]): void => safeSet(STORAGE_KEYS.VOLUNTEERS, vols),
  getInKind: (): InKindContribution[] => safeGet(STORAGE_KEYS.IN_KIND, INITIAL_IN_KIND),
  saveInKind: (ink: InKindContribution[]): void => safeSet(STORAGE_KEYS.IN_KIND, ink),

  // Journal d'audit et traçabilité
  getAuditLogs: (): AuditLog[] => safeGet(STORAGE_KEYS.AUDIT_LOGS, [
    {
      id: 'log-01',
      timestamp: '2026-01-01 09:00:00',
      user: 'Mme Amina BENJELLOUN',
      action: 'OUVERTURE_EXERCICE',
      details: 'Ouverture de l\'exercice comptable 2026',
      entityType: 'EXERCICE'
    }
  ]),
  addAuditLog: (action: string, details: string, user = 'Utilisateur en cours'): void => {
    const logs = StorageService.getAuditLogs();
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      user,
      action,
      details,
      entityType: 'COMPTABILITE'
    };
    safeSet(STORAGE_KEYS.AUDIT_LOGS, [newLog, ...logs.slice(0, 199)]);
    CloudDataService.addAuditEvent(action, details).catch(error => console.error('Cloud audit write failed:', error));
  },

  // Google Apps Script Webhook URL
  getGasWebhookUrl: (): string => localStorage.getItem(STORAGE_KEYS.GAS_WEBHOOK_URL) || '',
  saveGasWebhookUrl: (url: string): void => localStorage.setItem(STORAGE_KEYS.GAS_WEBHOOK_URL, url),

  // Sauvegarde globale JSON exportable
  exportDatabaseJSON: (): string => {
    const dump = {
      exportedAt: new Date().toISOString(),
      version: '1.0.0-CNC2023',
      profile: StorageService.getProfile(),
      fiscalYears: StorageService.getFiscalYears(),
      accounts: StorageService.getAccounts(),
      entries: StorageService.getEntries(),
      recettes: StorageService.getRecettes(),
      depenses: StorageService.getDepenses(),
      disbursements: StorageService.getDisbursements(),
      bankAccounts: StorageService.getBankAccounts(),
      subventions: StorageService.getSubventions(),
      projects: StorageService.getProjects(),
      budgets: StorageService.getBudgets(),
      immobilisations: StorageService.getImmobilisations(),
      members: StorageService.getMembers(),
      documents: StorageService.getDocuments(),
      volunteers: StorageService.getVolunteers(),
      inKind: StorageService.getInKind(),
      auditLogs: StorageService.getAuditLogs()
    };
    return JSON.stringify(dump, null, 2);
  },

  // Restauration globale JSON
  importDatabaseJSON: (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      if (data.profile) safeSet(STORAGE_KEYS.PROFILE, data.profile);
      if (data.fiscalYears) safeSet(STORAGE_KEYS.FISCAL_YEARS, data.fiscalYears);
      if (data.accounts) safeSet(STORAGE_KEYS.ACCOUNTS, data.accounts);
      if (data.entries) safeSet(STORAGE_KEYS.ENTRIES, data.entries);
      if (data.recettes) safeSet(STORAGE_KEYS.RECETTES, data.recettes);
      if (data.depenses) safeSet(STORAGE_KEYS.DEPENSES, data.depenses);
      if (data.disbursements) safeSet(STORAGE_KEYS.DISBURSEMENTS, data.disbursements);
      if (data.bankAccounts) safeSet(STORAGE_KEYS.BANK_ACCOUNTS, data.bankAccounts);
      if (data.subventions) safeSet(STORAGE_KEYS.SUBVENTIONS, data.subventions);
      if (data.projects) safeSet(STORAGE_KEYS.PROJECTS, data.projects);
      if (data.budgets) safeSet(STORAGE_KEYS.BUDGETS, data.budgets);
      if (data.immobilisations) safeSet(STORAGE_KEYS.IMMOBILISATIONS, data.immobilisations);
      if (data.members) safeSet(STORAGE_KEYS.MEMBERS, data.members);
      if (data.documents) safeSet(STORAGE_KEYS.DOCUMENTS, data.documents);
      if (data.volunteers) safeSet(STORAGE_KEYS.VOLUNTEERS, data.volunteers);
      if (data.inKind) safeSet(STORAGE_KEYS.IN_KIND, data.inKind);
      StorageService.addAuditLog('IMPORT_BASE', 'Restauration complète de la base de données depuis un fichier JSON');
      return true;
    } catch (e) {
      console.error('Erreur importation JSON', e);
      return false;
    }
  },

  // Réinitialisation aux données démo
  resetToDemoData: (): void => {
    safeSet(STORAGE_KEYS.PROFILE, INITIAL_ASSOCIATION_PROFILE);
    safeSet(STORAGE_KEYS.FISCAL_YEARS, INITIAL_FISCAL_YEARS);
    safeSet(STORAGE_KEYS.ACCOUNTS, MOROCCAN_ASSOCIATION_ACCOUNTS);
    safeSet(STORAGE_KEYS.ENTRIES, INITIAL_ENTRIES);
    safeSet(STORAGE_KEYS.RECETTES, INITIAL_RECETTES);
    safeSet(STORAGE_KEYS.DEPENSES, INITIAL_DEPENSES);
    safeSet(STORAGE_KEYS.DISBURSEMENTS, INITIAL_DISBURSEMENTS);
    safeSet(STORAGE_KEYS.BANK_ACCOUNTS, INITIAL_BANK_ACCOUNTS);
    safeSet(STORAGE_KEYS.SUBVENTIONS, INITIAL_SUBVENTIONS);
    safeSet(STORAGE_KEYS.PROJECTS, INITIAL_PROJECTS);
    safeSet(STORAGE_KEYS.BUDGETS, INITIAL_BUDGET_ITEMS);
    safeSet(STORAGE_KEYS.IMMOBILISATIONS, INITIAL_IMMOBILISATIONS);
    safeSet(STORAGE_KEYS.MEMBERS, INITIAL_MEMBERS);
    safeSet(STORAGE_KEYS.DOCUMENTS, INITIAL_DOCUMENTS);
    safeSet(STORAGE_KEYS.VOLUNTEERS, INITIAL_VOLUNTEERS);
    safeSet(STORAGE_KEYS.IN_KIND, INITIAL_IN_KIND);
  }
};
