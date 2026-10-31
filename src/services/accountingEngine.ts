/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Moteur comptable pour associations marocaines selon les normes du CNC 2023
 */

import {
  AccountingEntry,
  EntryLine,
  Account,
  AccountingModel,
  Recette,
  Depense,
  Project,
  Subvention,
  BudgetItem,
  Immobilisation,
  VolunteerWork,
  InKindContribution
} from '../types/accounting';

export interface AccountLedgerItem {
  entry: AccountingEntry;
  line: EntryLine;
  balanceDebit: number;
  balanceCredit: number;
}

export interface AccountSummary {
  accountNumber: string;
  accountLabel: string;
  classNumber: number;
  totalDebit: number;
  totalCredit: number;
  soldeDebiteur: number;
  soldeCrediteur: number;
}

export interface BalanceSheetData {
  actif: {
    immobilise: {
      nonValeur: number;
      incorporelles: number;
      corporelles: number;
      legsACeder: number; // Compte 2371
      financieres: number;
      amortissements: number;
      net: number;
    };
    circulant: {
      stocks: number;
      creancesMembres: number; // Compte 346
      creancesUsagers: number; // Compte 347
      creancesLegs: number;    // Compte 3480
      autresDebiteurs: number;
      net: number;
    };
    tresorerie: {
      banques: number;
      caisses: number;
      net: number;
    };
    totalGeneral: number;
  };
  passif: {
    fondsPropres: {
      sansDroitReprise: number; // 111
      avecDroitReprise: number; // 112
      ecartsReevaluation: number; // 113
      reserves: number; // 115
      reportsNets: number; // 118
      resultatExercice: number; // Excédent ou Insuffisance (1191 ou 1199)
      totalFondsPropres: number;
    };
    fondsAssimiles: {
      subventionsInvestissement: number; // 131
      total: number;
    };
    dettesFinancement: {
      empruntsPartenaires: number; // 144
      provisionsChargesLegs: number; // 155
      fondsReportes: number; // Rubrique 18
      fondsDedies: number; // Rubrique 19
      total: number;
    };
    passifCirculant: {
      fournisseurs: number; // 4411
      dettesMembres: number; // 446
      dettesUsagers: number; // 447
      dettesLegs: number; // 4480
      organismesSociauxEtEtat: number; // 444, 445
      total: number;
    };
    tresoreriePassif: {
      decouverts: number;
      total: number;
    };
    totalGeneral: number;
  };
  equilibre: boolean;
  ecartBilan: number;
}

export interface CPCData {
  produitsExploitation: {
    ventesDonsNature: number; // 7110
    parrainages: number; // 71244
    utilisationsFondsDedies: number; // 715
    subventionsExploitation: number; // 7161
    cotisations: number; // 71711
    droitsEntree: number; // 71712
    donsManuels: number; // 71831
    mecenat: number; // 71832
    legsDonations: number; // 71833
    autresGénérosités: number; // 71835, 71836
    contributionsFinancieres: number; // 7184
    concoursPublics: number; // 7187
    autresProduits: number;
    total: number;
  };
  chargesExploitation: {
    achatsFournitures: number; // 612
    locationsEtCharges: number; // 6131
    entretiens: number; // 6133
    assurances: number; // 6134
    honoraires: number; // 6136
    deplacementsMissions: number; // 6141
    communicationEtFrais: number; // 6142, 6143
    engagementsFondsDedies: number; // 615
    personnelEtSocial: number; // 617
    aidesFinancieres: number; // 6180
    chargesLegs: number; // 6184
    dotationsAmortissements: number; // 6193
    autresCharges: number;
    total: number;
  };
  excedentExploitation: number;
  produitsFinanciers: number; // 73
  chargesFinancieres: number; // 63
  excedentFinancier: number;
  excedentCourant: number;
  produitsNonCourants: number; // 75
  chargesNonCourantes: number; // 65
  excedentNonCourant: number;
  totalProduits: number;
  totalCharges: number;
  resultatNet: number; // Positif = Excédent, Négatif = Insuffisance
  isExcedent: boolean;
}

