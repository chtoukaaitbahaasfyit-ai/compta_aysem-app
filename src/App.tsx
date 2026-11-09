/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ASSOCIATION COMPTA PRO - Application Complète de Comptabilité pour Associations Marocaines
 * Conforme au Plan Comptable des Associations du CNC (Avis n°23 de 2023) & Dahir 1958
 * Interface inspirée de SAGE 100
 */

import React, { useState, useEffect, useRef } from 'react';
import { StorageService } from './services/storageService';
import { AccountingEngine } from './services/accountingEngine';
import { AuthService, SessionExpiredError } from './services/authService';
import { CloudDataService, RevisionConflictError, RpcMissingError, type CloudModule } from './services/cloudDataService';
import { INITIAL_ASSOCIATION_PROFILE } from './data/initialData';
import { asArray, normalizeBankAccounts } from './utils/normalize';
import { MOROCCAN_ASSOCIATION_ACCOUNTS } from './data/moroccanChartOfAccounts';
import {
  AssociationProfile,
  FiscalYear,
  Account,
  AccountingEntry,
  Recette,
  Depense,
  BankAccount,
  Project,
  Subvention,
  BudgetItem,
  Immobilisation,
  Member,
  DocumentArchive,
  VolunteerWork,
  InKindContribution,
  DisbursementOrder,
  AppAuthUser
} from './types/accounting';

// Components
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { JournalEntryForm } from './components/JournalEntryForm';
import { EntriesList } from './components/EntriesList';
import { GrandLivre } from './components/GrandLivre';
import { BalanceGenerale } from './components/BalanceGenerale';
import { ChartOfAccounts } from './components/ChartOfAccounts';
import { RecettesManager } from './components/RecettesManager';
import { DepensesManager } from './components/DepensesManager';
import { TreasuryManager } from './components/TreasuryManager';
import { SubventionsManager } from './components/SubventionsManager';
import { ProjectsManager } from './components/ProjectsManager';
import { BudgetManager } from './components/BudgetManager';
import { ImmobilisationsManager } from './components/ImmobilisationsManager';
import { MembersManager } from './components/MembersManager';
import { InKindManager } from './components/InKindManager';
import { FinancialReports } from './components/FinancialReports';
import { DocumentsManager } from './components/DocumentsManager';
import { GoogleSheetsIntegration } from './components/GoogleSheetsIntegration';
import { AssociationSettings } from './components/AssociationSettings';
import { DisbursementManager } from './components/DisbursementManager';
import { UserLoginModal } from './components/UserLoginModal';
import { UserManagement } from './components/UserManagement';
import { InviteAcceptance } from './components/InviteAcceptance';

const BLANK_USER = { id: '', username: '', name: '', nameArabic: '', email: '', role: 'pending', roleArabic: 'غير مسجل' } as AppAuthUser;

const DEFAULT_PROFILE: AssociationProfile = {
  ...INITIAL_ASSOCIATION_PROFILE,
  name: 'Association A.Y.S.M', arabicName: 'أكاديمية دعم ومواكبة الشباب', sigle: 'A.Y.S.M', address: '', city: 'Sidi Bibi', phone: '', email: 'Lahsencherkaoui2@gmail.com', website: '', ifFiscal: '', patente: '', cnss: '', ice: '', rib: '', bankName: '', agency: '', president: 'Lahsen Cherkaoui', treasurer: '', secretary: '', creationDate: '', receiptReceiptNumber: '', accountingModel: 'normal', activeFiscalYear: '2026', currency: 'MAD'
};

// Order matters only for readability; each module is saved independently with optimistic concurrency.
const SAVE_ORDER: CloudModule[] = ['association_profile','fiscal_years','accounts','bank_accounts','entries','recettes','depenses','disbursements','projects','subventions','budgets','immobilisations','members','documents','volunteers','in_kind'];

