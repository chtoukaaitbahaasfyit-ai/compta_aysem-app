/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Plan Comptable Officiel des Associations et Organismes à But Non Lucratif (Maroc - CNC Avis n°23 de 2023)
 */

import { Account } from '../types/accounting';

export const MOROCCAN_ASSOCIATION_ACCOUNTS: Account[] = [
  // ================= CLASSE 0 : CONTRIBUTIONS VOLONTAIRES EN NATURE =================
  {
    number: '041',
    label: 'Secours en nature',
    classNumber: 0,
    type: 'charge',
    isSpecificAssociation: true,
    description: 'Denrées alimentaires, vêtements, couvertures, colis de secours distribués gratuitement'
  },
  {
    number: '042',
    label: 'Mises à disposition gratuite de biens',
    classNumber: 0,
    type: 'charge',
    isSpecificAssociation: true,
    description: 'Locaux, entrepôts, véhicules ou équipements mis gracieusement à la disposition de l\'association'
  },
  {
    number: '043',
    label: 'Prestations en nature',
    classNumber: 0,
    type: 'charge',
    isSpecificAssociation: true,
    description: 'Services d\'experts, transport gracieux, hébergement offert'
  },
  {
    number: '044',
    label: 'Personnel bénévole',
    classNumber: 0,
    type: 'charge',
    isSpecificAssociation: true,
    description: 'Valorisation des heures de bénévolat selon le taux horaire de marché'
  },
  {
    number: '051',
    label: 'Contributions volontaires en nature - Dons en nature',
    classNumber: 0,
    type: 'produit',
    isSpecificAssociation: true,
    description: 'Contrepartie des dons en nature reçus'
  },
  {
    number: '052',
    label: 'Contributions volontaires en nature - Prestations en nature',
    classNumber: 0,
    type: 'produit',
    isSpecificAssociation: true,
    description: 'Contrepartie des prestations et mises à disposition gratuites'
  },
  {
    number: '054',
    label: 'Contributions volontaires en nature - Bénévolat',
    classNumber: 0,
    type: 'produit',
    isSpecificAssociation: true,
    description: 'Contrepartie de la valorisation du travail bénévole'
  },

  // ================= CLASSE 1 : FINANCEMENT PERMANENT =================
  {
    number: '1111',
    label: 'Valeur du patrimoine intégré',
    classNumber: 1,
    type: 'passif',
    isSpecificAssociation: true,
    description: 'Bilan d\'ouverture lors du passage à la comptabilité d\'engagement'
  },
  {
    number: '1112',
    label: 'Fonds statutaires sans droit de reprise',
    classNumber: 1,
    type: 'passif',
    isSpecificAssociation: true,
    description: 'Fonds statutaires et droits d\'entrée affectés durablement'
  },
  {
    number: '1114',
    label: 'Apports sans droit de reprise',
    classNumber: 1,
    type: 'passif',
    isSpecificAssociation: true,
    description: 'Apports des fondateurs ou membres sans faculté de reprise'
  },
  {
    number: '1115',
    label: 'Legs et donations avec contrepartie d\'actifs immobilisés',
    classNumber: 1,
    type: 'passif',
    isSpecificAssociation: true,
    description: 'Biens durables affectés sans droit de reprise'
  },
  {
    number: '1118',
    label: 'Autres fonds propres sans droit de reprise',
    classNumber: 1,
    type: 'passif',
    isSpecificAssociation: true
  },
  {
    number: '1122',
    label: 'Fonds statutaires avec droit de reprise',
    classNumber: 1,
    type: 'passif',
    isSpecificAssociation: true,
    description: 'Fonds récupérables par les membres selon conventions'
  },
  {
    number: '1124',
    label: 'Apports avec droit de reprise',
    classNumber: 1,
    type: 'passif',
    isSpecificAssociation: true
  },
  {
    number: '1125',
    label: 'Legs et donations avec contrepartie d\'actifs immobilisés (avec droit de reprise)',
    classNumber: 1,
    type: 'passif',
    isSpecificAssociation: true
  },
  {
    number: '1131',
    label: 'Écarts de réévaluation sur biens sans droit de reprise',
    classNumber: 1,
    type: 'passif',
    isSpecificAssociation: true
  },
  {
    number: '1132',
    label: 'Écarts de réévaluation sur biens avec droit de reprise',
    classNumber: 1,
    type: 'passif',
    isSpecificAssociation: true
  },
  {
    number: '1153',
    label: 'Réserves statutaires ou contractuelles',
    classNumber: 1,
    type: 'passif'
  },
  {
    number: '1158',
    label: 'Autres réserves (dont réserves pour projet à but non lucratif)',
    classNumber: 1,
    type: 'passif',
    isSpecificAssociation: true,
    description: 'Réserves constituées pour des projets associatifs futurs'
  },
  {
    number: '1181',
    label: 'Excédent net en instance d\'affectation',
    classNumber: 1,
    type: 'passif',
    isSpecificAssociation: true,
    description: 'Report de l\'excédent en attente de décision de l\'AG'
  },
  {
    number: '1189',
    label: 'Insuffisance nette en instance d\'affectation',
    classNumber: 1,
    type: 'passif',
    isSpecificAssociation: true,
    description: 'Report de l\'insuffisance en attente d\'apurement'
  },
  {
    number: '1191',
    label: 'Excédent de l\'exercice',
    classNumber: 1,
    type: 'passif',
    isSpecificAssociation: true,
    description: 'Résultat positif de l\'exercice (remplace Bénéfice)'
  },
  {
    number: '1199',
    label: 'Insuffisance de l\'exercice',
    classNumber: 1,
    type: 'passif',
    isSpecificAssociation: true,
    description: 'Résultat négatif de l\'exercice (remplace Perte)'
  },
  {
    number: '1311',
    label: 'Subventions d\'investissement reçues',
    classNumber: 1,
    type: 'passif'
  },
  {
    number: '1441',
    label: 'Emprunts auprès des fédérations',
    classNumber: 1,
    type: 'passif',
    isSpecificAssociation: true
  },
  {
    number: '1442',
    label: 'Emprunts auprès d\'unions',
    classNumber: 1,
    type: 'passif',
    isSpecificAssociation: true
  },
  {
    number: '1448',
    label: 'Emprunts auprès d\'autres entités affiliées',
    classNumber: 1,
    type: 'passif',
    isSpecificAssociation: true
  },
  {
    number: '1556',
    label: 'Subventions à reverser',
    classNumber: 1,
    type: 'passif',
    isSpecificAssociation: true,
    description: 'Provisions pour subventions devant être restituées aux bailleurs'
  },
  {
    number: '1557',
    label: 'Provisions pour charges sur legs ou donations',
    classNumber: 1,
    type: 'passif',
    isSpecificAssociation: true
  },
  {
    number: '1811',
    label: 'Fonds reportés liés aux legs ou donations',
    classNumber: 1,
    type: 'passif',
    isSpecificAssociation: true,
    description: 'Biens légués destinés à être cédés mais non encore vendus'
  },
  {
    number: '1821',
    label: 'Fonds reportés liés aux donations temporaires d\'usufruit',
    classNumber: 1,
    type: 'passif',
    isSpecificAssociation: true
  },
  {
    number: '1941',
    label: 'Fonds dédiés sur subventions d\'exploitation',
    classNumber: 1,
    type: 'passif',
    isSpecificAssociation: true,
    description: 'Quote-part non utilisée de subventions affectées à un projet précis'
  },
  {
    number: '1951',
    label: 'Fonds dédiés sur dons affectés',
    classNumber: 1,
    type: 'passif',
    isSpecificAssociation: true
  },
  {
    number: '1961',
    label: 'Fonds dédiés sur legs et donations affectés',
    classNumber: 1,
    type: 'passif',
    isSpecificAssociation: true
  },
  {
    number: '1971',
    label: 'Fonds dédiés sur contributions financières d\'autres organismes',
    classNumber: 1,
    type: 'passif',
    isSpecificAssociation: true
  },
  {
    number: '1981',
    label: 'Autres fonds dédiés',
    classNumber: 1,
    type: 'passif',
    isSpecificAssociation: true
  },

  // ================= CLASSE 2 : ACTIF IMMOBILISÉ =================
  {
    number: '2111',
    label: 'Frais préliminaires de constitution',
    classNumber: 2,
    type: 'actif'
  },
  {
    number: '2241',
    label: 'Donations temporaires d\'usufruit',
    classNumber: 2,
    type: 'actif',
    isSpecificAssociation: true
  },
  {
    number: '2248',
    label: 'Donations temporaires d\'autres droits réels similaires',
    classNumber: 2,
    type: 'actif',
    isSpecificAssociation: true
  },
  {
    number: '2311',
    label: 'Terrains nus',
    classNumber: 2,
    type: 'actif'
  },
  {
    number: '2321',
    label: 'Bâtiments et constructions associatives',
    classNumber: 2,
    type: 'actif'
  },
  {
    number: '2332',
    label: 'Matériel et outillage associatif',
    classNumber: 2,
    type: 'actif'
  },
  {
    number: '2340',
    label: 'Matériel de transport (ambulance, minibus, véhicule)',
    classNumber: 2,
    type: 'actif'
  },
  {
    number: '2351',
    label: 'Mobilier de bureau et agencements',
    classNumber: 2,
    type: 'actif'
  },
  {
    number: '2352',
    label: 'Matériel informatique et audiovisuel',
    classNumber: 2,
    type: 'actif'
  },
  {
    number: '2371',
    label: 'Biens reçus par legs ou donations destinés à être cédés',
    classNumber: 2,
    type: 'actif',
    isSpecificAssociation: true,
    description: 'Immobilisations reçues en legs devant être revendues pour financer la cause'
  },
  {
    number: '24121',
    label: 'Prêts aux fédérations',
    classNumber: 2,
    type: 'actif',
    isSpecificAssociation: true
  },
  {
    number: '24122',
    label: 'Prêts aux unions',
    classNumber: 2,
    type: 'actif',
    isSpecificAssociation: true
  },
  {
    number: '24123',
    label: 'Prêts à d\'autres entités affiliées',
    classNumber: 2,
    type: 'actif',
    isSpecificAssociation: true
  },
  {
    number: '2832',
    label: 'Amortissements du matériel et outillage',
    classNumber: 2,
    type: 'actif'
  },
  {
    number: '2834',
    label: 'Amortissements du matériel de transport',
    classNumber: 2,
    type: 'actif'
  },
  {
    number: '2835',
    label: 'Amortissements du mobilier et matériel de bureau',
    classNumber: 2,
    type: 'actif'
  },
  {
    number: '2911',
    label: 'Provisions pour dépréciation des biens reçus par legs ou donations destinés à être cédés',
    classNumber: 2,
    type: 'actif',
    isSpecificAssociation: true
  },

  // ================= CLASSE 3 : ACTIF CIRCULANT (HORS TRÉSORERIE) =================
  {
    number: '3111',
    label: 'Stocks de marchandises (boutique associative)',
    classNumber: 3,
    type: 'actif'
  },
  {
    number: '3121',
    label: 'Matières et fournitures consommables',
    classNumber: 3,
    type: 'actif'
  },
  {
    number: '3411',
    label: 'Fournisseurs débiteurs, avances et acomptes versés',
    classNumber: 3,
    type: 'actif'
  },
  {
    number: '3421',
    label: 'Clients et comptes rattachés (activités lucratives autorisées)',
    classNumber: 3,
    type: 'actif'
  },
  {
    number: '3461',
    label: 'Membres et adhérents - comptes d\'apport',
    classNumber: 3,
    type: 'actif',
    isSpecificAssociation: true
  },
  {
    number: '3462',
    label: 'Comptes courants des membres et adhérents débiteurs',
    classNumber: 3,
    type: 'actif',
    isSpecificAssociation: true
  },
  {
    number: '3467',
    label: 'Créances rattachées aux comptes des membres (cotisations appelées non payées)',
    classNumber: 3,
    type: 'actif',
    isSpecificAssociation: true
  },
  {
    number: '3468',
    label: 'Autres comptes des membres et adhérents - débiteurs',
    classNumber: 3,
    type: 'actif',
    isSpecificAssociation: true
  },
  {
    number: '3471',
    label: 'Usagers et bénéficiaires - créances',
    classNumber: 3,
    type: 'actif',
    isSpecificAssociation: true,
    description: 'Sommes dues par les bénéficiaires des actions associatives'
  },
  {
    number: '3474',
    label: 'Usagers douteux ou litigieux',
    classNumber: 3,
    type: 'actif',
    isSpecificAssociation: true
  },
  {
    number: '3480',
    label: 'Créances reçues par legs ou donations',
    classNumber: 3,
    type: 'actif',
    isSpecificAssociation: true,
    description: 'Fonds légués en attente de transfert bancaire'
  },
  {
    number: '3486',
    label: 'Partenaires, entités affiliées et comptes rattachés débiteurs',
    classNumber: 3,
    type: 'actif',
    isSpecificAssociation: true
  },
  {
    number: '3491',
    label: 'Charges constatées d\'avance',
    classNumber: 3,
    type: 'actif'
  },

  // ================= CLASSE 4 : PASSIF CIRCULANT (HORS TRÉSORERIE) =================
  {
    number: '4411',
    label: 'Fournisseurs',
    classNumber: 4,
    type: 'passif'
  },
  {
    number: '4417',
    label: 'Fournisseurs - factures non parvenues',
    classNumber: 4,
    type: 'passif'
  },
  {
    number: '4432',
    label: 'Personnel - Rémunérations dues',
    classNumber: 4,
    type: 'passif'
  },
  {
    number: '4441',
    label: 'CNSS - Caisse Nationale de Sécurité Sociale',
    classNumber: 4,
    type: 'passif'
  },
  {
    number: '4443',
    label: 'Caisses de retraite et prévoyance sociale',
    classNumber: 4,
    type: 'passif'
  },
  {
    number: '4452',
    label: 'État, impôts retenus à la source (IR)',
    classNumber: 4,
    type: 'passif'
  },
  {
    number: '4461',
    label: 'Membres et adhérents - fonds à rembourser',
    classNumber: 4,
    type: 'passif',
    isSpecificAssociation: true
  },
  {
    number: '4463',
    label: 'Comptes courants des membres et adhérents créditeurs',
    classNumber: 4,
    type: 'passif',
    isSpecificAssociation: true
  },
  {
    number: '4468',
    label: 'Autres comptes des membres et adhérents créditeurs',
    classNumber: 4,
    type: 'passif',
    isSpecificAssociation: true
  },
  {
    number: '4471',
    label: 'Usagers - avances et acomptes reçus',
    classNumber: 4,
    type: 'passif',
    isSpecificAssociation: true
  },
  {
    number: '4480',
    label: 'Dettes des legs ou donations',
    classNumber: 4,
    type: 'passif',
    isSpecificAssociation: true,
    description: 'Dettes grevant les biens légués prises en charge par l\'association'
  },
  {
    number: '4486',
    label: 'Partenaires, entités affiliées et comptes rattachés créditeurs',
    classNumber: 4,
    type: 'passif',
    isSpecificAssociation: true
  },
  {
    number: '4491',
    label: 'Produits constatés d\'avance (Subventions rattachées aux exercices futurs)',
    classNumber: 4,
    type: 'passif'
  },

  // ================= CLASSE 5 : COMPTES DE TRÉSORERIE =================
  {
    number: '5111',
    label: 'Chèques et valeurs à encaisser',
    classNumber: 5,
    type: 'actif'
  },
  {
    number: '5115',
    label: 'Virements de fonds (Virements internes)',
    classNumber: 5,
    type: 'actif',
    description: 'Compte pivot de liaison entre banque et caisse'
  },
  {
    number: '514101',
    label: 'Banque Attijariwafa Bank - Compte Principal',
    classNumber: 5,
    type: 'actif'
  },
  {
    number: '514102',
    label: 'Banque Populaire - Compte Projets & Subventions',
    classNumber: 5,
    type: 'actif'
  },
  {
    number: '516101',
    label: 'Caisse Principale (Siège de l\'association)',
    classNumber: 5,
    type: 'actif'
  },
  {
    number: '516102',
    label: 'Caisse Régie de Projet Terrain',
    classNumber: 5,
    type: 'actif'
  },

  // ================= CLASSE 6 : CHARGES D'EXPLOITATION & NON COURANTES =================
  {
    number: '6111',
    label: 'Achats de marchandises',
    classNumber: 6,
    type: 'charge'
  },
  {
    number: '6121',
    label: 'Achats de matières et fournitures consommables',
    classNumber: 6,
    type: 'charge'
  },
  {
    number: '6125',
    label: 'Fournitures de bureau et documentation',
    classNumber: 6,
    type: 'charge'
  },
  {
    number: '6128',
    label: 'Fournitures pour ateliers, actions sociales et projets',
    classNumber: 6,
    type: 'charge'
  },
  {
    number: '6131',
    label: 'Locations et charges locatives (siège, salles d\'activités)',
    classNumber: 6,
    type: 'charge'
  },
  {
    number: '6133',
    label: 'Entretien et réparations',
    classNumber: 6,
    type: 'charge'
  },
  {
    number: '6134',
    label: 'Primes d\'assurances (responsabilité civile association)',
    classNumber: 6,
    type: 'charge'
  },
  {
    number: '6136',
    label: 'Rémunérations d\'intermédiaires et honoraires (expert-comptable, commissaire aux comptes)',
    classNumber: 6,
    type: 'charge'
  },
  {
    number: '61362',
    label: 'Honoraires sur legs ou donations destinés à être cédés (notaire, adoul)',
    classNumber: 6,
    type: 'charge',
    isSpecificAssociation: true
  },
  {
    number: '6141',
    label: 'Déplacements, missions et frais engagés par les membres du bureau',
    classNumber: 6,
    type: 'charge'
  },
  {
    number: '6142',
    label: 'Frais postaux et télécommunications',
    classNumber: 6,
    type: 'charge'
  },
  {
    number: '6143',
    label: 'Publicité, publications, communication et site web',
    classNumber: 6,
    type: 'charge'
  },
  {
    number: '6145',
    label: 'Frais d\'organisation des assemblées générales et réunions',
    classNumber: 6,
    type: 'charge'
  },
  {
    number: '6147',
    label: 'Services bancaires et frais de gestion de compte',
    classNumber: 6,
    type: 'charge'
  },
  {
    number: '61511',
    label: 'Engagements à réaliser sur fonds reportés liés aux legs ou donations',
    classNumber: 6,
    type: 'charge',
    isSpecificAssociation: true
  },
  {
    number: '61512',
    label: 'Engagements à réaliser sur donations temporaires d\'usufruit',
    classNumber: 6,
    type: 'charge',
    isSpecificAssociation: true
  },
  {
    number: '61521',
    label: 'Engagements à réaliser sur subventions attribuées (fonds dédiés)',
    classNumber: 6,
    type: 'charge',
    isSpecificAssociation: true,
    description: 'Affectation à la clôture du reliquat non consommé de subvention dédiée'
  },
  {
    number: '61522',
    label: 'Engagements à réaliser sur contributions financières dédiées d\'autres organismes',
    classNumber: 6,
    type: 'charge',
    isSpecificAssociation: true
  },
  {
    number: '61523',
    label: 'Engagements à réaliser sur ressources liées à la générosité du public',
    classNumber: 6,
    type: 'charge',
    isSpecificAssociation: true
  },
  {
    number: '61528',
    label: 'Engagements à réaliser sur autres fonds dédiés',
    classNumber: 6,
    type: 'charge',
    isSpecificAssociation: true
  },
  {
    number: '6161',
    label: 'Impôts et taxes directs et vignettes',
    classNumber: 6,
    type: 'charge'
  },
  {
    number: '6171',
    label: 'Rémunérations du personnel permanent / animateurs',
    classNumber: 6,
    type: 'charge'
  },
  {
    number: '6174',
    label: 'Charges sociales patronales (CNSS, AMO)',
    classNumber: 6,
    type: 'charge'
  },
  {
    number: '6180',
    label: 'Aides financières octroyées (secours d\'urgence, bourses, aides sociales)',
    classNumber: 6,
    type: 'charge',
    isSpecificAssociation: true,
    description: 'Sommes versées aux personnes physiques démunies ou contributions à d\'autres ONG'
  },
  {
    number: '6183',
    label: 'Quotes-parts de générosités reversées',
    classNumber: 6,
    type: 'charge',
    isSpecificAssociation: true
  },
  {
    number: '6184',
    label: 'Autres charges sur legs ou donations',
    classNumber: 6,
    type: 'charge',
    isSpecificAssociation: true
  },
  {
    number: '6193',
    label: 'Dotations d\'exploitation aux amortissements des immobilisations corporelles',
    classNumber: 6,
    type: 'charge'
  },
  {
    number: '61937',
    label: 'Dotations d\'exploitation aux provisions pour dépréciation d\'actifs reçus par legs à céder',
    classNumber: 6,
    type: 'charge',
    isSpecificAssociation: true
  },
  {
    number: '6311',
    label: 'Intérêts des emprunts et dettes',
    classNumber: 6,
    type: 'charge'
  },
  {
    number: '6511',
    label: 'VNA des immobilisations reçues par legs ou donations cédées',
    classNumber: 6,
    type: 'charge',
    isSpecificAssociation: true
  },
  {
    number: '6571',
    label: 'Aides financières exceptionnelles',
    classNumber: 6,
    type: 'charge',
    isSpecificAssociation: true
  },

  // ================= CLASSE 7 : PRODUITS D'EXPLOITATION & NON COURANTS =================
  {
    number: '7110',
    label: 'Ventes de dons en nature',
    classNumber: 7,
    type: 'produit',
    isSpecificAssociation: true,
    description: 'Vente des dons matériels reçus pour générer de la trésorerie pour l\'action sociale'
  },
  {
    number: '7124',
    label: 'Ventes de services et activités socioculturelles / sportives au Maroc',
    classNumber: 7,
    type: 'produit'
  },
  {
    number: '71244',
    label: 'Parrainages au Maroc (Sponsoring d\'événements associatifs)',
    classNumber: 7,
    type: 'produit',
    isSpecificAssociation: true
  },
  {
    number: '71254',
    label: 'Parrainages à l\'étranger',
    classNumber: 7,
    type: 'produit',
    isSpecificAssociation: true
  },
  {
    number: '7151',
    label: 'Utilisations de l\'exercice de fonds reportés',
    classNumber: 7,
    type: 'produit',
    isSpecificAssociation: true
  },
  {
    number: '71521',
    label: 'Utilisations de l\'exercice de fonds dédiés sur subventions attribuées',
    classNumber: 7,
    type: 'produit',
    isSpecificAssociation: true,
    description: 'Reprise en produit des dépenses imputées sur subventions dédiées'
  },
  {
    number: '71522',
    label: 'Utilisations de l\'exercice de fonds dédiés sur ressources liées à la générosité du public',
    classNumber: 7,
    type: 'produit',
    isSpecificAssociation: true
  },
  {
    number: '71523',
    label: 'Utilisations de fonds dédiés sur contributions financières d\'autres organismes',
    classNumber: 7,
    type: 'produit',
    isSpecificAssociation: true
  },
  {
    number: '71528',
    label: 'Utilisations d\'autres fonds dédiés',
    classNumber: 7,
    type: 'produit',
    isSpecificAssociation: true
  },
  {
    number: '7161',
    label: 'Subventions d\'exploitation de l\'exercice (État, Collectivités territoriales, INDH)',
    classNumber: 7,
    type: 'produit',
    isSpecificAssociation: true
  },
  {
    number: '71711',
    label: 'Cotisations sans contrepartie',
    classNumber: 7,
    type: 'produit',
    isSpecificAssociation: true,
    description: 'Cotisations normales des adhérents'
  },
  {
    number: '71712',
    label: 'Droits d\'entrée sans contrepartie',
    classNumber: 7,
    type: 'produit',
    isSpecificAssociation: true,
    description: 'Droit d\'adhésion initial perçu auprès des nouveaux membres'
  },
  {
    number: '71721',
    label: 'Cotisations avec contrepartie (publications, accès spécifique)',
    classNumber: 7,
    type: 'produit',
    isSpecificAssociation: true
  },
  {
    number: '71722',
    label: 'Droits d\'entrée avec contrepartie',
    classNumber: 7,
    type: 'produit',
    isSpecificAssociation: true
  },
  {
    number: '7173',
    label: 'Autres versements des membres et adhérents',
    classNumber: 7,
    type: 'produit',
    isSpecificAssociation: true
  },
  {
    number: '71831',
    label: 'Dons manuels des particuliers',
    classNumber: 7,
    type: 'produit',
    isSpecificAssociation: true,
    description: 'Dons en espèces ou chèques versés directement de la main à la main'
  },
  {
    number: '71832',
    label: 'Mécénats d\'entreprises',
    classNumber: 7,
    type: 'produit',
    isSpecificAssociation: true,
    description: 'Soutien désintéressé sans contrepartie publicitaire'
  },
  {
    number: '71833',
    label: 'Legs et donations d\'exploitation',
    classNumber: 7,
    type: 'produit',
    isSpecificAssociation: true
  },
  {
    number: '71834',
    label: 'Produits sur legs ou donations',
    classNumber: 7,
    type: 'produit',
    isSpecificAssociation: true
  },
  {
    number: '71835',
    label: 'Quotes-parts de générosités reçues (Appel à la générosité publique loi n°18-18)',
    classNumber: 7,
    type: 'produit',
    isSpecificAssociation: true
  },
  {
    number: '71836',
    label: 'Abandons de frais par les bénévoles',
    classNumber: 7,
    type: 'produit',
    isSpecificAssociation: true,
    description: 'Bénévoles renonçant formellement au remboursement de leurs frais réels'
  },
  {
    number: '7184',
    label: 'Contributions financières d\'organismes partenaires',
    classNumber: 7,
    type: 'produit',
    isSpecificAssociation: true
  },
  {
    number: '7187',
    label: 'Concours publics (Reversement de taxes ou participations légales)',
    classNumber: 7,
    type: 'produit',
    isSpecificAssociation: true
  },
  {
    number: '7381',
    label: 'Intérêts bancaires et produits financiers',
    classNumber: 7,
    type: 'produit'
  },
  {
    number: '7511',
    label: 'Produits des cessions des immobilisations reçues en legs ou donations',
    classNumber: 7,
    type: 'produit',
    isSpecificAssociation: true
  }
];

export const JOURNALS_LIST = [
  { code: 'AC', name: 'Journal des Achats & Frais', type: 'achats', defaultAccount: '4411' },
  { code: 'VT', name: 'Journal des Recettes & Cotisations', type: 'recettes', defaultAccount: '71711' },
  { code: 'BQ', name: 'Journal de Banque (Attijariwafa)', type: 'banque', defaultAccount: '514101' },
  { code: 'CA', name: 'Journal de Caisse (Siège)', type: 'caisse', defaultAccount: '516101' },
  { code: 'OD', name: 'Journal des Opérations Diverses', type: 'od', defaultAccount: '' }
] as const;
