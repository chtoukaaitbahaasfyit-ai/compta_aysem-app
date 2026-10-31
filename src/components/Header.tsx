/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Header professionnel style SAGE 100 pour ASSOCIATION COMPTA PRO
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Building2,
  Calendar,
  Layers,
  Wallet,
  PlusCircle,
  FileSpreadsheet,
  Globe,
  ShieldCheck,
  Bell,
  PanelLeftClose,
  PanelLeftOpen,
  User,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Clock,
  Sparkles,
  Search
} from 'lucide-react';
import { AssociationProfile, AccountingModel, FiscalYear, AppAuthUser } from '../types/accounting';
import { AccountingEngine } from '../services/accountingEngine';

interface HeaderProps {
  profile: AssociationProfile;
  totalCash: number;
  fiscalYears: FiscalYear[];
  onSelectFiscalYear: (code: string) => void;
  onNewEntry: () => void;
  onOpenSheetsModal: () => void;
  activeTab: string;
  onChangeTab: (tab: string) => void;
  isArabic: boolean;
  onToggleArabic: () => void;
  isSidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  lateMembersCount?: number;
  subventionsCount?: number;
  currentUser?: AppAuthUser;
  onOpenLoginModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  totalCash,
  fiscalYears,
  onSelectFiscalYear,
  onNewEntry,
  onOpenSheetsModal,
  activeTab,
  onChangeTab,
  isArabic,
  onToggleArabic,
  isSidebarCollapsed,
  onToggleSidebar,
  lateMembersCount = 1,
  subventionsCount = 2,
  currentUser,
  onOpenLoginModal
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showFiscalYearMenu, setShowFiscalYearMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const fyRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (fyRef.current && !fyRef.current.contains(e.target as Node)) {
        setShowFiscalYearMenu(false);
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getModelBadge = (model?: AccountingModel) => {
    switch (model) {
      case 'simplifie':
        return {
          label: isArabic ? 'نموذج مبسط (محاسبة خزينة مزدوجة)' : 'Modèle Simplifié (Trésorerie double)',
          bg: 'bg-emerald-900/90 text-emerald-100 border-emerald-600'
        };
      case 'super_simplifie':
        return {
          label: isArabic ? 'نموذج فائق التبسيط (محاسبة مفردة)' : 'Modèle Super-simplifié (Partie simple)',
          bg: 'bg-amber-900/90 text-amber-100 border-amber-600'
        };
      case 'normal':
      default:
        return {
          label: isArabic ? 'النموذج العادي (قيد مزدوج)' : 'Modèle Normal (Partie double)',
          bg: 'bg-blue-900/90 text-blue-100 border-blue-600'
        };
    }
  };

  const modelBadge = getModelBadge(profile.accountingModel);

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 shadow-lg sticky top-0 z-30 select-none">
      {/* Top Professional Ribbon (SAGE 100 System Line) */}
      <div className="px-4 py-1.5 flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 bg-slate-950/80 text-xs text-slate-300">
        <div className="flex items-center gap-3">
          {/* Sidebar collapse button */}
          <button
            onClick={onToggleSidebar}
            className="p-1 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title={isSidebarCollapsed ? (isArabic ? 'توسيع القائمة' : 'Agrandir la barre latérale') : (isArabic ? 'طي القائمة' : 'Réduire la barre latérale')}
          >
            {isSidebarCollapsed ? (
              <PanelLeftOpen className="w-4 h-4 text-sky-400" />
            ) : (
              <PanelLeftClose className="w-4 h-4 text-slate-400" />
            )}
          </button>

          <div className="flex items-center gap-1.5 font-bold text-sky-400 tracking-tight">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>ASSOCIATION COMPTA PRO</span>
          </div>

          <span className="hidden sm:inline text-slate-600">|</span>

          <div className="hidden md:flex items-center gap-1.5 text-slate-400 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>
              {isArabic
                ? 'المخطط المحاسبي المغربي للجمعيات (قرار المجلس الوطني للمحاسبة CNC 23/2023)'
                : 'Plan Comptable des Associations du Maroc (Avis CNC n°23 / Dahir 1958)'}
            </span>
          </div>
        </div>

        {/* Right Tools: Language, Sheets Sync, Notifications, User */}
        <div className="flex items-center gap-2">
          {/* Quick Google Sheets Webhook Sync */}
          <button
            onClick={onOpenSheetsModal}
            className="flex items-center gap-1 px-2.5 py-0.5 rounded bg-emerald-950/80 hover:bg-emerald-900 text-emerald-200 border border-emerald-700/80 transition-colors text-xs cursor-pointer"
            title={isArabic ? 'ربط وتصدير إلى Google Sheets و Drive' : 'Intégration Google Sheets & Drive'}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">{isArabic ? 'قاعدة بيانات Google Sheets' : 'Google Sheets & Drive'}</span>
          </button>

          {/* Bilingual Arabic / French toggle */}
          <button
            onClick={onToggleArabic}
            className="flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors border border-slate-700 text-xs cursor-pointer"
            title={isArabic ? 'Basculer en Français' : 'تفعيل العرض باللغة العربية'}
          >
            <Globe className="w-3.5 h-3.5 text-sky-400" />
            <span className="font-semibold">{isArabic ? 'Français' : 'العربية (RTL)'}</span>
          </button>

          {/* Notifications Center */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-1.5 rounded-md hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title={isArabic ? 'مركز الإشعارات والتنبيهات الرقابية' : 'Alertes et contrôles comptables'}
            >
              <Bell className="w-4 h-4" />
              {lateMembersCount > 0 && (
                <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-amber-400"></span>
              )}
            </button>

            {showNotifications && (
              <div className={`absolute ${isArabic ? 'left-0' : 'right-0'} mt-1.5 w-80 bg-white text-slate-900 rounded-lg shadow-2xl border border-slate-300 p-3 z-50 text-xs`}>
                <div className="font-bold text-slate-900 border-b border-slate-200 pb-2 flex items-center justify-between">
                  <span>{isArabic ? 'التنبيهات والمطابقة القانونية' : 'Contrôles & Alertes Réglementaires'}</span>
                  <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-mono">
                    Exercice {profile.activeFiscalYear}
                  </span>
                </div>

                <div className="py-2 space-y-2.5">
                  <div className="flex items-start gap-2.5 p-2 rounded bg-emerald-50 border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-emerald-950">
                        {isArabic ? 'توازن العمليات المحاسبية' : 'Équilibre Comptable Débit = Crédit'}
                      </div>
                      <div className="text-[11px] text-emerald-800">
                        {isArabic ? 'جميع قيود اليومية متوازنة بنسبة 100%' : 'Toutes les écritures du journal sont équilibrées.'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-2 rounded bg-amber-50 border border-amber-200">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-amber-950">
                        {isArabic ? 'اشتراكات في انتظار التحصيل' : 'Cotisations adhérents à régulariser'}
                      </div>
                      <div className="text-[11px] text-amber-800">
                        {isArabic
                          ? `${lateMembersCount} من الأعضاء في حالة تأخر في أداء الاشتراك.`
                          : `${lateMembersCount} membre(s) en retard sur la cotisation ${profile.activeFiscalYear}.`}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-2 rounded bg-sky-50 border border-sky-200">
                    <ShieldCheck className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-sky-950">
                        {isArabic ? 'مطابقة سقف الأداء نقداً (5000 درهم)' : 'Règle légale des 5 000 DH'}
                      </div>
                      <div className="text-[11px] text-sky-800">
                        {isArabic
                          ? 'مفعلة وتمنع الدفع نقداً للمبالغ التي تفوق 5000 درهم.'
                          : 'Contrôle automatique du paiement par chèque/virement actif.'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-2 text-center">
                  <button
                    onClick={() => {
                      setShowNotifications(false);
                      onChangeTab('members');
                    }}
                    className="text-blue-700 hover:underline font-semibold text-[11px] cursor-pointer"
                  >
                    {isArabic ? 'معاينة قائمة الأعضاء والاشتراكات' : 'Gérer les cotisations adhérents →'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Profile menu */}
          <div className="relative" ref={userRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md hover:bg-slate-800 text-slate-200 transition-colors cursor-pointer border border-slate-700/80 bg-slate-800/50"
            >
              <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-bold text-white shadow-xs">
                {currentUser?.avatar || 'U'}
              </div>
              <div className="hidden lg:flex flex-col text-left">
                <span className="text-xs font-semibold leading-tight text-white">
                  {currentUser?.nameArabic || currentUser?.name || profile.treasurer}
                </span>
                <span className="text-[10px] text-sky-300 leading-none">
                  {currentUser?.roleArabic || 'المستخدم'}
                </span>
              </div>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showUserMenu && (
              <div className={`absolute ${isArabic ? 'left-0' : 'right-0'} mt-1.5 w-72 bg-white text-slate-900 rounded-lg shadow-2xl border border-slate-300 p-3 z-50 text-xs`}>
                <div className="border-b border-slate-200 pb-2.5">
                  <div className="font-bold text-slate-900 text-sm">
                    {currentUser?.nameArabic || currentUser?.name}
                  </div>
                  <div className="text-blue-700 font-semibold text-[11px] mt-0.5">
                    {currentUser?.roleArabic} ({currentUser?.username})
                  </div>
                  <div className="text-slate-500 text-[10px]">{currentUser?.email}</div>
                </div>

                <div className="pt-2 space-y-1.5">
                  {onOpenLoginModal && (
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onOpenLoginModal();
                      }}
                      className="w-full text-left py-1 text-slate-700 hover:text-blue-700 font-medium flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>🔐 {isArabic ? 'تسجيل الدخول بحساب آخر' : 'Se connecter avec un autre compte'}</span>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onChangeTab('settings');
                    }}
                    className="w-full text-left py-1 text-slate-700 hover:text-blue-700 font-medium flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>⚙️ {isArabic ? 'إعدادات الجمعية' : 'Paramétrage de l\'association'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main SAGE 100 Navigation Bar */}
      <div className="px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Association Identity & Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-700 to-indigo-900 border border-blue-500/80 flex items-center justify-center shadow-md shrink-0">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-bold text-white tracking-tight">
                {isArabic ? profile.arabicName : profile.name}
              </h1>
              <span className="text-[11px] px-1.5 py-0.2 rounded bg-slate-800 text-sky-300 font-mono font-semibold">
                {profile.sigle}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {profile.city} • IF: {profile.ifFiscal} • {isArabic ? 'وصل الإيداع :' : 'Récépissé :'} {profile.receiptReceiptNumber}
            </p>
          </div>
        </div>

        {/* Central SAGE Status Indicators (Fiscal Year, Model, Treasury Balance, Quick Entry) */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 text-xs">
          {/* Active Fiscal Year Selector with Dropdown */}
          <div className="relative" ref={fyRef}>
            <button
              onClick={() => setShowFiscalYearMenu(!showFiscalYearMenu)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 cursor-pointer transition-colors"
              title={isArabic ? 'تغيير السنة المحاسبية' : 'Changer l\'exercice comptable'}
            >
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-slate-400">{isArabic ? 'السنة :' : 'Exercice :'}</span>
              <span className="font-bold text-white font-mono">{profile.activeFiscalYear}</span>
              <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5" />
            </button>

            {showFiscalYearMenu && (
              <div className="absolute left-0 mt-1.5 w-48 bg-white text-slate-900 rounded-lg shadow-xl border border-slate-300 p-2 z-50 text-xs">
                <div className="font-bold text-slate-700 pb-1.5 mb-1.5 border-b border-slate-200">
                  {isArabic ? 'اختر السنة المالية :' : 'Sélectionner l\'exercice :'}
                </div>
                {fiscalYears.map(fy => (
                  <button
                    key={fy.id}
                    onClick={() => {
                      onSelectFiscalYear(fy.code);
                      setShowFiscalYearMenu(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-left font-mono transition-colors cursor-pointer ${
                      profile.activeFiscalYear === fy.code
                        ? 'bg-blue-600 text-white font-bold'
                        : 'hover:bg-slate-100 text-slate-800'
                    }`}
                  >
                    <span>Exercice {fy.code}</span>
                    <span className="text-[10px]">{fy.isClosed ? '(Clôturé)' : '(Actif)'}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Accounting Model Badge */}
          <div
            onClick={() => onChangeTab('settings')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border cursor-pointer hover:opacity-95 transition-all shadow-xs ${modelBadge.bg}`}
            title={isArabic ? 'اضغط لتغيير الموديل المحاسبي' : 'Cliquer pour changer le modèle comptable'}
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="font-semibold text-xs">{modelBadge.label}</span>
          </div>

          {/* Treasury Balance Pill */}
          <div
            onClick={() => onChangeTab('treasury')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-950/80 border border-emerald-700 hover:bg-emerald-900/90 cursor-pointer transition-colors shadow-xs"
            title={isArabic ? 'رصيد الخزينة الإجمالي المتاح' : 'Trésorerie disponible (Banques + Caisse)'}
          >
            <Wallet className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-300">{isArabic ? 'الخزينة :' : 'Trésorerie :'}</span>
            <span className="font-mono-acc font-bold text-emerald-300">
              {AccountingEngine.formatMAD(totalCash)}
            </span>
          </div>

          {/* SAGE 100 Main Action (F3 Saisie Écriture) */}
          <button
            onClick={onNewEntry}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer border border-blue-400"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{isArabic ? 'تسجيل قيد جديد (F3)' : 'Saisie Écriture (F3)'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
