/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Système de Gestion des Décaissements, Ordres de Paiement et Approbations Hiérarchiques
 * Dédié à : جمعية شباب الغد للتنمية والتعاون
 * Conforme aux normes SAGE 100 et au Plan Comptable des Associations Marocaines (CNC 2023)
 */

import React, { useState } from 'react';
import {
  FileText,
  PlusCircle,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  RotateCcw,
  Printer,
  Eye,
  Paperclip,
  Check,
  Send,
  Building2,
  Wallet,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  User,
  History,
  Download,
  AlertCircle,
  TrendingDown
} from 'lucide-react';
import {
  DisbursementOrder,
  DisbursementStatus,
  AssociationProfile,
  BankAccount,
  Project,
  BudgetItem,
  AppAuthUser,
  Account,
  AccountingEntry
} from '../types/accounting';
import { AuthService } from '../services/authService';
import { StorageService } from '../services/storageService';
import { AccountingEngine } from '../services/accountingEngine';
import { CloudDataService } from '../services/cloudDataService';
import { numberToArabicWords } from '../utils/numberToWordsArabic';
import { DisbursementVoucherModal } from './DisbursementVoucherModal';

interface DisbursementManagerProps {
  orders: DisbursementOrder[];
  profile: AssociationProfile;
  bankAccounts: BankAccount[];
  projects: Project[];
  budgets: BudgetItem[];
  accounts: Account[];
  currentUser: AppAuthUser;
  onUpdateOrders: (orders: DisbursementOrder[]) => void;
  onRefreshAllData: () => void;
  isArabic?: boolean;
}