export default function App() {
  // Navigation & UI states
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isArabic, setIsArabic] = useState<boolean>(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Core Data States
  const [profile, setProfile] = useState<AssociationProfile>(() => StorageService.getProfile());
  const [fiscalYears, setFiscalYears] = useState<FiscalYear[]>(() => StorageService.getFiscalYears());
  const [accounts, setAccounts] = useState<Account[]>(() => StorageService.getAccounts());
  const [entries, setEntries] = useState<AccountingEntry[]>(() => StorageService.getEntries());
  const [recettes, setRecettes] = useState<Recette[]>(() => StorageService.getRecettes());
  const [depenses, setDepenses] = useState<Depense[]>(() => StorageService.getDepenses());
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(() => StorageService.getBankAccounts());
  const [projects, setProjects] = useState<Project[]>(() => StorageService.getProjects());
  const [subventions, setSubventions] = useState<Subvention[]>(() => StorageService.getSubventions());
  const [budgets, setBudgets] = useState<BudgetItem[]>(() => StorageService.getBudgets());
  const [immobilisations, setImmobilisations] = useState<Immobilisation[]>(() => StorageService.getImmobilisations());
  const [members, setMembers] = useState<Member[]>(() => StorageService.getMembers());
  const [documents, setDocuments] = useState<DocumentArchive[]>(() => StorageService.getDocuments());
  const [volunteers, setVolunteers] = useState<VolunteerWork[]>(() => StorageService.getVolunteers());
  const [inKind, setInKind] = useState<InKindContribution[]>(() => StorageService.getInKind());

  // User Authentication & Roles (جمعية شباب الغد للتنمية والتعاون)
  const [currentUser, setCurrentUser] = useState<AppAuthUser>(() => AuthService.getCurrentUser() || BLANK_USER);
  const [disbursements, setDisbursements] = useState<DisbursementOrder[]>(() => StorageService.getDisbursements());
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(!AuthService.getCurrentUser());
  const [cloudReady, setCloudReady] = useState(false);
  const [cloudError, setCloudError] = useState('');
  const [cloudConflict, setCloudConflict] = useState(false);
  const [retryTick, setRetryTick] = useState(0);
  const revisionsRef = useRef<Partial<Record<CloudModule, number>>>({});
  const lastSavedRef = useRef<Partial<Record<CloudModule, string>>>({});
  const latestPayloadRef = useRef<Partial<Record<CloudModule, unknown>>>({});
  const saveQueueRef = useRef<Promise<void>>(Promise.resolve());
  const blockedRef = useRef(false);
  const rpcMissingRef = useRef(false);
  const [isOnline, setIsOnline] = useState<boolean>(() => typeof navigator === 'undefined' ? true : navigator.onLine);

  useEffect(() => { const update = () => setIsOnline(navigator.onLine); window.addEventListener('online', update); window.addEventListener('offline', update); return () => { window.removeEventListener('online', update); window.removeEventListener('offline', update); }; }, []);

  // Hydrate every accounting module from Supabase after authentication. Demo seed records are never uploaded.
  useEffect(() => { let alive = true; AuthService.restoreSession().then(user => { if (!alive) return; if (user) { setCurrentUser(user); if (user.role === 'tresorier') setActiveTab('disbursements'); else setActiveTab('dashboard'); setIsLoginModalOpen(false); } else setIsLoginModalOpen(true); }).catch(() => { if (alive) setIsLoginModalOpen(true); }); return () => { alive = false; }; }, []);

  const handleSessionExpired = () => {
    blockedRef.current = true;
    AuthService.logout();
    setCloudReady(false); setCloudError(''); setCurrentUser(BLANK_USER); setIsLoginModalOpen(true);
  };

  // Hydrate every accounting module from Supabase after authentication. Demo seed records are never used or uploaded.
  useEffect(() => {
    if (!currentUser.id || !['president', 'responsable_administratif'].includes(currentUser.role)) { setCloudReady(false); return; }
    let alive = true; setCloudReady(false); setCloudError(''); setCloudConflict(false); blockedRef.current = false;
    setProfile(DEFAULT_PROFILE);
    setFiscalYears([]); setAccounts(MOROCCAN_ASSOCIATION_ACCOUNTS); setEntries([]); setRecettes([]); setDepenses([]); setDisbursements([]); setBankAccounts([]); setProjects([]); setSubventions([]); setBudgets([]); setImmobilisations([]); setMembers([]); setDocuments([]); setVolunteers([]); setInKind([]);
    CloudDataService.loadAll().then(({ data, revisions }) => {
      if (!alive) return;
      const loaded: Partial<Record<CloudModule, unknown>> = {
        association_profile: (data.association_profile && typeof data.association_profile === 'object') ? { ...DEFAULT_PROFILE, ...(data.association_profile as object) } : DEFAULT_PROFILE,
        fiscal_years: asArray<FiscalYear>(data.fiscal_years),
        accounts: asArray<Account>(data.accounts, MOROCCAN_ASSOCIATION_ACCOUNTS),
        entries: asArray<AccountingEntry>(data.entries),
        recettes: asArray<Recette>(data.recettes),
        depenses: asArray<Depense>(data.depenses),
        disbursements: asArray<DisbursementOrder>(data.disbursements),
        bank_accounts: normalizeBankAccounts(data.bank_accounts),
        projects: asArray<Project>(data.projects),
        subventions: asArray<Subvention>(data.subventions),
        budgets: asArray<BudgetItem>(data.budgets),
        immobilisations: asArray<Immobilisation>(data.immobilisations),
        members: asArray<Member>(data.members),
        documents: asArray<DocumentArchive>(data.documents),
        volunteers: asArray<VolunteerWork>(data.volunteers),
        in_kind: asArray<InKindContribution>(data.in_kind)
      };
      revisionsRef.current = { ...revisions };
      // Snapshot of exactly what the UI starts with: modules absent from the cloud are NOT uploaded until the user changes them.
      lastSavedRef.current = Object.fromEntries(SAVE_ORDER.map(m => [m, JSON.stringify(loaded[m])]));
      setProfile(loaded.association_profile as AssociationProfile);
      setFiscalYears(loaded.fiscal_years as FiscalYear[]);
      setAccounts(loaded.accounts as Account[]);
      setEntries(loaded.entries as AccountingEntry[]);
      setRecettes(loaded.recettes as Recette[]);
      setDepenses(loaded.depenses as Depense[]);
      setDisbursements(loaded.disbursements as DisbursementOrder[]);
      setBankAccounts(loaded.bank_accounts as BankAccount[]);
      setProjects(loaded.projects as Project[]);
      setSubventions(loaded.subventions as Subvention[]);
      setBudgets(loaded.budgets as BudgetItem[]);
      setImmobilisations(loaded.immobilisations as Immobilisation[]);
      setMembers(loaded.members as Member[]);
      setDocuments(loaded.documents as DocumentArchive[]);
      setVolunteers(loaded.volunteers as VolunteerWork[]);
      setInKind(loaded.in_kind as InKindContribution[]);
      setCloudReady(true);
    }).catch(error => {
      if (!alive) return;
      if (error instanceof SessionExpiredError) handleSessionExpired();
      else setCloudError(error instanceof Error ? error.message : 'تعذر تحميل البيانات السحابية');
    });
    return () => { alive = false; };
  }, [currentUser.id]);

  useEffect(() => {
    if (!currentUser.id || currentUser.role !== 'tresorier') return;
    let alive = true;
    CloudDataService.loadDisbursementOrders().then(rows => { if (alive) { setDisbursements(rows); setCloudError(''); } }).catch(error => { if (alive) setCloudError(error instanceof Error ? error.message : 'تعذر تحميل طلبات الصرف'); });
    return () => { alive = false; };
  }, [currentUser.id, currentUser.role]);

  // Keep the in-memory StorageService mirror identical to React state (used by disbursement execution, exports, audit).
  useEffect(() => {
    StorageService.hydrate({ PROFILE: profile, FISCAL_YEARS: fiscalYears, ACCOUNTS: accounts, ENTRIES: entries, RECETTES: recettes, DEPENSES: depenses, DISBURSEMENTS: disbursements, BANK_ACCOUNTS: bankAccounts, SUBVENTIONS: subventions, PROJECTS: projects, BUDGETS: budgets, IMMOBILISATIONS: immobilisations, MEMBERS: members, DOCUMENTS: documents, VOLUNTEERS: volunteers, IN_KIND: inKind });
  }, [profile, fiscalYears, accounts, entries, recettes, depenses, disbursements, bankAccounts, projects, subventions, budgets, immobilisations, members, documents, volunteers, inKind]);
  useEffect(() => { StorageService.setActor(currentUser.name); }, [currentUser.name]);

  latestPayloadRef.current = { association_profile: profile, fiscal_years: fiscalYears, accounts, entries, recettes, depenses, disbursements, bank_accounts: bankAccounts, projects, subventions, budgets, immobilisations, members, documents, volunteers, in_kind: inKind };

  // Cloud is authoritative. Only modules that changed are written, one at a time, each guarded by its revision
  // (optimistic locking): if another device saved first, we stop and ask for a reload instead of overwriting it.
  const queueSave = () => {
    saveQueueRef.current = saveQueueRef.current.then(async () => {
      if (blockedRef.current) return;
      const payload = latestPayloadRef.current;
      try {
        const changed = SAVE_ORDER
          .map(module => ({ module, json: JSON.stringify(payload[module]) }))
          .filter(({ module, json }) => json !== lastSavedRef.current[module]);
        if (changed.length) {
          let done = false;
          if (!rpcMissingRef.current) {
            try {
              // Preferred path: one atomic transaction for every changed module.
              const revs = await CloudDataService.saveModules(changed.map(({ module }) => ({ module, payload: payload[module], expectedRevision: revisionsRef.current[module] })));
              changed.forEach(({ module, json }) => { revisionsRef.current[module] = Number(revs[module]) || (revisionsRef.current[module] ?? 0) + 1; lastSavedRef.current[module] = json; });
              done = true;
            } catch (e) {
              if (!(e instanceof RpcMissingError)) throw e;
              rpcMissingRef.current = true; // migration not applied yet → per-module fallback (not atomic)
            }
          }
          if (!done) {
            for (const { module, json } of changed) {
              revisionsRef.current[module] = await CloudDataService.saveModule(module, payload[module], revisionsRef.current[module]);
              lastSavedRef.current[module] = json;
            }
          }
        }
        setCloudError('');
      } catch (error) {
        if (error instanceof RevisionConflictError) { blockedRef.current = true; setCloudConflict(true); setCloudError(error.message); }
        else if (error instanceof SessionExpiredError) handleSessionExpired();
        else { setCloudError(error instanceof Error ? error.message : 'فشل حفظ البيانات في السحابة'); window.setTimeout(() => setRetryTick(t => t + 1), 5000); }
      }
    });
  };

  useEffect(() => {
    // Only the president persists the legacy all-modules snapshot; other roles use scoped workflow endpoints.
    if (!cloudReady || !currentUser.id || currentUser.role !== 'president') return;
    const timer = window.setTimeout(queueSave, 700);
    return () => window.clearTimeout(timer);
  }, [cloudReady, currentUser.id, retryTick, profile, fiscalYears, accounts, entries, recettes, depenses, disbursements, bankAccounts, projects, subventions, budgets, immobilisations, members, documents, volunteers, inKind]);

  // Keyboard shortcut listener (e.g. F3 for new entry)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F3') {
        e.preventDefault();
        setActiveTab('entry-form');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Total cash available
  const totalCash = bankAccounts.reduce((sum, b) => sum + (Number(b.currentBalance) || 0), 0);

  // Handlers
  // Applies all bank/cash movements of an entry in ONE state update (the previous per-line loop used a stale
  // `bankAccounts` and lost every movement but the last when an entry touched two accounts, e.g. a transfer).
  const applyBankDeltas = (lines: AccountingEntry['lines'], sign: 1 | -1) => {
    const deltas = new Map<string, number>();
    lines.forEach(line => {
      const bank = bankAccounts.find(b => b.accountNumber === line.accountNumber);
      if (bank) deltas.set(bank.id, (deltas.get(bank.id) || 0) + sign * ((line.debit || 0) - (line.credit || 0)));
    });
    if (!deltas.size) return;
    const updatedAccounts = bankAccounts.map(b => deltas.has(b.id) ? { ...b, currentBalance: (Number(b.currentBalance) || 0) + (deltas.get(b.id) as number) } : b);
    setBankAccounts(updatedAccounts);
    StorageService.saveBankAccounts(updatedAccounts);
  };

  const handleSaveEntry = (newEntry: AccountingEntry) => {
    const updated = StorageService.addEntry(newEntry);
    setEntries(updated);
    applyBankDeltas(newEntry.lines, 1);
    setActiveTab('entries-list');
  };

  const handleExtourne = (originalEntry: AccountingEntry) => {
    const extourneEntry = AccountingEngine.createExtourneEntry(originalEntry, 'Trésorier en fonction');
    const updatedOriginal = { ...originalEntry, status: 'extourne' as const };
    const allEntries = entries.map(e => e.id === originalEntry.id ? updatedOriginal : e);
    const updatedWithExtourne = [extourneEntry, ...allEntries];

    setEntries(updatedWithExtourne);
    StorageService.saveEntries(updatedWithExtourne);
    StorageService.addAuditLog('EXTOURNE', `Extourne comptable de la pièce ${originalEntry.pieceNumber}`);

    // Reverse bank balances if applicable
    applyBankDeltas(originalEntry.lines, -1);

    alert(`La pièce ${originalEntry.pieceNumber} a été contrepassée par l'écriture d'extourne ${extourneEntry.pieceNumber}. L'historique d'audit est intact.`);
  };

  const handleAddRecette = (newRecette: Recette, generatedEntry?: AccountingEntry) => {
    const updatedRecettes = [newRecette, ...recettes];
    setRecettes(updatedRecettes);
    StorageService.saveRecettes(updatedRecettes);

    if (generatedEntry) {
      const updatedEntries = StorageService.addEntry(generatedEntry);
      setEntries(updatedEntries);

      // Update bank account balance
      const updatedBanks = bankAccounts.map(b =>
        b.id === newRecette.bankAccountId ? { ...b, currentBalance: b.currentBalance + newRecette.amount } : b
      );
      setBankAccounts(updatedBanks);
      StorageService.saveBankAccounts(updatedBanks);
    }

    // If linked to member, update member dues
    if (newRecette.memberId) {
      const updatedMembers = members.map(m =>
        m.id === newRecette.memberId ? { ...m, status: 'a_jour' as const, totalPaid: m.totalPaid + newRecette.amount } : m
      );
      setMembers(updatedMembers);
      StorageService.saveMembers(updatedMembers);
    }
  };

  const handleAddDepense = (newDepense: Depense, generatedEntry?: AccountingEntry) => {
    // Defence in depth: a cash register can never go negative (the form also checks this).
    const payingAccount = bankAccounts.find(b => b.id === newDepense.bankAccountId);
    if (generatedEntry && payingAccount?.type === 'caisse' && (Number(payingAccount.currentBalance) || 0) < newDepense.amount) {
      alert(`Solde de caisse insuffisant : ${(Number(payingAccount.currentBalance) || 0).toLocaleString()} DH disponibles pour un règlement de ${newDepense.amount.toLocaleString()} DH.`);
      return;
    }
    const updatedDepenses = [newDepense, ...depenses];
    setDepenses(updatedDepenses);
    StorageService.saveDepenses(updatedDepenses);

    if (generatedEntry) {
      const updatedEntries = StorageService.addEntry(generatedEntry);
      setEntries(updatedEntries);

      // Update bank account balance
      const updatedBanks = bankAccounts.map(b =>
        b.id === newDepense.bankAccountId ? { ...b, currentBalance: b.currentBalance - newDepense.amount } : b
      );
      setBankAccounts(updatedBanks);
      StorageService.saveBankAccounts(updatedBanks);
    }

    // If linked to project, update project spent
    if (newDepense.projectId) {
      const updatedProjects = projects.map(p =>
        p.id === newDepense.projectId ? { ...p, budgetSpent: p.budgetSpent + newDepense.amount } : p
      );
      setProjects(updatedProjects);
      StorageService.saveProjects(updatedProjects);
    }
  };

  const handleUpdateProfile = (updatedProfile: AssociationProfile) => {
    setProfile(updatedProfile);
    StorageService.saveProfile(updatedProfile);
  };

  const handleUpdateFiscalYears = (updatedYears: FiscalYear[]) => {
    setFiscalYears(updatedYears);
    StorageService.saveFiscalYears(updatedYears);
  };

  const handleSelectFiscalYear = (yearCode: string) => {
    const updatedProfile = { ...profile, activeFiscalYear: yearCode };
    setProfile(updatedProfile);
    StorageService.saveProfile(updatedProfile);
  };

  const handleLoginSuccess = (user: AppAuthUser) => {
    setCloudReady(false); setCurrentUser(user); if (user.role === 'tresorier') setActiveTab('disbursements');
  };

  const handleRefreshAllData = () => {
    setProfile(StorageService.getProfile());
    setFiscalYears(StorageService.getFiscalYears());
    setAccounts(StorageService.getAccounts());
    setEntries(StorageService.getEntries());
    setRecettes(StorageService.getRecettes());
    setBankAccounts(normalizeBankAccounts(StorageService.getBankAccounts()));
    setProjects(StorageService.getProjects());
    setSubventions(StorageService.getSubventions());
    setBudgets(StorageService.getBudgets());
    setImmobilisations(StorageService.getImmobilisations());
    setMembers(StorageService.getMembers());
    setDocuments(StorageService.getDocuments());
    setVolunteers(StorageService.getVolunteers());
    setInKind(StorageService.getInKind());
    setDepenses(StorageService.getDepenses());
    setDisbursements(StorageService.getDisbursements());
  };

  // A JSON restore fills the in-memory store; pull it into React state so it is then saved to the cloud.
  useEffect(() => {
    const onImported = () => handleRefreshAllData();
    window.addEventListener('aysm:storage-imported', onImported);
    return () => window.removeEventListener('aysm:storage-imported', onImported);
  }, []);

  const handleResetAllData = () => {
    alert('استعادة البيانات التجريبية معطلة في النسخة السحابية لحماية بيانات الجمعية.');
  };

  // Calcul des demandes en attente selon le rôle connecté
  const pendingDisbursementsCount =
    currentUser.role === 'tresorier'
      ? disbursements.filter(d => d.status === 'en_attente_tresorier').length
      : ['president', 'responsable_administratif'].includes(currentUser.role)
      ? disbursements.filter(d => d.status === 'en_attente_president' || d.status === 'approuve_tresorier').length
      : currentUser.role === 'responsable_administratif'
      ? disbursements.filter(d => d.status === 'a_completer').length
      : disbursements.filter(d => d.status === 'en_attente_tresorier' || d.status === 'en_attente_president').length;

  return (
    <div
      dir={isArabic ? 'rtl' : 'ltr'}
      className={`min-h-screen bg-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white ${
        isArabic ? 'font-arabic' : ''
      }`}
    >
      {currentUser.id && !isOnline && <div className="fixed inset-0 z-[90] bg-slate-950/80 flex items-center justify-center p-6 text-center"><div className="max-w-md rounded-2xl bg-white p-6 shadow-xl"><div className="text-xl font-bold text-rose-700 mb-2">الاتصال بالإنترنت مقطوع</div><p className="text-sm text-slate-700">AYSM COMPTA يعمل عبر الإنترنت فقط. تم إيقاف التفاعل حتى يعود الاتصال. لا تدخل أي عملية محاسبية الآن.</p></div></div>}
      {currentUser.id && ['president', 'responsable_administratif'].includes(currentUser.role) && !cloudReady && !cloudError && <div className="fixed inset-0 z-[80] cursor-wait" aria-hidden="true" />}
      {currentUser.id && (cloudError ? <div className="bg-rose-100 text-rose-800 text-sm p-3 text-center">{cloudError}{cloudConflict && <button onClick={() => window.location.reload()} className="mx-3 px-3 py-1 rounded bg-rose-700 text-white font-semibold">إعادة التحميل</button>}</div> : ['president', 'responsable_administratif'].includes(currentUser.role) && !cloudReady ? <div className="bg-amber-100 text-amber-900 text-sm p-3 text-center">جار تحميل بيانات الجمعية من قاعدة البيانات...</div> : <div className="bg-emerald-50 text-emerald-800 text-xs p-2 text-center">متصل بقاعدة البيانات السحابية — الحفظ مباشر عبر الإنترنت</div>)}
      {/* Top Header */}
      <Header
        profile={profile}
        totalCash={totalCash}
        fiscalYears={fiscalYears}
        onSelectFiscalYear={handleSelectFiscalYear}
        onNewEntry={() => setActiveTab('entry-form')}
        onOpenSheetsModal={() => setActiveTab('sheets-integration')}
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        isArabic={isArabic}
        onToggleArabic={() => setIsArabic(!isArabic)}
        isSidebarCollapsed={isSidebarCollapsed}
        onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        lateMembersCount={members.filter(m => m.status === 'en_retard').length}
        subventionsCount={subventions.length}
        currentUser={currentUser}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
      />

      {/* Main Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* SAGE 100 Sidebar */}
        {isMobileMenuOpen && <button aria-label={isArabic ? 'إغلاق القائمة' : 'Close menu'} onClick={() => setIsMobileMenuOpen(false)} className="mobile-menu-backdrop fixed inset-0 z-40 bg-slate-950/50 md:hidden" />}
        <div className={`mobile-sidebar-shell ${isMobileMenuOpen ? 'mobile-sidebar-open' : ''}`}>
        <Sidebar
          activeTab={activeTab}
          onChangeTab={(tab) => { setActiveTab(tab); setIsMobileMenuOpen(false); }}
          entriesCount={entries.length}
          membersCount={members.length}
          projectsCount={projects.length}
          subventionsCount={subventions.length}
          disbursementsCount={pendingDisbursementsCount}
          isPresident={currentUser.role === 'president'}
          isTreasurer={currentUser.role === 'tresorier'}
          isAdministrative={currentUser.role === 'responsable_administratif'}
          accountingModel={profile.accountingModel}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          isArabic={isArabic}
        />
        </div>

        {/* Content Viewport */}
        <main className="flex-1 min-w-0 overflow-y-auto bg-slate-100">
          <div className="mobile-menu-bar md:hidden sticky top-0 z-30 flex items-center justify-between gap-3 bg-white border-b border-slate-200 px-3 py-2 shadow-sm">
            <button type="button" onClick={() => setIsMobileMenuOpen(true)} className="rounded-lg bg-slate-900 text-white px-4 py-2 text-sm font-semibold">{isArabic ? 'القائمة' : 'Menu'}</button>
            <span className="truncate text-sm font-semibold text-slate-700">{isArabic ? 'AYSM COMPTA' : 'AYSM COMPTA'}</span>
          </div>
          {currentUser.role === 'tresorier' && activeTab !== 'disbursements' && <div className="m-6 rounded-xl border border-amber-200 bg-amber-50 p-5 text-amber-900">حساب أمين المال مخصص لمراجعة طلبات الصرف والتأشير عليها فقط.</div>}
          {currentUser.role !== 'tresorier' && activeTab === 'dashboard' && (
            <Dashboard
              profile={profile}
              entries={entries}
              bankAccounts={bankAccounts}
              projects={projects}
              subventions={subventions}
              members={members}
              onNavigate={setActiveTab}
              onNewEntry={() => setActiveTab('entry-form')}
              isArabic={isArabic}
            />
          )}

          {currentUser.role !== 'tresorier' && activeTab === 'entry-form' && (
            <JournalEntryForm
              accounts={accounts}
              projects={projects}
              members={members}
              fiscalYear={profile.activeFiscalYear}
              onSaveEntry={handleSaveEntry}
              onCancel={() => setActiveTab('entries-list')}
            />
          )}

          {currentUser.role !== 'tresorier' && activeTab === 'entries-list' && (
            <EntriesList
              entries={entries}
              onExtourne={handleExtourne}
              onNewEntry={() => setActiveTab('entry-form')}
            />
          )}

          {currentUser.role !== 'tresorier' && activeTab === 'grand-livre' && (
            <GrandLivre
              entries={entries}
              accounts={accounts}
            />
          )}

          {currentUser.role !== 'tresorier' && activeTab === 'balance' && (
            <BalanceGenerale
              entries={entries}
              accounts={accounts}
            />
          )}

          {currentUser.role !== 'tresorier' && activeTab === 'chart-accounts' && (
            <ChartOfAccounts
              accounts={accounts}
              onUpdateAccounts={(accs) => {
                setAccounts(accs);
                StorageService.saveAccounts(accs);
              }}
            />
          )}

          {currentUser.role !== 'tresorier' && activeTab === 'recettes' && (
            <RecettesManager
              recettes={recettes}
              bankAccounts={bankAccounts}
              projects={projects}
              members={members}
              profile={profile}
              fiscalYear={profile.activeFiscalYear}
              onAddRecette={handleAddRecette}
            />
          )}

          {currentUser.role !== 'tresorier' && activeTab === 'depenses' && (
            <DepensesManager
              depenses={depenses}
              bankAccounts={bankAccounts}
              projects={projects}
              profile={profile}
              fiscalYear={profile.activeFiscalYear}
              onAddDepense={handleAddDepense}
            />
          )}

          {currentUser.role !== 'tresorier' && activeTab === 'treasury' && (
            <TreasuryManager
              bankAccounts={bankAccounts}
              entries={entries}
              fiscalYear={profile.activeFiscalYear}
              accounts={accounts}
              onUpdateBankAccounts={(accs) => {
                const clean = normalizeBankAccounts(accs);
                setBankAccounts(clean);
                StorageService.saveBankAccounts(clean);
              }}
              onAddInternalTransfer={(entry) => {
                const updated = StorageService.addEntry(entry);
                setEntries(updated);
              }}
            />
          )}

          {currentUser.role !== 'tresorier' && activeTab === 'subventions' && (
            <SubventionsManager
              subventions={subventions}
              projects={projects}
              fiscalYear={profile.activeFiscalYear}
              onAddSubvention={(sub) => {
                const updated = [sub, ...subventions];
                setSubventions(updated);
                StorageService.saveSubventions(updated);
              }}
              onNewEntry={() => setActiveTab('entry-form')}
            />
          )}

          {currentUser.role !== 'tresorier' && activeTab === 'projects' && (
            <ProjectsManager
              projects={projects}
              entries={entries}
              fiscalYear={profile.activeFiscalYear}
              onAddProject={(prj) => {
                const updated = [...projects, prj];
                setProjects(updated);
                StorageService.saveProjects(updated);
              }}
            />
          )}

          {currentUser.role !== 'tresorier' && activeTab === 'budgets' && (
            <BudgetManager
              budgets={budgets}
              projects={projects}
              fiscalYear={profile.activeFiscalYear}
              onUpdateBudgets={(bgts) => {
                setBudgets(bgts);
                StorageService.saveBudgets(bgts);
              }}
            />
          )}

          {currentUser.role !== 'tresorier' && activeTab === 'immobilisations' && (
            <ImmobilisationsManager
              immobilisations={immobilisations}
              fiscalYear={profile.activeFiscalYear}
              onUpdateImmobilisations={(immobs) => {
                setImmobilisations(immobs);
                StorageService.saveImmobilisations(immobs);
              }}
            />
          )}

          {currentUser.role !== 'tresorier' && activeTab === 'members' && (
            <MembersManager
              members={members}
              profile={profile}
              fiscalYear={profile.activeFiscalYear}
              onUpdateMembers={(mems) => {
                setMembers(mems);
                StorageService.saveMembers(mems);
              }}
            />
          )}

          {currentUser.role !== 'tresorier' && activeTab === 'in-kind' && (
            <InKindManager
              volunteers={volunteers}
              inKindContributions={inKind}
              fiscalYear={profile.activeFiscalYear}
              onUpdateVolunteers={(vols) => {
                setVolunteers(vols);
                StorageService.saveVolunteers(vols);
              }}
              onUpdateInKind={(ink) => {
                setInKind(ink);
                StorageService.saveInKind(ink);
              }}
              onAddClass0Entry={(entry) => {
                const updated = StorageService.addEntry(entry);
                setEntries(updated);
              }}
            />
          )}

          {currentUser.role !== 'tresorier' && activeTab === 'reports' && (
            <FinancialReports
              profile={profile}
              entries={entries}
              accounts={accounts}
              projects={projects}
              subventions={subventions}
              volunteers={volunteers}
              inKind={inKind}
              budgets={budgets}
            />
          )}

          {activeTab === 'disbursements' && (
            <DisbursementManager
              orders={disbursements}
              profile={profile}
              bankAccounts={bankAccounts}
              projects={projects}
              budgets={budgets}
              accounts={accounts}
              currentUser={currentUser}
              onUpdateOrders={setDisbursements}
              onRefreshAllData={handleRefreshAllData}
                    isArabic={isArabic}
            />
          )}

          {currentUser.role !== 'tresorier' && activeTab === 'documents' && (
            <DocumentsManager
              documents={documents}
              onUpdateDocuments={(docs) => {
                setDocuments(docs);
                StorageService.saveDocuments(docs);
              }}
            />
          )}

          {currentUser.role !== 'tresorier' && activeTab === 'sheets-integration' && (
            <GoogleSheetsIntegration />
          )}

          {activeTab === 'user-management' && currentUser.role === 'president' && <UserManagement />}

          {currentUser.role !== 'tresorier' && activeTab === 'settings' && (
            <AssociationSettings
              profile={profile}
              fiscalYears={fiscalYears}
              onUpdateProfile={handleUpdateProfile}
              onUpdateFiscalYears={handleUpdateFiscalYears}
              onResetAllData={handleResetAllData}
            />
          )}
        </main>
      </div>

      <InviteAcceptance />

      {/* Interactive Login Modal with Role Selector */}
      <UserLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        isArabic={isArabic}
      />
    </div>
  );
}
