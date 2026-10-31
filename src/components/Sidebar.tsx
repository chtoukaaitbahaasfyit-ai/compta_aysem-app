/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Menu latéral professionnel style SAGE 100 pour ASSOCIATION COMPTA PRO
 */

import React, { useState } from 'react';
import {
  LayoutDashboard,
  FileEdit,
  BookOpen,
  Scale,
  ListTree,
  ArrowDownRight,
  ArrowUpRight,
  Landmark,
  Award,
  Target,
  BarChart3,
  Users,
  Package,
  HeartHandshake,
  FileText,
  FolderArchive,
  FileSpreadsheet,
  Settings,
  Search,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onChangeTab: (tab: string) => void;
  entriesCount: number;
  membersCount: number;
  projectsCount: number;
  subventionsCount: number;
  disbursementsCount?: number;
  accountingModel: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  isArabic?: boolean;
}

interface SidebarItem {
  id: string;
  label: string;
  arabicLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  highlight?: boolean;
  badge?: number;
  isNew?: boolean;
}

interface SidebarSection {
  title: string;
  arabicTitle: string;
  items: SidebarItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onChangeTab,
  entriesCount,
  membersCount,
  projectsCount,
  subventionsCount,
  disbursementsCount = 0,
  accountingModel,
  isCollapsed = false,
  onToggleCollapse,
  isArabic = false
}) => {
  const [menuSearch, setMenuSearch] = useState('');

  const sections: SidebarSection[] = [
    {
      title: "VUE D'ENSEMBLE",
      arabicTitle: 'نظرة عامة',
      items: [
        { id: 'dashboard', label: 'Tableau de bord', arabicLabel: 'لوحة القيادة والمؤشرات', icon: LayoutDashboard }
      ]
    },
    {
      title: 'DÉCAISSEMENTS & VALIDATIONS',
      arabicTitle: 'تدبير الصرف والموافقات (RBAC)',
      items: [
        {
          id: 'disbursements',
          label: 'Ordres de Décaissement',
          arabicLabel: 'طلبات وأوامر الصرف',
          icon: ClipboardCheck,
          highlight: true,
          badge: disbursementsCount
        }
      ]
    },
    {
      title: 'COMPTABILITÉ GÉNÉRALE',
      arabicTitle: 'المحاسبة العامة',
      items: [
        { id: 'entry-form', label: 'Saisie des écritures', arabicLabel: 'تسجيل القيود المحاسبية', icon: FileEdit, highlight: true },
        { id: 'entries-list', label: 'Journal des écritures', arabicLabel: 'دفتر اليومية العامة', icon: BookOpen, badge: entriesCount },
        { id: 'grand-livre', label: 'Grand Livre des comptes', arabicLabel: 'دفتر الأستاذ العام', icon: BookOpen },
        { id: 'balance', label: 'Balance générale', arabicLabel: 'ميزان المراجعة العام', icon: Scale },
        { id: 'chart-accounts', label: 'Plan comptable (CNC)', arabicLabel: 'دليل الحسابات (CNC)', icon: ListTree }
      ]
    },
    {
      title: 'GESTION OPÉRATIONNELLE',
      arabicTitle: 'العمليات والتدبير',
      items: [
        { id: 'recettes', label: 'Recettes & Cotisations', arabicLabel: 'المداخيل والاشتراكات', icon: ArrowDownRight },
        { id: 'depenses', label: 'Dépenses & Factures', arabicLabel: 'المصاريف وفواتير الشراء', icon: ArrowUpRight },
        { id: 'treasury', label: 'Trésorerie & Rapprochement', arabicLabel: 'الخزينة والمطابقة البنكية', icon: Landmark }
      ]
    },
    {
      title: 'PROJETS & FINANCEMENTS',
      arabicTitle: 'المشاريع والتمويلات',
      items: [
        { id: 'subventions', label: 'Subventions & Conventions', arabicLabel: 'المنح واتفاقيات الشراكة', icon: Award, badge: subventionsCount },
        { id: 'projects', label: 'Projets associatifs', arabicLabel: 'المشاريع والأنشطة', icon: Target, badge: projectsCount },
        { id: 'budgets', label: 'Gestion budgétaire', arabicLabel: 'الميزانية التقديرية والتنفيذ', icon: BarChart3 }
      ]
    },
    {
      title: 'PATRIMOINE & ADHÉRENTS',
      arabicTitle: 'الممتلكات والأعضاء',
      items: [
        { id: 'members', label: 'Fichier des adhérents', arabicLabel: 'سجل المنخرطين والأعضاء', icon: Users, badge: membersCount },
        { id: 'immobilisations', label: 'Immobilisations & Amort.', arabicLabel: 'الأصول الثابتة والإهلاك', icon: Package },
        { id: 'in-kind', label: 'Contributions en nature (Cl. 0)', arabicLabel: 'المساهمات العينية والتطوع', icon: HeartHandshake }
      ]
    },
    {
      title: 'ÉTATS FINANCIERS & ÉDITIONS',
      arabicTitle: 'القوائم المالية والتقارير',
      items: [
        { id: 'reports', label: 'Bilan, CPC & ETIC (S1-S8)', arabicLabel: 'الميزانية وحساب النتائج والملحقات', icon: FileText }
      ]
    },
    {
      title: 'OUTILS & SYSTÈME',
      arabicTitle: 'الأدوات والربط السحابي',
      items: [
        { id: 'documents', label: 'Documents & Archives GED', arabicLabel: 'الأرشيف والمستندات', icon: FolderArchive },
        { id: 'sheets-integration', label: 'Google Sheets & Apps Script', arabicLabel: 'ربط Google Sheets و Drive', icon: FileSpreadsheet, isNew: true },
        { id: 'settings', label: 'Paramétrage & Dossier', arabicLabel: 'إعدادات الجمعية والملف', icon: Settings }
      ]
    }
  ];

  // Filter sections and items if search is active
  const filteredSections = sections.map(section => ({
    ...section,
    items: section.items.filter(item => {
      if (!menuSearch.trim()) return true;
      const term = menuSearch.toLowerCase();
      return (
        item.label.toLowerCase().includes(term) ||
        item.arabicLabel.toLowerCase().includes(term)
      );
    })
  })).filter(section => section.items.length > 0);

  return (
    <aside
      className={`bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col shrink-0 transition-all duration-300 select-none no-print ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
      style={{ height: 'calc(100vh - 89px)' }}
    >
      {/* Top Search Filter inside Sidebar (when expanded) */}
      {!isCollapsed && (
        <div className="p-2.5 border-b border-slate-800/80 bg-slate-950/40">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-500" />
            <input
              type="text"
              placeholder={isArabic ? 'بحث في القوائم...' : 'Recherche menu...'}
              value={menuSearch}
              onChange={(e) => setMenuSearch(e.target.value)}
              className="w-full pl-8 pr-2 py-1 text-xs bg-slate-800/70 border border-slate-700/60 rounded text-slate-200 placeholder-slate-500 focus:bg-slate-800 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>
      )}

      {/* Navigation Sections */}
      <div className="p-2 space-y-4 overflow-y-auto flex-1">
        {filteredSections.map((section, idx) => (
          <div key={idx}>
            {!isCollapsed && (
              <div className="px-2.5 mb-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                {isArabic ? section.arabicTitle : section.title}
              </div>
            )}
            <nav className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                const itemLabel = isArabic ? item.arabicLabel : item.label;

                return (
                  <button
                    key={item.id}
                    onClick={() => onChangeTab(item.id)}
                    title={isCollapsed ? itemLabel : undefined}
                    className={`w-full flex items-center ${
                      isCollapsed ? 'justify-center py-2.5 px-0' : 'justify-between px-2.5 py-1.5'
                    } text-xs rounded-md transition-all text-left font-medium cursor-pointer relative group ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm font-semibold'
                        : item.highlight
                        ? 'text-sky-300 hover:bg-slate-800 hover:text-white bg-slate-800/40'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          isActive ? 'text-white' : item.highlight ? 'text-sky-400' : 'text-slate-400 group-hover:text-slate-200'
                        }`}
                      />
                      {!isCollapsed && <span className="truncate">{itemLabel}</span>}
                    </div>

                    {!isCollapsed && (
                      <div className="flex items-center gap-1.5 shrink-0 ml-1">
                        {item.isNew && (
                          <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono">
                            GAS
                          </span>
                        )}
                        {item.badge !== undefined && (
                          <span
                            className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                              isActive ? 'bg-blue-800 text-white' : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Floating Tooltip in collapsed mode */}
                    {isCollapsed && (
                      <div className="absolute left-16 bg-slate-800 text-white text-xs px-2.5 py-1 rounded shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 border border-slate-700">
                        {itemLabel}
                        {item.badge !== undefined && ` (${item.badge})`}
                      </div>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* Footer Info & Collapse Toggle in Sidebar */}
      <div className="mt-auto p-2.5 border-t border-slate-800/80 bg-slate-950/60 text-[11px] text-slate-400">
        {!isCollapsed ? (
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">{isArabic ? 'المعيار المحاسبي :' : 'Réf. Normative :'}</span>
              <span className="font-semibold text-slate-200">CNC Avis n°23</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">{isArabic ? 'الموديل :' : 'Mode :'}</span>
              <span className="capitalize text-sky-400 font-medium font-mono">
                {(accountingModel || 'normal').replace('_', '-')}
              </span>
            </div>
          </div>
        ) : (
          <div className="text-center font-mono text-[9px] text-sky-400 font-bold">
            CNC 23
          </div>
        )}
      </div>
    </aside>
  );
};
