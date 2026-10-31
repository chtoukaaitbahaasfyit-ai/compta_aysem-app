/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Bordereau officiel d'ordre de décaissement et mandatement de paiement
 * Conforme aux normes d'audit et de contrôle des associations marocaines
 */

import React from 'react';
import {
  Printer,
  X,
  Building2,
  CheckCircle2,
  FileCheck2,
  Layers,
  Calendar,
  Wallet,
  Receipt
} from 'lucide-react';
import { DisbursementOrder, AssociationProfile } from '../types/accounting';
import { AccountingEngine } from '../services/accountingEngine';

interface DisbursementVoucherModalProps {
  order: DisbursementOrder | null;
  profile: AssociationProfile;
  isOpen: boolean;
  onClose: () => void;
  isArabic?: boolean;
}

export const DisbursementVoucherModal: React.FC<DisbursementVoucherModalProps> = ({
  order,
  profile,
  isOpen,
  onClose,
  isArabic = false
}) => {
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-300 max-w-4xl w-full my-8 overflow-hidden">
        {/* Action Bar (Hidden in Print) */}
        <div className="bg-slate-900 text-white px-6 py-3.5 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-blue-400" />
            <span className="font-bold text-sm">
              سند الصرف والأمر بالأداء المالي - {order.orderNumber}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold cursor-pointer shadow-xs transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة السند الرسمي (Imprimer)</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-8 sm:p-12 text-slate-900 bg-white font-sans text-xs space-y-6">
          {/* Document Header */}
          <div className="border-b-2 border-slate-900 pb-5 flex flex-wrap justify-between items-start gap-4">
            <div>
              <h1 className="text-base font-bold uppercase tracking-tight text-slate-900">
                {profile.arabicName || 'جمعية شباب الغد للتنمية والتعاون'}
              </h1>
              <h2 className="text-xs font-semibold text-slate-600 mt-0.5">
                {profile.name}
              </h2>
              <div className="text-[11px] text-slate-500 mt-2 space-y-0.5">
                <p>المقر الاجتماعي: {profile.address} - {profile.city}</p>
                <p>وصل الإيداع القانوني: {profile.receiptReceiptNumber} (ظهير 1958)</p>
                <p>التعريف الضريبي: {profile.ifFiscal} | ICE: {profile.ice || '002938174000092'}</p>
              </div>
            </div>

            <div className="text-right border border-slate-900 p-3 rounded bg-slate-50 min-w-[200px]">
              <div className="text-[10px] text-slate-500 font-bold uppercase">الرقم الترتيبي للسند</div>
              <div className="text-base font-bold font-mono text-blue-900">{order.orderNumber}</div>
              <div className="text-[11px] text-slate-700 mt-1">السنة المالية: <strong>{order.fiscalYear}</strong></div>
              <div className="text-[11px] text-slate-700">تاريخ الإعداد: <strong>{order.date}</strong></div>
            </div>
          </div>

          {/* Title Banner */}
          <div className="text-center py-2 bg-slate-100 border-y border-slate-300">
            <h2 className="text-sm font-bold tracking-wider uppercase text-slate-900">
              سند الصرف والأمر بالأداء المالي
            </h2>
            <p className="text-[10px] text-slate-600 uppercase tracking-widest mt-0.5">
              Ordre de Décaissement & Mandatement de Paiement
            </p>
          </div>

          {/* Section 1: Informations Générales du Décaissement */}
          <div className="grid grid-cols-2 gap-4 border border-slate-200 p-4 rounded-lg bg-slate-50/50">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">المستفيد من الأداء (Bénéficiaire) :</span>
              <span className="text-sm font-bold text-slate-900 block mt-0.5">{order.beneficiary}</span>
              {order.cinOrIce && (
                <span className="text-[11px] text-slate-600 font-mono block mt-0.5">{order.cinOrIce}</span>
              )}
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">طريقة الأداء المنفذة / المقترحة :</span>
              <span className="text-xs font-semibold text-slate-900 block mt-0.5 uppercase">
                {order.actualPaymentMethod === 'especes'
                  ? 'نقداً عبر الصندوق (Caisse)'
                  : order.actualPaymentMethod === 'cheque'
                  ? `شيك بنكي (Chèque N° ${order.checkNumber || '---'})`
                  : order.actualPaymentMethod === 'virement'
                  ? `تحويل بنكي (Virement Réf: ${order.transferReference || '---'})`
                  : `مقترح: ${order.proposedPaymentMethod}`}
              </span>
              {order.bankAccountName && (
                <span className="text-[11px] text-slate-600 block mt-0.5">الحساب: {order.bankAccountName}</span>
              )}
            </div>

            <div className="col-span-2 pt-2 border-t border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">موضوع الصرف والغرض منه (Objet de la dépense) :</span>
              <p className="text-xs text-slate-900 font-medium mt-0.5 leading-relaxed">{order.subject}</p>
            </div>
          </div>

          {/* Section 2: Imputation Analytique & Budgétaire */}
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 font-bold text-[11px] text-slate-700 uppercase">
              التخصيص المالي والمحاسبي (Imputation Analytique & Budgétaire)
            </div>
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-2 px-3 font-semibold">المشروع / النشاط</th>
                  <th className="py-2 px-3 font-semibold">بند الميزانية</th>
                  <th className="py-2 px-3 font-semibold">الحساب المحاسبي (CNC)</th>
                  <th className="py-2 px-3 font-semibold text-right">المبلغ الصافي (درهم)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-100">
                  <td className="py-2.5 px-3 font-medium text-slate-800">
                    {order.projectTitle || 'نشاط جمعوي عام'}
                  </td>
                  <td className="py-2.5 px-3 text-slate-700">
                    {order.budgetItemCategory || 'مصاريف المشاريع والأنشطة'}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-blue-900 font-semibold">
                    Compte {order.accountNumber}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                    {AccountingEngine.formatMAD(order.amount)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section 3: Montant en Chiffres et en Lettres */}
          <div className="border-2 border-blue-900/30 bg-blue-50/30 p-4 rounded-lg flex flex-wrap justify-between items-center gap-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-blue-900 block">المبلغ الإجمالي بالحروف :</span>
              <span className="text-xs font-bold text-blue-950 mt-1 block">
                {order.amountInWords || '---'}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-600 block">المبلغ المؤدى :</span>
              <span className="text-lg font-bold font-mono text-blue-900">
                {AccountingEngine.formatMAD(order.amount)}
              </span>
            </div>
          </div>

          {/* Section 4: Validation & Imputation Comptable (SAGE 100) */}
          <div className="bg-slate-50 border border-slate-200 p-3 rounded text-[11px] text-slate-700 flex flex-wrap justify-between items-center gap-2">
            <div>
              <span>الربط المحاسبي باليومية: </span>
              {order.isExecutedAccounting && order.accountingPieceNumber ? (
                <span className="font-mono font-bold text-emerald-700 px-2 py-0.5 bg-emerald-50 rounded border border-emerald-200">
                  مقيد برقم السند: {order.accountingPieceNumber}
                </span>
              ) : (
                <span className="font-semibold text-amber-700">
                  في انتظار الاعتماد والتنفيذ النهائي
                </span>
              )}
            </div>
            <div>
              <span>الوثائق التبريرية المرفقة: </span>
              <strong>{order.attachments.length} وثيقة</strong>
            </div>
          </div>

          {/* Section 5: The Three Mandatory Signatures (Les 3 Signatures Réglementaires) */}
          <div className="pt-4 border-t-2 border-slate-900">
            <div className="text-center font-bold text-[11px] uppercase tracking-wider text-slate-700 mb-3">
              التأشيرات والتوقيعات القانونية لإجازة الصرف (Conforme aux statuts et à la gouvernance)
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              {/* 1. Responsable Administratif */}
              <div className="border border-slate-300 p-3 rounded-lg flex flex-col justify-between h-36 bg-slate-50/40">
                <div>
                  <div className="font-bold text-slate-900 text-xs">1. المسؤول الإداري</div>
                  <div className="text-[10px] text-slate-500">إعداد ومطابقة الوثائق</div>
                  <div className="text-[11px] font-semibold text-slate-800 mt-1">{order.createdByName}</div>
                </div>
                <div className="border-t border-slate-200 pt-1 text-[10px] text-slate-400 italic">
                  التوقيع والتاريخ: {order.createdAt.split(' ')[0]}
                </div>
              </div>

              {/* 2. Trésorier */}
              <div className="border border-slate-300 p-3 rounded-lg flex flex-col justify-between h-36 bg-slate-50/40">
                <div>
                  <div className="font-bold text-slate-900 text-xs">2. أمين المال</div>
                  <div className="text-[10px] text-slate-500">تأشيرة توفر الاعتماد المالي</div>
                  <div className="text-[11px] font-semibold text-slate-800 mt-1">
                    {order.treasurerName || 'Fatima-Zahra EL AMRANI'}
                  </div>
                </div>
                <div className="border-t border-slate-200 pt-1 text-[10px] text-slate-400 italic">
                  {order.treasurerReviewDate ? (
                    <span className="text-emerald-700 font-semibold">
                      تمت التأشيرة: {order.treasurerReviewDate.split(' ')[0]}
                    </span>
                  ) : (
                    'التوقيع والتاريخ'
                  )}
                </div>
              </div>

              {/* 3. Président */}
              <div className="border border-slate-300 p-3 rounded-lg flex flex-col justify-between h-36 bg-slate-50/40">
                <div>
                  <div className="font-bold text-slate-900 text-xs">3. رئيس الجمعية</div>
                  <div className="text-[10px] text-slate-500">أمر بالأداء والتنفيذ الفعلي</div>
                  <div className="text-[11px] font-semibold text-slate-800 mt-1">
                    {order.presidentName || 'Dr. Youssef EL MANSOURI'}
                  </div>
                </div>
                <div className="border-t border-slate-200 pt-1 text-[10px] text-slate-400 italic">
                  {order.executionDate ? (
                    <span className="text-emerald-700 font-semibold">
                      أمر بالصرف: {order.executionDate.split(' ')[0]}
                    </span>
                  ) : (
                    'التوقيع والتاريخ والختم'
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer Legal Note */}
          <div className="text-center text-[10px] text-slate-400 pt-4 border-t border-slate-200">
            وثيقة محاسبية وإدارية رسمية مستخرجة من نظام ASSOCIATION COMPTA PRO – جمعية شباب الغد للتنمية والتعاون
          </div>
        </div>
      </div>
    </div>
  );
};
