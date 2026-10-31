/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ASSOCIATION COMPTA PRO - Application Complète de Comptabilité pour Associations Marocaines
 * Conforme au Plan Comptable des Associations du CNC (Avis n°23 de 2023) & Dahir 1958
 * Interface inspirée de SAGE 100
 */

import React, { useState, useEffect } from 'react';
import { StorageService } from './services/storageService';
import { AccountingEngine } from './services/accountingEngine';
import { AuthService } from './services/authService';
import { CloudDataService } from './services/cloudDataService';
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
  const [currentUser, setCurrentUser] = useState<AppAuthUser>(() => AuthService.getCurrentUser() || ({ id: '', username: '', name: '', nameArabic: '', email: '', role: 'pending', roleArabic: 'غير مسجل' } as AppAuthUser));
  const [disbursements, setDisbursements] = useState<DisbursementOrder[]>(() => StorageService.getDisbursements());
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(!AuthService.getCurrentUser());
  const [cloudReady, setCloudReady] = useState(false);
  const [cloudError, setCloudError] = useState('');
  const [isOnline, setIsOnline] = useState<boolean>(() => typeof navigator === 'undefined' ? true : navigator.onLine);

  useEffect(() => { const update = () => setIsOnline(navigator.onLine); window.addEventListener('online', update); window.addEventListener('offline', update); return () => { window.removeEventListener('online', update); window.removeEventListener('offline', update); }; }, []);

  // Hydrate every accounting module from Supabase after authentication. Demo seed records are never uploaded.
  useEffect(() => { let alive = true; AuthService.restoreSession().then(user => { if (!alive) return; if (user) { setCurrentUser(user); setIsLoginModalOpen(false); } else setIsLoginModalOpen(true); }).catch(() => { if (alive) setIsLoginModalOpen(true); }); return () => { alive = false; }; }, []);

  useEffect(() => {
    if (!currentUser.id || currentUser.role !== 'president') { setCloudReady(false); return; }
    let alive = true; setCloudReady(false); setCloudError('');
    setProfile({ ...profile, name: 'Association A.Y.S.M', arabicName: 'أكاديمية دعم ومواكبة الشباب', sigle: 'A.Y.S.M', address: '', city: 'Sidi Bibi', phone: '', email: 'Lahsencherkaoui2@gmail.com', website: '', ifFiscal: '', patente: '', cnss: '', ice: '', rib: '', bankName: '', agency: '', president: 'Lahsen Cherkaoui', treasurer: '', secretary: '', creationDate: '', receiptReceiptNumber: '', accountingModel: 'normal', activeFiscalYear: '2026', currency: 'MAD' });
    setFiscalYears([]); setAccounts(MOROCCAN_ASSOCIATION_ACCOUNTS); setEntries([]); setRecettes([]); setDepenses([]); setDisbursements([]); setBankAccounts([]); setProjects([]); setSubventions([]); setBudgets([]); setImmobilisations([]); setMembers([]); setDocuments([]); setVolunteers([]); setInKind([]);
    CloudDataService.loadAll().then(data => {
      if (!alive) return;
      const emptyProfile: AssociationProfile = { ...profile, name: 'Association A.Y.S.M', arabicName: 'أكاديمية دعم ومواكبة الشباب', sigle: 'A.Y.S.M', address: '', city: 'Sidi Bibi', phone: '', email: 'Lahsencherkaoui2@gmail.com', website: '', ifFiscal: '', patente: '', cnss: '', ice: '', rib: '', bankName: '', agency: '', president: 'Lahsen Cherkaoui', treasurer: '', secretary: '', creationDate: '', receiptReceiptNumber: '', accountingModel: 'normal', activeFiscalYear: '2026', currency: 'MAD' };
      setProfile((data.association_profile as AssociationProfile) || emptyProfile);
      setFiscalYears((data.fiscal_years as FiscalYear[]) || []);
      setAccounts((data.accounts as Account[]) || MOROCCAN_ASSOCIATION_ACCOUNTS);
      setEntries((data.entries as AccountingEntry[]) || []);
      setRecettes((data.recettes as Recette[]) || []);
      setDepenses((data.depenses as Depense[]) || []);
      setDisbursements((data.disbursements as DisbursementOrder[]) || []);
      setBankAccounts((data.bank_accounts as BankAccount[]) || []);
      setProjects((data.projects as Project[]) || []);
      setSubventions((data.subventions as Subvention[]) || []);
      setBudgets((data.budgets as BudgetItem[]) || []);
      setImmobilisations((data.immobilisations as Immobilisation[]) || []);
      setMembers((data.members as Member[]) || []);
      setDocuments((data.documents as DocumentArchive[]) || []);
      setVolunteers((data.volunteers as VolunteerWork[]) || []);
      setInKind((data.in_kind as InKindContribution[]) || []);
      setCloudReady(true);
    }).catch(error => { if (alive) setCloudError(error instanceof Error ? error.message : 'تعذر تحميل البيانات السحابية'); });
    return () => { alive = false; };
  }, [currentUser.id]);

  // Cloud is authoritative: every changed module is written to Supabase, never queued for offline sync.
  useEffect(() => {
    // Only the president may load or persist the legacy all-modules accounting snapshot.
    // Other roles must use narrowly-scoped workflow endpoints, never app_records.
    if (!cloudReady || !currentUser.id || currentUser.role !== 'president') return;
    const payload = { association_profile: profile, fiscal_years: fiscalYears, accounts, entries, recettes, depenses, disbursements, bank_accounts: bankAccounts, projects, subventions, budgets, immobilisations, members, documents, volunteers, in_kind: inKind };
    let cancelled = false;
    const timer = window.setTimeout(() => {
      CloudDataService.saveAll(payload).then(() => { if (!cancelled) setCloudError(''); }).catch(error => { if (!cancelled) setCloudError(error instanceof Error ? error.message : 'فشل حفظ البيانات في السحابة'); });
    }, 700);
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, [cloudReady, currentUser.id, profile, fiscalYears, accounts, entries, recettes, depenses, disbursements, bankAccounts, projects, subventions, budgets, immobilisations, members, documents, volunteers, inKind]);

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
  const totalCash = bankAccounts.reduce((sum, b) => sum + b.currentBalance, 0);

  // Handlers
  const handleSaveEntry = (newEntry: AccountingEntry) => {
    const updated = StorageService.addEntry(newEntry);
    setEntries(updated);

    // Update bank balance if cash/bank affected
    newEntry.lines.forEach(line => {
      const bank = bankAccounts.find(b => b.accountNumber === line.accountNumber);
      if (bank) {
        const netChange = (line.debit || 0) - (line.credit || 0);
        const updatedAccounts = bankAccounts.map(b =>
          b.id === bank.id ? { ...b, currentBalance: b.currentBalance + netChange } : b
        );
        setBankAccounts(updatedAccounts);
        StorageService.saveBankAccounts(updatedAccounts);
      }
    });

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
    originalEntry.lines.forEach(line => {
      const bank = bankAccounts.find(b => b.accountNumber === line.accountNumber);
      if (bank) {
        const reversedChange = (line.credit || 0) - (line.debit || 0);
        const updatedAccounts = bankAccounts.map(b =>
          b.id === bank.id ? { ...b, currentBalance: b.currentBalance + reversedChange } : b
        );
        setBankAccounts(updatedAccounts);
        StorageService.saveBankAccounts(updatedAccounts);
      }
    });

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
    setCloudReady(false); setCurrentUser(user);
  };

  const handleRefreshAllData = () => {
    setEntries(StorageService.getEntries());
    setBankAccounts(StorageService.getBankAccounts());
    setProjects(StorageService.getProjects());
    setBudgets(StorageService.getBudgets());
    setDepenses(StorageService.getDepenses());
    setDisbursements(StorageService.getDisbursements());
  };

  const handleResetAllData = () => {
    alert('استعادة البيانات التجريبية معطلة في النسخة السحابية لحماية بيانات الجمعية.');
  };

  // Calcul des demandes en attente selon le rôle connecté
  const pendingDisbursementsCount =
    currentUser.role === 'tresorier'
      ? disbursements.filter(d => d.status === 'en_attente_tresorier').length
      : currentUser.role === 'president'
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
      {currentUser.id && (cloudError ? <div className="bg-rose-100 text-rose-800 text-sm p-3 text-center">{cloudError}</div> : !cloudReady ? <div className="bg-amber-100 text-amber-900 text-sm p-3 text-center">جار تحميل بيانات الجمعية من قاعدة البيانات...</div> : <div className="bg-emerald-50 text-emerald-800 text-xs p-2 text-center">متصل بقاعدة البيانات السحابية — الحفظ مباشر عبر الإنترنت</div>)}
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
          {activeTab === 'dashboard' && (
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

          {activeTab === 'entry-form' && (
            <JournalEntryForm
              accounts={accounts}
              projects={projects}
              members={members}
              fiscalYear={profile.activeFiscalYear}
              onSaveEntry={handleSaveEntry}
              onCancel={() => setActiveTab('entries-list')}
            />
          )}

          {activeTab === 'entries-list' && (
            <EntriesList
              entries={entries}
              onExtourne={handleExtourne}
              onNewEntry={() => setActiveTab('entry-form')}
            />
          )}

          {activeTab === 'grand-livre' && (
            <GrandLivre
              entries={entries}
              accounts={accounts}
            />
          )}

          {activeTab === 'balance' && (
            <BalanceGenerale
              entries={entries}
              accounts={accounts}
            />
          )}

          {activeTab === 'chart-accounts' && (
            <ChartOfAccounts
              accounts={accounts}
              onUpdateAccounts={(accs) => {
                setAccounts(accs);
                StorageService.saveAccounts(accs);
              }}
            />
          )}

          {activeTab === 'recettes' && (
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

          {activeTab === 'depenses' && (
            <DepensesManager
              depenses={depenses}
              bankAccounts={bankAccounts}
              projects={projects}
              profile={profile}
              fiscalYear={profile.activeFiscalYear}
              onAddDepense={handleAddDepense}
            />
          )}

          {activeTab === 'treasury' && (
            <TreasuryManager
              bankAccounts={bankAccounts}
              entries={entries}
              fiscalYear={profile.activeFiscalYear}
              onUpdateBankAccounts={(accs) => {
                setBankAccounts(accs);
                StorageService.saveBankAccounts(accs);
              }}
              onAddInternalTransfer={(entry) => {
                const updated = StorageService.addEntry(entry);
                setEntries(updated);
              }}
            />
          )}

          {activeTab === 'subventions' && (
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

          {activeTab === 'projects' && (
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

          {activeTab === 'budgets' && (
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

          {activeTab === 'immobilisations' && (
            <ImmobilisationsManager
              immobilisations={immobilisations}
              fiscalYear={profile.activeFiscalYear}
              onUpdateImmobilisations={(immobs) => {
                setImmobilisations(immobs);
                StorageService.saveImmobilisations(immobs);
              }}
            />
          )}

          {activeTab === 'members' && (
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

          {activeTab === 'in-kind' && (
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

          {activeTab === 'reports' && (
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

          {activeTab === 'documents' && (
            <DocumentsManager
              documents={documents}
              onUpdateDocuments={(docs) => {
                setDocuments(docs);
                StorageService.saveDocuments(docs);
              }}
            />
          )}

          {activeTab === 'sheets-integration' && (
            <GoogleSheetsIntegration />
          )}

          {activeTab === 'settings' && (
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
