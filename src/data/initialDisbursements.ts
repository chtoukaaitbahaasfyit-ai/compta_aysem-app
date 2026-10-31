/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Données initiales des ordres de décaissement (طلبات وأوامر الصرف)
 * Pour la جمعية شباب الغد للتنمية والتعاون
 */

import { DisbursementOrder } from '../types/accounting';

export const INITIAL_DISBURSEMENTS: DisbursementOrder[] = [
  {
    id: 'ord-2026-001',
    orderNumber: 'ORD-2026-001',
    date: '2026-02-10',
    fiscalYear: '2026',
    beneficiary: 'مكتبة ومطبعة النجاح الحديثة',
    cinOrIce: 'ICE: 001928374000081',
    subject: 'طباعة الدلائل التدريبية والملصقات التوعوية لمنتدى الشباب القروي',
    amount: 4200,
    amountInWords: 'أربعة آلاف ومائتان درهم مغربي',
    projectId: 'prj-02',
    projectTitle: 'Équipement Numérique & Soutien Scolaire Écoles Communautaires',
    budgetItemId: 'b-d-2',
    budgetItemCategory: 'Actions Éducation',
    accountNumber: '6128',
    proposedPaymentMethod: 'cheque',
    notesAdministrative: 'الفاتورة التقديرية مرفقة مع نموذج الطبع النهائي المعتمد من طرف المنسق.',
    attachments: [
      {
        id: 'att-01',
        name: 'Devis_Imprimerie_Najahi_DV441.pdf',
        type: 'application/pdf',
        size: '340 KB',
        uploadedAt: '2026-02-10 10:15'
      },
      {
        id: 'att-02',
        name: 'Bon_de_Commande_BC2026_012.pdf',
        type: 'application/pdf',
        size: '185 KB',
        uploadedAt: '2026-02-10 10:16'
      }
    ],
    status: 'en_attente_tresorier',
    createdById: 'user-idari-01',
    createdByRole: 'responsable_administratif',
    createdByName: 'Tariq EL IDRISSI',
    createdAt: '2026-02-10 10:20:00',
    isExecutedAccounting: false,
    history: [
      {
        id: 'hist-001-1',
        timestamp: '2026-02-10 10:20:00',
        status: 'en_attente_tresorier',
        action: 'Création et soumission de la demande',
        actionArabic: 'إنشاء وإرسال طلب الصرف إلى أمين المال',
        userName: 'Tariq EL IDRISSI',
        userRole: 'responsable_administratif',
        notes: 'طلب عاجل لتأمين طبع المطبوعات قبل موعد انطلاق الورشات التكوينية.'
      }
    ],
    updatedAt: '2026-02-10 10:20:00'
  },
  {
    id: 'ord-2026-002',
    orderNumber: 'ORD-2026-002',
    date: '2026-02-05',
    fiscalYear: '2026',
    beneficiary: 'شركة الأطلس للنقل السياحي واللوجستيك',
    cinOrIce: 'ICE: 002349182000045',
    subject: 'كراء حافلة لنقل 40 مشاركاً من العالم القروي إلى الملتقى الجهوي للتنمية',
    amount: 6500,
    amountInWords: 'ستة آلاف وخمسمائة درهم مغربي',
    projectId: 'prj-01',
    projectTitle: 'Caravanes Médicales & Dépistage Rural (Moyen Atlas)',
    budgetItemId: 'b-d-1',
    budgetItemCategory: 'Actions & Projets sociaux',
    accountNumber: '6141',
    proposedPaymentMethod: 'virement',
    notesAdministrative: 'تم التفاوض على أفضل عرض أسعار مطابق لدفتر الشروط والمواصفات.',
    attachments: [
      {
        id: 'att-03',
        name: 'Facture_Definitive_AtlasTransport_F882.pdf',
        type: 'application/pdf',
        size: '520 KB',
        uploadedAt: '2026-02-05 14:00'
      }
    ],
    status: 'en_attente_president',
    createdById: 'user-idari-01',
    createdByRole: 'responsable_administratif',
    createdByName: 'Tariq EL IDRISSI',
    createdAt: '2026-02-05 14:10:00',
    treasurerReviewDate: '2026-02-06 11:30:00',
    treasurerId: 'user-tresorier-02',
    treasurerName: 'Fatima-Zahra EL AMRANI',
    treasurerDecision: 'approuve',
    treasurerNotes: 'تمت مراجعة الوثائق والتأكد من توفر الاعتماد المالي في بند النقل والتنقلات بمشروع القوافل. تم التأشير بالموافقة وإحالة الملف على السيد الرئيس لتنفيذ الأداء.',
    isExecutedAccounting: false,
    history: [
      {
        id: 'hist-002-1',
        timestamp: '2026-02-05 14:10:00',
        status: 'en_attente_tresorier',
        action: 'Création et soumission',
        actionArabic: 'إنشاء وإرسال الطلب',
        userName: 'Tariq EL IDRISSI',
        userRole: 'responsable_administratif',
        notes: 'تم إرفاق الفاتورة وبيان الرحلة.'
      },
      {
        id: 'hist-002-2',
        timestamp: '2026-02-06 11:30:00',
        status: 'en_attente_president',
        action: 'Approbation par le Trésorier',
        actionArabic: 'تأشيرة وموافقة أمين المال',
        userName: 'Fatima-Zahra EL AMRANI',
        userRole: 'tresorier',
        notes: 'الاعتماد متوفر والوثائق قانونية ومطابقة لمسطرة الصرف.'
      }
    ],
    updatedAt: '2026-02-06 11:30:00'
  },
  {
    id: 'ord-2026-003',
    orderNumber: 'ORD-2026-003',
    date: '2026-01-25',
    fiscalYear: '2026',
    beneficiary: 'صيدلية النور - الدار البيضاء',
    cinOrIce: 'ICE: 001882910000031',
    subject: 'اقتناء أدوية ومستلزمات الإسعافات الأولية وتضميد الجروح للقافلة الطبية',
    amount: 15400,
    amountInWords: 'خمسة عشر ألفاً وأربعمائة درهم مغربي',
    projectId: 'prj-01',
    projectTitle: 'Caravanes Médicales & Dépistage Rural (Moyen Atlas)',
    budgetItemId: 'b-d-1',
    budgetItemCategory: 'Actions & Projets sociaux',
    accountNumber: '6128',
    proposedPaymentMethod: 'cheque',
    notesAdministrative: 'قائمة الأدوية المعتمدة من طرف الطبيب المنسق للقافلة.',
    attachments: [
      {
        id: 'att-04',
        name: 'Facture_Pharmacie_Nour_F2026_01.pdf',
        type: 'application/pdf',
        size: '410 KB',
        uploadedAt: '2026-01-25 09:30'
      },
      {
        id: 'att-05',
        name: 'Bon_de_Livraison_BL890.pdf',
        type: 'application/pdf',
        size: '220 KB',
        uploadedAt: '2026-01-25 09:35'
      }
    ],
    status: 'execute',
    createdById: 'user-idari-01',
    createdByRole: 'responsable_administratif',
    createdByName: 'Tariq EL IDRISSI',
    createdAt: '2026-01-25 09:40:00',
    treasurerReviewDate: '2026-01-26 10:00:00',
    treasurerId: 'user-tresorier-02',
    treasurerName: 'Fatima-Zahra EL AMRANI',
    treasurerDecision: 'approuve',
    treasurerNotes: 'المبلغ مطابق للائحة الأسعار المتفق عليها وتم التحقق من استلام الأدوية فعلياً.',
    executionDate: '2026-01-27 15:00:00',
    presidentId: 'user-president-03',
    presidentName: 'Dr. Youssef EL MANSOURI',
    actualPaymentMethod: 'cheque',
    bankAccountId: 'ba-01',
    bankAccountName: 'Compte Principal Attijariwafa (514101)',
    checkNumber: 'CHQ-892104',
    paymentProofName: 'Recu_Remise_Cheque_Pharmacie.pdf',
    isExecutedAccounting: true,
    accountingEntryId: 'entry-ord-003',
    accountingPieceNumber: 'BQ-2026-0002',
    history: [
      {
        id: 'hist-003-1',
        timestamp: '2026-01-25 09:40:00',
        status: 'en_attente_tresorier',
        action: 'Création et soumission',
        actionArabic: 'إنشاء وإرسال الطلب',
        userName: 'Tariq EL IDRISSI',
        userRole: 'responsable_administratif',
        notes: 'طلب عاجل لتوفير الأدوية قبل موعد القافلة.'
      },
      {
        id: 'hist-003-2',
        timestamp: '2026-01-26 10:00:00',
        status: 'en_attente_president',
        action: 'Approbation par le Trésorier',
        actionArabic: 'موافقة أمين المال',
        userName: 'Fatima-Zahra EL AMRANI',
        userRole: 'tresorier',
        notes: 'موافقة كاملة مع التأكيد على تسليم شيك مسطر للمستفيد الأول حصراً.'
      },
      {
        id: 'hist-003-3',
        timestamp: '2026-01-27 15:00:00',
        status: 'execute',
        action: 'Ordonnancement et exécution du paiement',
        actionArabic: 'تنفيذ الصرف والتسجيل المحاسبي التلقائي بالدفتر',
        userName: 'Dr. Youssef EL MANSOURI',
        userRole: 'president',
        notes: 'تم تسليم الشيك البنكي رقم CHQ-892104 وتوليد القيد المحاسبي BQ-2026-0002 تلقائياً.'
      }
    ],
    updatedAt: '2026-01-27 15:00:00'
  },
  {
    id: 'ord-2026-004',
    orderNumber: 'ORD-2026-004',
    date: '2026-02-08',
    fiscalYear: '2026',
    beneficiary: 'ممون الحفلات والوجبات الزيتونة',
    cinOrIce: 'ICE: 001229384000012',
    subject: 'توفير وجبات الغداء واستراحة شاي للمشاركين في الدورة التكوينية',
    amount: 3800,
    amountInWords: 'ثلاثة آلاف وثمانمائة درهم مغربي',
    projectId: 'prj-02',
    projectTitle: 'Équipement Numérique & Soutien Scolaire Écoles Communautaires',
    budgetItemId: 'b-d-2',
    budgetItemCategory: 'Actions Éducation',
    accountNumber: '6128',
    proposedPaymentMethod: 'especes',
    notesAdministrative: 'وجبات لـ 35 مستفيداً مع المؤطرين.',
    attachments: [],
    status: 'a_completer',
    createdById: 'user-idari-01',
    createdByRole: 'responsable_administratif',
    createdByName: 'Tariq EL IDRISSI',
    createdAt: '2026-02-08 11:00:00',
    treasurerReviewDate: '2026-02-09 09:30:00',
    treasurerId: 'user-tresorier-02',
    treasurerName: 'Fatima-Zahra EL AMRANI',
    treasurerDecision: 'a_completer',
    treasurerNotes: 'المرجو إرفاق الفاتورة النهائية الحاملة للتعريف الموحد للمقاولة (ICE) بالإضافة إلى لائحة الحضور الموقعة من طرف المستفيدين قبل الموافقة.',
    isExecutedAccounting: false,
    history: [
      {
        id: 'hist-004-1',
        timestamp: '2026-02-08 11:00:00',
        status: 'en_attente_tresorier',
        action: 'Création et soumission',
        actionArabic: 'إنشاء وإرسال الطلب',
        userName: 'Tariq EL IDRISSI',
        userRole: 'responsable_administratif'
      },
      {
        id: 'hist-004-2',
        timestamp: '2026-02-09 09:30:00',
        status: 'a_completer',
        action: 'Demande de complément d\'information',
        actionArabic: 'إرجاع الطلب لاستكمال الوثائق',
        userName: 'Fatima-Zahra EL AMRANI',
        userRole: 'tresorier',
        notes: 'تنقص الفاتورة الرسمية ولائحة توقيعات المستفيدين.'
      }
    ],
    updatedAt: '2026-02-09 09:30:00'
  }
];