export const DisbursementManager: React.FC<DisbursementManagerProps> = ({
  orders,
  profile,
  bankAccounts,
  projects,
  budgets,
  accounts,
  currentUser,
  onUpdateOrders,
  onRefreshAllData,
  isArabic = false
}) => {
  // Navigation & Filtering
  const [activeTabFilter, setActiveTabFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedProjectFilter, setSelectedProjectFilter] = useState<string>('all');

  // Modals state
  const [isNewModalOpen, setIsNewModalOpen] = useState<boolean>(false);
  const [reviewOrder, setReviewOrder] = useState<DisbursementOrder | null>(null);
  const [executeOrder, setExecuteOrder] = useState<DisbursementOrder | null>(null);
  const [timelineOrder, setTimelineOrder] = useState<DisbursementOrder | null>(null);
  const [printOrder, setPrintOrder] = useState<DisbursementOrder | null>(null);

  // New request form state
  const [formData, setFormData] = useState({
    beneficiary: '',
    cinOrIce: '',
    subject: '',
    amount: '',
    projectId: projects[0]?.id || '',
    budgetItemId: budgets.find(b => b.type === 'depense')?.id || '',
    accountNumber: '6128',
    proposedPaymentMethod: 'cheque' as 'especes' | 'cheque' | 'virement',
    notesAdministrative: '',
    attachmentName: '',
    attachmentSize: ''
  });

  // Treasurer Review form state
  const [treasurerDecision, setTreasurerDecision] = useState<'approuve' | 'rejete' | 'a_completer'>('approuve');
  const [treasurerNotes, setTreasurerNotes] = useState('');

  // President Execution form state
  const [actualPaymentMethod, setActualPaymentMethod] = useState<'especes' | 'cheque' | 'virement'>('cheque');
  const [selectedBankAccountId, setSelectedBankAccountId] = useState<string>(bankAccounts[0]?.id || '');
  const [checkNumber, setCheckNumber] = useState('');
  const [transferReference, setTransferReference] = useState('');
  const [paymentProofName, setPaymentProofName] = useState('');
  const [executionNotes, setExecutionNotes] = useState('');

  // Filtering calculations
  const filteredOrders = orders.filter(o => {
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.beneficiary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.accountingPieceNumber && o.accountingPieceNumber.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesProject = selectedProjectFilter === 'all' || o.projectId === selectedProjectFilter;

    let matchesTab = true;
    if (activeTabFilter === 'pending_treasurer') matchesTab = o.status === 'en_attente_tresorier';
    else if (activeTabFilter === 'pending_president') matchesTab = o.status === 'en_attente_president' || o.status === 'approuve_tresorier';
    else if (activeTabFilter === 'executed') matchesTab = o.status === 'execute';
    else if (activeTabFilter === 'needs_info') matchesTab = o.status === 'a_completer';
    else if (activeTabFilter === 'draft_rejected') matchesTab = o.status === 'brouillon' || o.status === 'rejete' || o.status === 'annule';

    return matchesSearch && matchesProject && matchesTab;
  });

  // KPI statistics
  const totalRequested = orders.reduce((s, o) => s + o.amount, 0);
  const pendingTreasurerOrders = orders.filter(o => o.status === 'en_attente_tresorier');
  const pendingPresidentOrders = orders.filter(o => o.status === 'en_attente_president' || o.status === 'approuve_tresorier');
  const executedOrders = orders.filter(o => o.status === 'execute');
  const totalExecutedAmount = executedOrders.reduce((s, o) => s + o.amount, 0);

  // Status badge styling helper
  const getStatusBadge = (status: DisbursementStatus) => {
    switch (status) {
      case 'brouillon':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-300">مسودة</span>;
      case 'en_attente_tresorier':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-300 flex items-center gap-1"><Clock className="w-3 h-3" /> في انتظار أمين المال</span>;
      case 'approuve_tresorier':
      case 'en_attente_president':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-sky-50 text-sky-800 border border-sky-300 flex items-center gap-1"><UserCheck className="w-3 h-3" /> في انتظار أمر الرئيس</span>;
      case 'execute':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> تم الصرف والتسجيل</span>;
      case 'a_completer':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-orange-50 text-orange-800 border border-orange-300 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> استكمال وثائق</span>;
      case 'rejete':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-800 border border-rose-300 flex items-center gap-1"><XCircle className="w-3 h-3" /> مرفوض</span>;
      case 'annule':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">ملغى</span>;
      default:
        return null;
    }
  };

  // Handlers: Create new request
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(formData.amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert('المرجو إدخال مبلغ صحيح.');
      return;
    }

    const nextCount = orders.length + 1;
    const orderNumber = `ORD-${profile.activeFiscalYear}-${String(nextCount).padStart(3, '0')}`;
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const targetProject = projects.find(p => p.id === formData.projectId);
    const targetBudget = budgets.find(b => b.id === formData.budgetItemId);

    const newOrder: DisbursementOrder = {
      id: `ord-${Date.now()}`,
      orderNumber,
      date: timestamp.split(' ')[0],
      fiscalYear: profile.activeFiscalYear,
      beneficiary: formData.beneficiary.trim(),
      cinOrIce: formData.cinOrIce.trim() || undefined,
      subject: formData.subject.trim(),
      amount: numAmount,
      amountInWords: numberToArabicWords(numAmount),
      projectId: formData.projectId || undefined,
      projectTitle: targetProject ? targetProject.title : undefined,
      budgetItemId: formData.budgetItemId || undefined,
      budgetItemCategory: targetBudget ? targetBudget.category : undefined,
      accountNumber: formData.accountNumber,
      proposedPaymentMethod: formData.proposedPaymentMethod,
      notesAdministrative: formData.notesAdministrative.trim() || undefined,
      attachments: formData.attachmentName ? [
        {
          id: `att-${Date.now()}`,
          name: formData.attachmentName,
          type: 'application/pdf',
          size: formData.attachmentSize || '350 KB',
          uploadedAt: timestamp
        }
      ] : [],
      status: 'en_attente_tresorier',
      createdById: currentUser.id,
      createdByRole: currentUser.role,
      createdByName: currentUser.name,
      createdAt: timestamp,
      isExecutedAccounting: false,
      history: [
        {
          id: `hist-${Date.now()}`,
          timestamp,
          status: 'en_attente_tresorier',
          action: 'Création et soumission au Trésorier',
          actionArabic: 'إنشاء وإحالة طلب الصرف إلى أمين المال',
          userName: currentUser.name,
          userRole: currentUser.role,
          notes: formData.notesAdministrative || 'طلب صادر ومرفق بالوثائق التبريرية.'
        }
      ],
      updatedAt: timestamp
    };

    try {
      const savedOrder = await CloudDataService.createDisbursementOrder(newOrder);
      onUpdateOrders([savedOrder, ...orders]);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'تعذر حفظ طلب الصرف سحابياً.');
      return;
    }
    setIsNewModalOpen(false);
    setFormData({
      beneficiary: '',
      cinOrIce: '',
      subject: '',
      amount: '',
      projectId: projects[0]?.id || '',
      budgetItemId: budgets.find(b => b.type === 'depense')?.id || '',
      accountNumber: '6128',
      proposedPaymentMethod: 'cheque',
      notesAdministrative: '',
      attachmentName: '',
      attachmentSize: ''
    });
    alert(`تم إنشاء طلب الصرف ${orderNumber} وإحالته إلى أمين المال للمراجعة.`);
  };

  // Handlers: Treasurer Review
  const handleTreasurerSubmit = async (e: React.FormEvent) => {
    if (currentUser.role !== 'tresorier') { alert('هذه الصلاحية مخصصة لأمين المال فقط.'); return; }
    e.preventDefault();
    if (!reviewOrder) return;

    // Check separation of duties
    const check = AuthService.canApproveAsTreasurer(currentUser, reviewOrder);
    if (!check.allowed && treasurerDecision === 'approuve') {
      alert(check.reason);
      return;
    }

    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    let nextStatus: DisbursementStatus = 'approuve_tresorier';
    let actionLabel = 'Approbation par le Trésorier';
    let actionArabic = 'تأشيرة وموافقة أمين المال';

    if (treasurerDecision === 'rejete') {
      nextStatus = 'rejete';
      actionLabel = 'Rejet par le Trésorier';
      actionArabic = 'رفض الطلب من طرف أمين المال';
    } else if (treasurerDecision === 'a_completer') {
      nextStatus = 'a_completer';
      actionLabel = 'Demande de complément d\'information';
      actionArabic = 'إرجاع الطلب للمسؤول الإداري لاستكمال الوثائق والمعلومات';
    } else {
      nextStatus = 'approuve_tresorier';
    }

    const updatedOrder: DisbursementOrder = {
      ...reviewOrder,
      status: nextStatus,
      treasurerReviewDate: timestamp,
      treasurerId: currentUser.id,
      treasurerName: currentUser.name,
      treasurerDecision,
      treasurerNotes: treasurerNotes.trim() || undefined,
      history: [
        ...reviewOrder.history,
        {
          id: `hist-${Date.now()}`,
          timestamp,
          status: nextStatus,
          action: actionLabel,
          actionArabic,
          userName: currentUser.name,
          userRole: currentUser.role,
          notes: treasurerNotes.trim() || undefined
        }
      ],
      updatedAt: timestamp
    };

    try {
      const decision = treasurerDecision === 'approuve' ? 'approuve_tresorier' : treasurerDecision;
      await CloudDataService.decideDisbursementOrder(reviewOrder.id, decision, treasurerNotes.trim());
      onUpdateOrders(orders.map(order => order.id === reviewOrder.id ? updatedOrder : order));
    } catch (error) {
      alert(error instanceof Error ? error.message : 'تعذر تسجيل قرار أمين المال سحابياً.');
      return;
    }
    setReviewOrder(null);
    setTreasurerNotes('');
    alert(
      nextStatus === 'approuve_tresorier'
        ? `تمت موافقة أمين المال على طلب الصرف ${reviewOrder.orderNumber} وإحالته إلى الرئيس.`
        : nextStatus === 'a_completer'
        ? `تم إرجاع الطلب ${reviewOrder.orderNumber} إلى المسؤول الإداري لاستكمال الوثائق.`
        : `تم رفض الطلب ${reviewOrder.orderNumber}.`
    );
  };

  // Handlers: President Execution
  const handlePresidentSubmit = (e: React.FormEvent) => {
    if (currentUser.role !== 'president') { alert('تنفيذ الصرف مخصص لرئيس الجمعية فقط.'); return; }
    e.preventDefault();
    if (!executeOrder) return;

    const check = AuthService.canExecuteAsPresident(currentUser, executeOrder);
    if (!check.allowed) {
      alert(check.reason);
      return;
    }

    if (actualPaymentMethod === 'cheque' && !checkNumber.trim()) {
      alert('المرجو إدخال رقم الشيك البنكي.');
      return;
    }

    if (actualPaymentMethod === 'virement' && !transferReference.trim()) {
      alert('المرجو إدخال مرجع التحويل البنكي.');
      return;
    }

    // Safe release gate: the current server RPC records authorization only.
    // It does not atomically create the journal entry or update bank/project balances.
    // Never fall back to browser-side accounting execution.
    alert('تنفيذ الصرف موقوف مؤقتاً: يلزم أولاً ربط موافقة الرئيس بقيد محاسبي وتحديث الأرصدة داخل معاملة واحدة آمنة في قاعدة البيانات.');
    return;
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Role Banner & Persona Switcher */}
      <div className="bg-slate-900 text-white rounded-xl p-4 shadow-sm border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-md">
            {currentUser.avatar}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-tight text-white">{currentUser.nameArabic}</span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-900 text-sky-200 border border-blue-700 font-semibold">
                {currentUser.roleArabic}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              جمعية شباب الغد للتنمية والتعاون – نظام تدبير الصرف والموافقات بمبدأ فصل المهام
            </p>
          </div>
        </div>

      </div>

      {/* Header & Main Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-700" />
            <span>تدبير عمليات الصرف وأوامر الأداء المالي</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200">
              دورة موافقات ثلاثية
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            المسؤول الإداري (إنشاء) ← أمين المال (تأشيرة واعتماد) ← رئيس الجمعية (أمر بالأداء وتسجيل محاسبي)
          </p>
        </div>

        <div className="flex items-center gap-2">
          {AuthService.canCreateDisbursement(currentUser) && (
            <button
              onClick={() => setIsNewModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded bg-blue-700 hover:bg-blue-600 text-white shadow-sm transition-colors cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>طلب صرف جديد (المسؤول الإداري)</span>
            </button>
          )}
        </div>
      </div>

      {/* Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Requested */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">إجمالي الطلبات</span>
            <div className="p-2 rounded-md bg-slate-100 text-slate-700">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xl font-bold font-mono text-slate-900">
              {AccountingEngine.formatMAD(totalRequested)}
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            <span>العدد الإجمالي: {orders.length} طلب</span>
          </div>
        </div>

        {/* Pending Treasurer */}
        <div className="bg-white p-4 rounded-lg border border-amber-200 shadow-xs bg-amber-50/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-800 uppercase tracking-wide">في انتظار أمين المال</span>
            <div className="p-2 rounded-md bg-amber-100 text-amber-700">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xl font-bold font-mono text-amber-900">
              {AccountingEngine.formatMAD(pendingTreasurerOrders.reduce((s, o) => s + o.amount, 0))}
            </span>
          </div>
          <div className="mt-2 text-xs text-amber-700 font-semibold">
            <span>{pendingTreasurerOrders.length} طلب يتطلب المراجعة</span>
          </div>
        </div>

        {/* Pending President */}
        <div className="bg-white p-4 rounded-lg border border-sky-200 shadow-xs bg-sky-50/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-sky-800 uppercase tracking-wide">في انتظار أمر الرئيس</span>
            <div className="p-2 rounded-md bg-sky-100 text-sky-700">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xl font-bold font-mono text-sky-900">
              {AccountingEngine.formatMAD(pendingPresidentOrders.reduce((s, o) => s + o.amount, 0))}
            </span>
          </div>
          <div className="mt-2 text-xs text-sky-700 font-semibold">
            <span>{pendingPresidentOrders.length} طلب جاهز للتنفيذ</span>
          </div>
        </div>

        {/* Executed & Accounted */}
        <div className="bg-white p-4 rounded-lg border border-emerald-200 shadow-xs bg-emerald-50/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wide">تم الصرف والتسجيل</span>
            <div className="p-2 rounded-md bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xl font-bold font-mono text-emerald-900">
              {AccountingEngine.formatMAD(totalExecutedAmount)}
            </span>
          </div>
          <div className="mt-2 text-xs text-emerald-700 font-semibold">
            <span>{executedOrders.length} مصروف مقيد محاسبياً</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs space-y-3 text-xs">
        {/* Tabs */}
        <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 pb-2">
          <button
            onClick={() => setActiveTabFilter('all')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
              activeTabFilter === 'all'
                ? 'bg-blue-700 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            جميع الطلبات ({orders.length})
          </button>
          <button
            onClick={() => setActiveTabFilter('pending_treasurer')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTabFilter === 'pending_treasurer'
                ? 'bg-amber-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>في انتظار أمين المال</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-100 text-amber-800 font-bold">
              {pendingTreasurerOrders.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTabFilter('pending_president')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTabFilter === 'pending_president'
                ? 'bg-sky-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>في انتظار أمر الرئيس</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-sky-100 text-sky-800 font-bold">
              {pendingPresidentOrders.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTabFilter('executed')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTabFilter === 'executed'
                ? 'bg-emerald-700 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>تم الصرف بالكامل</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-bold">
              {executedOrders.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTabFilter('needs_info')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTabFilter === 'needs_info'
                ? 'bg-orange-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>استكمال وثائق ({orders.filter(o => o.status === 'a_completer').length})</span>
          </button>
        </div>

        {/* Search & Project filter */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="البحث برقم الطلب، المستفيد، الغرض، أو رقم القيد..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="font-semibold text-slate-600">المشروع:</label>
            <select
              value={selectedProjectFilter}
              onChange={(e) => setSelectedProjectFilter(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">جميع المشاريع والأنشطة</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.code} - {p.title.substring(0, 35)}...</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* SAGE 100 Data Grid */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-900 text-white font-semibold">
              <tr>
                <th className="py-2.5 px-3 w-28">رقم الطلب</th>
                <th className="py-2.5 px-3 w-24">التاريخ</th>
                <th className="py-2.5 px-3">المستفيد</th>
                <th className="py-2.5 px-3">موضوع الصرف</th>
                <th className="py-2.5 px-3">المشروع</th>
                <th className="py-2.5 px-3 text-right w-28">المبلغ (DH)</th>
                <th className="py-2.5 px-3 text-center w-28">طريقة الأداء</th>
                <th className="py-2.5 px-3 text-center w-36">الحالة</th>
                <th className="py-2.5 px-3 text-center w-28">القيد المحاسبي</th>
                <th className="py-2.5 px-3 text-center w-36">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400">
                    لا توجد طلبات صرف مطابقة لمعايير البحث.
                  </td>
                </tr>
              ) : (
                filteredOrders.map(order => {
                  const canTreasurerReview =
                    currentUser.role === 'tresorier' &&
                    order.status === 'en_attente_tresorier';

                  const canPresidentExecute =
                    currentUser.role === 'president' &&
                    (order.status === 'en_attente_president' || order.status === 'approuve_tresorier' || order.status === 'en_attente_tresorier') &&
                    !order.isExecutedAccounting;

                  return (
                    <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-bold text-blue-700">
                        {order.orderNumber}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 font-mono">
                        {order.date}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-800">
                        {order.beneficiary}
                      </td>
                      <td className="py-2.5 px-3 text-slate-700 max-w-xs truncate" title={order.subject}>
                        {order.subject}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 truncate max-w-[140px]">
                        {order.projectTitle || 'نشاط عام'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                        {AccountingEngine.formatMAD(order.amount)}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="px-1.5 py-0.5 rounded text-[10px] uppercase font-semibold bg-slate-100 text-slate-700">
                          {order.actualPaymentMethod || order.proposedPaymentMethod}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono">
                        {order.accountingPieceNumber ? (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {order.accountingPieceNumber}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[10px]">غير مقيد</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Treasurer Review Button */}
                          {canTreasurerReview && (
                            <button
                              onClick={() => {
                                setReviewOrder(order);
                                setTreasurerDecision('approuve');
                                setTreasurerNotes('');
                              }}
                              className="px-2 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded text-[11px] font-semibold shadow-xs cursor-pointer"
                              title="فحص وتأشيرة أمين المال"
                            >
                              فحص واعتماد
                            </button>
                          )}

                          {/* President Execute Button */}
                          {canPresidentExecute && (
                            <button
                              onClick={() => {
                                setExecuteOrder(order);
                                setActualPaymentMethod(order.proposedPaymentMethod);
                                setSelectedBankAccountId(bankAccounts[0]?.id || '');
                                setCheckNumber('');
                                setTransferReference('');
                                setPaymentProofName('');
                                setExecutionNotes('');
                              }}
                              className="px-2 py-1 bg-emerald-700 hover:bg-emerald-600 text-white rounded text-[11px] font-semibold shadow-xs cursor-pointer"
                              title="تنفيذ الصرف وأمر الأداء"
                            >
                              أمر بالصرف
                            </button>
                          )}

                          {/* Print Official Voucher */}
                          <button
                            onClick={() => setPrintOrder(order)}
                            className="p-1 text-slate-500 hover:text-blue-700 hover:bg-slate-100 rounded cursor-pointer"
                            title="طباعة سند الصرف والأمر بالأداء"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>

                          {/* View Audit Timeline */}
                          <button
                            onClick={() => setTimelineOrder(order)}
                            className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded cursor-pointer"
                            title="سجل التتبع والمراقبة"
                          >
                            <History className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: Create New Request (المسؤول الإداري) */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-300 max-w-2xl w-full my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-sm">إنشاء طلب صرف جديد (المسؤول الإداري)</h3>
              </div>
              <button onClick={() => setIsNewModalOpen(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">اسم المستفيد (Fournisseur / Bénéficiaire) *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: مطبعة النجاح، شركة الأطلس..."
                    value={formData.beneficiary}
                    onChange={(e) => setFormData({ ...formData, beneficiary: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">التعريف الموحد للمقاولة أو ب.ت.و (ICE / CIN)</label>
                  <input
                    type="text"
                    placeholder="مثال: 001928374000081"
                    value={formData.cinOrIce}
                    onChange={(e) => setFormData({ ...formData, cinOrIce: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">موضوع الصرف والغرض منه *</label>
                  <input
                    type="text"
                    required
                    placeholder="بيان تفصيلي للنفقة، مثال: كراء حافلة، طباعة كتيبات..."
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">المبلغ الصافي بالأرقام (درهم مغربي) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    placeholder="مثال: 4500"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded font-mono font-bold text-slate-900 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">طريقة الأداء المقترحة</label>
                  <select
                    value={formData.proposedPaymentMethod}
                    onChange={(e) => setFormData({ ...formData, proposedPaymentMethod: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded bg-white focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="cheque">شيك بنكي (Chèque)</option>
                    <option value="virement">تحويل بنكي (Virement)</option>
                    <option value="especes">نقداً عبر الصندوق (Caisse)</option>
                  </select>
                </div>

                {/* Amount in words live preview */}
                {formData.amount && parseFloat(formData.amount) > 0 && (
                  <div className="sm:col-span-2 bg-blue-50 p-2.5 rounded border border-blue-200">
                    <span className="text-[10px] text-blue-900 font-bold block">المبلغ بالحروف (تلقائي) :</span>
                    <span className="text-xs font-bold text-blue-950 block mt-0.5">
                      {numberToArabicWords(parseFloat(formData.amount))}
                    </span>
                  </div>
                )}

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">المشروع أو النشاط المرتبط</label>
                  <select
                    value={formData.projectId}
                    onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded bg-white focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">-- نشاط جمعوي عام --</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.code} - {p.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">بند الميزانية التقديرية</label>
                  <select
                    value={formData.budgetItemId}
                    onChange={(e) => setFormData({ ...formData, budgetItemId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded bg-white focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">-- بند عام --</option>
                    {budgets.filter(b => b.type === 'depense').map(b => (
                      <option key={b.id} value={b.id}>{b.category} - {b.subCategory}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">الحساب المحاسبي التوجيهي (CNC)</label>
                  <select
                    value={formData.accountNumber}
                    onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded bg-white font-mono focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="6128">6128 - Achats de fournitures et matières</option>
                    <option value="6131">6131 - Locations et charges locatives</option>
                    <option value="6141">6141 - Frais de déplacements et missions</option>
                    <option value="6147">6147 - Honoraires et prestations externes</option>
                    <option value="6121">6121 - Achats consommés de produits</option>
                    <option value="6181">6181 - Aides et actions caritatives directes</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">الوثيقة التبريرية (فاتورة / بيان تقديري)</label>
                  <input
                    type="text"
                    placeholder="اسم الملف، مثال: Facture_F2026_01.pdf"
                    value={formData.attachmentName}
                    onChange={(e) => setFormData({ ...formData, attachmentName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">ملاحظات إدارية وتوضيحات إضافية</label>
                  <textarea
                    rows={2}
                    placeholder="ملاحظات المسؤول الإداري الموجهة لأمين المال ورئيس الجمعية..."
                    value={formData.notesAdministrative}
                    onChange={(e) => setFormData({ ...formData, notesAdministrative: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500"
                  ></textarea>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-600 text-white rounded font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Send className="w-4 h-4" />
                  <span>إرسال الطلب إلى أمين المال للموافقة</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Treasurer Review & Approval (أمين المال) */}
      {reviewOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-300 max-w-xl w-full my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-amber-800 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-300" />
                <h3 className="font-bold text-sm">مراجعة وتأشيرة أمين المال - {reviewOrder.orderNumber}</h3>
              </div>
              <button onClick={() => setReviewOrder(null)} className="text-amber-200 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleTreasurerSubmit} className="p-6 space-y-4 text-xs">
              {/* Order Recap */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-slate-500">المستفيد:</span>
                  <span className="font-bold text-slate-900">{reviewOrder.beneficiary}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-slate-500">المبلغ المطلوب:</span>
                  <span className="font-bold font-mono text-blue-900 text-sm">
                    {AccountingEngine.formatMAD(reviewOrder.amount)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-slate-500">المشروع المرتبط:</span>
                  <span className="font-medium text-slate-800">{reviewOrder.projectTitle || 'نشاط عام'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-slate-500">الغرض من الصرف:</span>
                  <span className="text-slate-800">{reviewOrder.subject}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                  <span className="font-semibold text-slate-500">الوثائق المرفقة:</span>
                  <span className="text-blue-700 font-semibold">{reviewOrder.attachments.length} وثيقة مرفقة</span>
                </div>
              </div>

              {/* Decision Radio Selector */}
              <div>
                <label className="block font-semibold text-slate-700 mb-2">قرار أمين المال :</label>
                <div className="grid grid-cols-3 gap-2">
                  <label className={`p-3 rounded-lg border cursor-pointer text-center flex flex-col items-center gap-1 ${
                    treasurerDecision === 'approuve'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}>
                    <input
                      type="radio"
                      name="decision"
                      value="approuve"
                      checked={treasurerDecision === 'approuve'}
                      onChange={() => setTreasurerDecision('approuve')}
                      className="sr-only"
                    />
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>تأشيرة وموافقة</span>
                  </label>

                  <label className={`p-3 rounded-lg border cursor-pointer text-center flex flex-col items-center gap-1 ${
                    treasurerDecision === 'a_completer'
                      ? 'border-orange-500 bg-orange-50 text-orange-900 font-bold'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}>
                    <input
                      type="radio"
                      name="decision"
                      value="a_completer"
                      checked={treasurerDecision === 'a_completer'}
                      onChange={() => setTreasurerDecision('a_completer')}
                      className="sr-only"
                    />
                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                    <span>طلب استكمال</span>
                  </label>

                  <label className={`p-3 rounded-lg border cursor-pointer text-center flex flex-col items-center gap-1 ${
                    treasurerDecision === 'rejete'
                      ? 'border-rose-500 bg-rose-50 text-rose-900 font-bold'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}>
                    <input
                      type="radio"
                      name="decision"
                      value="rejete"
                      checked={treasurerDecision === 'rejete'}
                      onChange={() => setTreasurerDecision('rejete')}
                      className="sr-only"
                    />
                    <XCircle className="w-5 h-5 text-rose-600" />
                    <span>رفض الطلب</span>
                  </label>
                </div>
              </div>

              {/* Justification & Notes */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  ملاحظات وتبريرات أمين المال {treasurerDecision !== 'approuve' && <span className="text-rose-600">*</span>} :
                </label>
                <textarea
                  required={treasurerDecision !== 'approuve'}
                  rows={3}
                  placeholder={
                    treasurerDecision === 'approuve'
                      ? 'تأكيد توفر الاعتماد المالي ومطابقة الوثائق...'
                      : 'بيان أسباب الرفض أو الوثائق الناقصة المطلوبة بدقة...'
                  }
                  value={treasurerNotes}
                  onChange={(e) => setTreasurerNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-amber-500"
                ></textarea>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReviewOrder(null)}
                  className="px-4 py-2 border border-slate-300 rounded text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-700 hover:bg-amber-600 text-white rounded font-semibold cursor-pointer shadow-sm"
                >
                  تأكيد القرار وإرسال الإشعار
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: President Execution & Automated Accounting Booking (الرئيس) */}
      {executeOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-300 max-w-xl w-full my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-emerald-800 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-emerald-300" />
                <h3 className="font-bold text-sm">أمر بالأداء وتنفيذ الصرف والتسجيل المحاسبي (الرئيس)</h3>
              </div>
              <button onClick={() => setExecuteOrder(null)} className="text-emerald-200 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handlePresidentSubmit} className="p-6 space-y-4 text-xs">
              {/* Order Recap */}
              <div className="bg-emerald-50/50 p-4 rounded-lg border border-emerald-200 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-slate-600">رقم الطلب:</span>
                  <span className="font-bold font-mono text-emerald-950">{executeOrder.orderNumber}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-slate-600">المستفيد:</span>
                  <span className="font-bold text-slate-900">{executeOrder.beneficiary}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-slate-600">المبلغ الواجب أداؤه:</span>
                  <span className="font-bold font-mono text-emerald-900 text-base">
                    {AccountingEngine.formatMAD(executeOrder.amount)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-slate-600">تأشيرة أمين المال:</span>
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> مؤشر عليه بالموافقة ({executeOrder.treasurerName})
                  </span>
                </div>
              </div>

              {/* Payment Details */}
              <div className="space-y-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">الحساب المخصوم منه (Banque / Caisse) *</label>
                  <select
                    value={selectedBankAccountId}
                    onChange={(e) => setSelectedBankAccountId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded bg-white font-medium focus:ring-1 focus:ring-emerald-500"
                  >
                    {bankAccounts.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.name} - رصيد متاح: {AccountingEngine.formatMAD(b.currentBalance)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">وسيلة الأداء المنفذة *</label>
                  <select
                    value={actualPaymentMethod}
                    onChange={(e) => setActualPaymentMethod(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded bg-white focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="cheque">شيك بنكي مسطر (Chèque)</option>
                    <option value="virement">تحويل بنكي (Virement)</option>
                    <option value="especes">نقداً عبر الصندوق (Caisse)</option>
                  </select>
                </div>

                {actualPaymentMethod === 'cheque' && (
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">رقم الشيك البنكي المسلم للمستفيد *</label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: CHQ-892105"
                      value={checkNumber}
                      onChange={(e) => setCheckNumber(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded font-mono font-bold focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                )}

                {actualPaymentMethod === 'virement' && (
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">مرجع التحويل البنكي أو رقم العملية *</label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: VIR-2026-9041"
                      value={transferReference}
                      onChange={(e) => setTransferReference(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded font-mono font-bold focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                )}

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">إثبات الأداء (وصل استلام الشيك / إشعار التحويل)</label>
                  <input
                    type="text"
                    placeholder="اسم وثيقة إثبات الأداء، مثال: Recu_Remise_Cheque.pdf"
                    value={paymentProofName}
                    onChange={(e) => setPaymentProofName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ملاحظات تنفيذ الأداء</label>
                  <textarea
                    rows={2}
                    placeholder="ملاحظات رئيس الجمعية حول تنفيذ الأداء..."
                    value={executionNotes}
                    onChange={(e) => setExecutionNotes(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500"
                  ></textarea>
                </div>
              </div>

              {/* Automatic Accounting Warning */}
              <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 text-amber-800 text-[11px] space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-700" />
                  <span>تنبيه: التنفيذ المحاسبي غير متاح حالياً</span>
                </div>
                <p>
                  تم إيقاف تأكيد الصرف مؤقتاً. لن يتم تسجيل قيد أو تغيير الأرصدة حتى تجهيز معاملة آمنة ومتكاملة داخل قاعدة البيانات.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setExecuteOrder(null)}
                  className="px-4 py-2 border border-slate-300 rounded text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled
                  className="px-4 py-2 bg-slate-400 text-white rounded font-semibold flex items-center gap-1.5 cursor-not-allowed shadow-sm"
                >
                  <Check className="w-4 h-4" />
                  <span>التنفيذ المحاسبي غير متاح حالياً</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: Audit Timeline (سجل التتبع والمراقبة) */}
      {timelineOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-300 max-w-xl w-full my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-sky-400" />
                <h3 className="font-bold text-sm">سجل التتبع والمراقبة - {timelineOrder.orderNumber}</h3>
              </div>
              <button onClick={() => setTimelineOrder(null)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="border-l-2 border-blue-500 mr-2 pr-4 space-y-6">
                {timelineOrder.history.map((h, idx) => (
                  <div key={h.id || idx} className="relative">
                    <div className="absolute -right-6 top-0 w-3.5 h-3.5 rounded-full bg-blue-600 border-2 border-white"></div>
                    <div className="font-bold text-slate-900 text-xs">{h.actionArabic}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-2">
                      <span>{h.timestamp}</span>
                      <span>•</span>
                      <span className="font-semibold text-slate-700">{h.userName} ({h.userRole})</span>
                    </div>
                    {h.notes && (
                      <p className="mt-1 text-slate-600 bg-slate-50 p-2 rounded border border-slate-200">
                        {h.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end">
                <button
                  type="button"
                  onClick={() => setTimelineOrder(null)}
                  className="px-4 py-1.5 bg-slate-800 text-white rounded font-medium hover:bg-slate-700"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: Printable Voucher */}
      <DisbursementVoucherModal
        order={printOrder}
        profile={profile}
        isOpen={!!printOrder}
        onClose={() => setPrintOrder(null)}
        isArabic={isArabic}
      />
    </div>
  );
};