export const AccountingEngine = {
  // Formatage monétaire officiel en Dirhams marocains (MAD / DH)
  formatMAD: (amount: number): string => {
    return new Intl.NumberFormat('fr-MA', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount) + ' DH';
  },

  // Calcul de la balance générale pour une liste d'écritures
  calculateBalanceGenerale: (entries: AccountingEntry[], accounts: Account[]): AccountSummary[] => {
    const validEntries = entries.filter(e => e.status !== 'extourne');
    const map = new Map<string, { debit: number; credit: number }>();

    // Initialiser les comptes existants
    accounts.forEach(acc => {
      map.set(acc.number, { debit: 0, credit: 0 });
    });

    // Sommer les lignes
    validEntries.forEach(entry => {
      entry.lines.forEach(line => {
        const cur = map.get(line.accountNumber) || { debit: 0, credit: 0 };
        cur.debit += Number(line.debit) || 0;
        cur.credit += Number(line.credit) || 0;
        map.set(line.accountNumber, cur);
      });
    });

    const result: AccountSummary[] = [];

    map.forEach((val, accNum) => {
      // Ignorer les comptes sans mouvement si classe 0 (sauf s'ils ont été mouvementés)
      if (val.debit === 0 && val.credit === 0) return;

      const accInfo = accounts.find(a => a.number === accNum) || {
        number: accNum,
        label: `Compte ${accNum}`,
        classNumber: parseInt(accNum.charAt(0)) || 0,
        type: 'actif'
      };

      const diff = val.debit - val.credit;
      result.push({
        accountNumber: accNum,
        accountLabel: accInfo.label,
        classNumber: accInfo.classNumber,
        totalDebit: val.debit,
        totalCredit: val.credit,
        soldeDebiteur: diff > 0 ? diff : 0,
        soldeCrediteur: diff < 0 ? Math.abs(diff) : 0
      });
    });

    return result.sort((a, b) => a.accountNumber.localeCompare(b.accountNumber));
  },

  // Calcul du Grand Livre pour un compte donné
  calculateGrandLivreForAccount: (accountNumber: string, entries: AccountingEntry[]): AccountLedgerItem[] => {
    const validEntries = entries
      .filter(e => e.status !== 'extourne')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const items: AccountLedgerItem[] = [];
    let runningDiff = 0;

    validEntries.forEach(entry => {
      entry.lines
        .filter(l => l.accountNumber === accountNumber)
        .forEach(line => {
          const deb = Number(line.debit) || 0;
          const cred = Number(line.credit) || 0;
          runningDiff += deb - cred;

          items.push({
            entry,
            line,
            balanceDebit: runningDiff > 0 ? runningDiff : 0,
            balanceCredit: runningDiff < 0 ? Math.abs(runningDiff) : 0
          });
        });
    });

    return items;
  },

  // Calcul du Compte de Produits et Charges (CPC) selon le modèle normal du CNC
  calculateCPC: (entries: AccountingEntry[]): CPCData => {
    const balance = AccountingEngine.calculateBalanceGenerale(entries, []);

    const sumAccounts = (prefixes: string[], useCreditOnly = true): number => {
      return balance
        .filter(b => prefixes.some(p => b.accountNumber.startsWith(p)))
        .reduce((sum, b) => {
          if (useCreditOnly) {
            return sum + (b.totalCredit - b.totalDebit);
          } else {
            return sum + (b.totalDebit - b.totalCredit);
          }
        }, 0);
    };

    // Produits d'exploitation (Classe 71)
    const ventesDonsNature = sumAccounts(['7110'], true);
    const parrainages = sumAccounts(['71244', '71254'], true);
    const utilisationsFondsDedies = sumAccounts(['715'], true);
    const subventionsExploitation = sumAccounts(['7161', '716'], true);
    const cotisations = sumAccounts(['71711', '71721'], true);
    const droitsEntree = sumAccounts(['71712', '71722'], true);
    const donsManuels = sumAccounts(['71831'], true);
    const mecenat = sumAccounts(['71832'], true);
    const legsDonations = sumAccounts(['71833'], true);
    const autresGénérosités = sumAccounts(['71834', '71835', '71836'], true);
    const contributionsFinancieres = sumAccounts(['7184'], true);
    const concoursPublics = sumAccounts(['7187'], true);
    const autresProduits = sumAccounts(['7124', '7173', '7181', '7188', '719'], true);

    const totalProduitsExploit = Math.max(0,
      ventesDonsNature + parrainages + utilisationsFondsDedies + subventionsExploitation +
      cotisations + droitsEntree + donsManuels + mecenat + legsDonations +
      autresGénérosités + contributionsFinancieres + concoursPublics + autresProduits
    );

    // Charges d'exploitation (Classe 61)
    const achatsFournitures = sumAccounts(['611', '612'], false);
    const locationsEtCharges = sumAccounts(['6131'], false);
    const entretiens = sumAccounts(['6133'], false);
    const assurances = sumAccounts(['6134'], false);
    const honoraires = sumAccounts(['6136'], false);
    const deplacementsMissions = sumAccounts(['6141'], false);
    const communicationEtFrais = sumAccounts(['6142', '6143', '6145', '6147'], false);
    const engagementsFondsDedies = sumAccounts(['615'], false);
    const personnelEtSocial = sumAccounts(['617'], false);
    const aidesFinancieres = sumAccounts(['6180'], false);
    const chargesLegs = sumAccounts(['6184'], false);
    const dotationsAmortissements = sumAccounts(['619'], false);
    const autresCharges = sumAccounts(['616', '6183', '6188'], false);

    const totalChargesExploit = Math.max(0,
      achatsFournitures + locationsEtCharges + entretiens + assurances + honoraires +
      deplacementsMissions + communicationEtFrais + engagementsFondsDedies +
      personnelEtSocial + aidesFinancieres + chargesLegs + dotationsAmortissements + autresCharges
    );

    const excedentExploitation = totalProduitsExploit - totalChargesExploit;

    // Produits et charges financières (73 & 63)
    const produitsFinanciers = Math.max(0, sumAccounts(['73'], true));
    const chargesFinancieres = Math.max(0, sumAccounts(['63'], false));
    const excedentFinancier = produitsFinanciers - chargesFinancieres;
    const excedentCourant = excedentExploitation + excedentFinancier;

    // Non courant (75 & 65)
    const produitsNonCourants = Math.max(0, sumAccounts(['75'], true));
    const chargesNonCourantes = Math.max(0, sumAccounts(['65'], false));
    const excedentNonCourant = produitsNonCourants - chargesNonCourantes;

    const totalProduits = totalProduitsExploit + produitsFinanciers + produitsNonCourants;
    const totalCharges = totalChargesExploit + chargesFinancieres + chargesNonCourantes;
    const resultatNet = totalProduits - totalCharges;

    return {
      produitsExploitation: {
        ventesDonsNature,
        parrainages,
        utilisationsFondsDedies,
        subventionsExploitation,
        cotisations,
        droitsEntree,
        donsManuels,
        mecenat,
        legsDonations,
        autresGénérosités,
        contributionsFinancieres,
        concoursPublics,
        autresProduits,
        total: totalProduitsExploit
      },
      chargesExploitation: {
        achatsFournitures,
        locationsEtCharges,
        entretiens,
        assurances,
        honoraires,
        deplacementsMissions,
        communicationEtFrais,
        engagementsFondsDedies,
        personnelEtSocial,
        aidesFinancieres,
        chargesLegs,
        dotationsAmortissements,
        autresCharges,
        total: totalChargesExploit
      },
      excedentExploitation,
      produitsFinanciers,
      chargesFinancieres,
      excedentFinancier,
      excedentCourant,
      produitsNonCourants,
      chargesNonCourantes,
      excedentNonCourant,
      totalProduits,
      totalCharges,
      resultatNet,
      isExcedent: resultatNet >= 0
    };
  },

  // Calcul du Bilan officiel (Actif / Passif) conforme au CNC 2023
  calculateBilan: (entries: AccountingEntry[], accounts: Account[]): BalanceSheetData => {
    const balance = AccountingEngine.calculateBalanceGenerale(entries, accounts);
    const cpc = AccountingEngine.calculateCPC(entries);

    const getDebitNet = (prefixes: string[]): number => {
      return balance
        .filter(b => prefixes.some(p => b.accountNumber.startsWith(p)))
        .reduce((sum, b) => sum + (b.totalDebit - b.totalCredit), 0);
    };

    const getCreditNet = (prefixes: string[]): number => {
      return balance
        .filter(b => prefixes.some(p => b.accountNumber.startsWith(p)))
        .reduce((sum, b) => sum + (b.totalCredit - b.totalDebit), 0);
    };

    // ACTIF
    const nonValeur = Math.max(0, getDebitNet(['21']));
    const incorporelles = Math.max(0, getDebitNet(['22']));
    const corporelles = Math.max(0, getDebitNet(['231', '232', '233', '234', '235', '238']));
    const legsACeder = Math.max(0, getDebitNet(['2371']));
    const financieres = Math.max(0, getDebitNet(['24', '25']));
    const amortissements = Math.abs(getCreditNet(['28', '29']));
    const totalImmobilise = Math.max(0, (nonValeur + incorporelles + corporelles + legsACeder + financieres) - amortissements);

    const stocks = Math.max(0, getDebitNet(['31']));
    const creancesMembres = Math.max(0, getDebitNet(['346']));
    const creancesUsagers = Math.max(0, getDebitNet(['347']));
    const creancesLegs = Math.max(0, getDebitNet(['3480']));
    const autresDebiteurs = Math.max(0, getDebitNet(['341', '342', '3486', '349']));
    const totalCirculant = stocks + creancesMembres + creancesUsagers + creancesLegs + autresDebiteurs;

    const banques = Math.max(0, getDebitNet(['514']));
    const caisses = Math.max(0, getDebitNet(['516', '511']));
    const totalTresorerieActif = banques + caisses;

    const totalActif = totalImmobilise + totalCirculant + totalTresorerieActif;

    // PASSIF
    const sansDroitReprise = Math.max(0, getCreditNet(['111']));
    const avecDroitReprise = Math.max(0, getCreditNet(['112']));
    const ecartsReevaluation = Math.max(0, getCreditNet(['113']));
    const reserves = Math.max(0, getCreditNet(['115']));
    const reportsNets = getCreditNet(['1181']) - getDebitNet(['1189']);
    const resultatExercice = cpc.resultatNet; // Excédent (+) ou Insuffisance (-)

    const totalFondsPropres = sansDroitReprise + avecDroitReprise + ecartsReevaluation + reserves + reportsNets + resultatExercice;

    const subventionsInvestissement = Math.max(0, getCreditNet(['131']));
    const empruntsPartenaires = Math.max(0, getCreditNet(['144', '148']));
    const provisionsChargesLegs = Math.max(0, getCreditNet(['155']));
    const fondsReportes = Math.max(0, getCreditNet(['181', '182']));
    const fondsDedies = Math.max(0, getCreditNet(['194', '195', '196', '197', '198']));
    const totalFinancementDurable = totalFondsPropres + subventionsInvestissement + empruntsPartenaires + provisionsChargesLegs + fondsReportes + fondsDedies;

    const fournisseurs = Math.max(0, getCreditNet(['441']));
    const dettesMembres = Math.max(0, getCreditNet(['446']));
    const dettesUsagers = Math.max(0, getCreditNet(['447']));
    const dettesLegs = Math.max(0, getCreditNet(['4480']));
    const organismesSociauxEtEtat = Math.max(0, getCreditNet(['443', '444', '445', '4486', '449']));
    const totalPassifCirculant = fournisseurs + dettesMembres + dettesUsagers + dettesLegs + organismesSociauxEtEtat;

    const decouverts = Math.max(0, getCreditNet(['554', '555']));

    const totalPassif = totalFinancementDurable + totalPassifCirculant + decouverts;
    const ecartBilan = Math.round((totalActif - totalPassif) * 100) / 100;

    return {
      actif: {
        immobilise: {
          nonValeur,
          incorporelles,
          corporelles,
          legsACeder,
          financieres,
          amortissements,
          net: totalImmobilise
        },
        circulant: {
          stocks,
          creancesMembres,
          creancesUsagers,
          creancesLegs,
          autresDebiteurs,
          net: totalCirculant
        },
        tresorerie: {
          banques,
          caisses,
          net: totalTresorerieActif
        },
        totalGeneral: totalActif
      },
      passif: {
        fondsPropres: {
          sansDroitReprise,
          avecDroitReprise,
          ecartsReevaluation,
          reserves,
          reportsNets,
          resultatExercice,
          totalFondsPropres
        },
        fondsAssimiles: {
          subventionsInvestissement,
          total: subventionsInvestissement
        },
        dettesFinancement: {
          empruntsPartenaires,
          provisionsChargesLegs,
          fondsReportes,
          fondsDedies,
          total: empruntsPartenaires + provisionsChargesLegs + fondsReportes + fondsDedies
        },
        passifCirculant: {
          fournisseurs,
          dettesMembres,
          dettesUsagers,
          dettesLegs,
          organismesSociauxEtEtat,
          total: totalPassifCirculant
        },
        tresoreriePassif: {
          decouverts,
          total: decouverts
        },
        totalGeneral: totalPassif
      },
      equilibre: Math.abs(ecartBilan) < 0.05,
      ecartBilan
    };
  },

  // Génération d'une écriture d'annulation / contrepassation (extourne)
  createExtourneEntry: (originalEntry: AccountingEntry, user: string): AccountingEntry => {
    const lines: EntryLine[] = originalEntry.lines.map((l, idx) => ({
      ...l,
      id: `l-ext-${Date.now()}-${idx}`,
      lineNumber: idx + 1,
      debit: l.credit, // Inversion
      credit: l.debit,
      label: `Extourne: ${l.label}`
    }));

    const dateStr = new Date().toISOString().split('T')[0];
    const period = dateStr.substring(0, 7);

    return {
      id: `ent-ext-${Date.now()}`,
      pieceNumber: `EXT-${originalEntry.pieceNumber}`,
      journalCode: originalEntry.journalCode,
      date: dateStr,
      period,
      fiscalYear: originalEntry.fiscalYear,
      label: `Contrepassation / Annulation de la pièce ${originalEntry.pieceNumber}`,
      lines,
      totalDebit: originalEntry.totalCredit,
      totalCredit: originalEntry.totalDebit,
      isBalanced: true,
      status: 'valide',
      sourceModule: 'extourne',
      createdAt: new Date().toISOString(),
      createdBy: user,
      extourneOfPiece: originalEntry.pieceNumber
    };
  },

  // Validation d'une écriture comptable
  validateEntry: (lines: EntryLine[]): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    if (!lines || lines.length < 2) {
      errors.push('Une écriture comptable doit comporter au moins 2 lignes.');
    }

    const totalDebit = lines.reduce((sum, l) => sum + (Number(l.debit) || 0), 0);
    const totalCredit = lines.reduce((sum, l) => sum + (Number(l.credit) || 0), 0);
    const diff = Math.abs(Math.round((totalDebit - totalCredit) * 100) / 100);

    if (diff > 0.01) {
      errors.push(`L'écriture n'est pas équilibrée (Total Débit: ${totalDebit.toFixed(2)} DH, Total Crédit: ${totalCredit.toFixed(2)} DH, Écart: ${diff.toFixed(2)} DH).`);
    }

    lines.forEach((l, i) => {
      if (!l.accountNumber || l.accountNumber.trim() === '') {
        errors.push(`La ligne ${i + 1} n'a pas de compte comptable sélectionné.`);
      }
      if ((Number(l.debit) || 0) === 0 && (Number(l.credit) || 0) === 0) {
        errors.push(`La ligne ${i + 1} a un montant nul au débit et au crédit.`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }
};
