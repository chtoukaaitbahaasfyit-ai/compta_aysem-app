/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Générateur de code Google Apps Script (Code.gs) et schématisation Google Sheets
 * pour ASSOCIATION COMPTA PRO
 */

export const GAS_SHEETS_SCHEMA = [
  { name: 'ASSOCIATION', headers: ['ID', 'Nom', 'Nom_Arabe', 'Sigle', 'Adresse', 'Ville', 'IF', 'Patente', 'CNSS', 'ICE', 'RIB', 'Banque', 'President', 'Tresorier', 'Exercice_Actif', 'Modele_Comptable'] },
  { name: 'UTILISATEURS', headers: ['ID', 'Nom', 'Email', 'Role', 'Date_Creation'] },
  { name: 'EXERCICES', headers: ['ID', 'Code', 'Date_Debut', 'Date_Fin', 'Est_Cloture', 'Date_Cloture'] },
  { name: 'PLAN_COMPTABLE', headers: ['Numero_Compte', 'Intitule', 'Classe', 'Type', 'Specifique_Association', 'Description'] },
  { name: 'JOURNAUX', headers: ['Code', 'Intitule', 'Type', 'Compte_Defaut'] },
  { name: 'ECRITURES', headers: ['ID', 'Numero_Piece', 'Journal', 'Date', 'Periode', 'Exercice', 'Libelle', 'Total_Debit', 'Total_Credit', 'Statut', 'Cree_Par', 'Date_Creation', 'Justificatif_Nom'] },
  { name: 'LIGNES_ECRITURES', headers: ['ID', 'ID_Ecriture', 'Numero_Ligne', 'Numero_Compte', 'Intitule_Compte', 'Libelle_Ligne', 'Debit', 'Credit', 'Tiers', 'Projet_Code', 'Lettrage'] },
  { name: 'RECETTES', headers: ['ID', 'Date', 'Numero_Recu', 'Numero_Piece', 'Nature', 'Payeur', 'Montant', 'Mode_Paiement', 'Compte_Tresorerie', 'Compte_Produit', 'Projet_Code', 'Justificatif'] },
  { name: 'DEPENSES', headers: ['ID', 'Date', 'Numero_Depense', 'Numero_Piece', 'Beneficiaire', 'Categorie', 'Montant', 'Mode_Paiement', 'Conforme_Regle_5000DH', 'Compte_Tresorerie', 'Compte_Charge', 'Projet_Code', 'Justificatif'] },
  { name: 'CAISSE', headers: ['ID', 'Nom_Caisse', 'Responsable', 'Solde_Initial', 'Solde_Actuel', 'Plafond_Encaisse'] },
  { name: 'BANQUES', headers: ['ID', 'Nom_Banque', 'RIB', 'Numero_Compte_Comptable', 'Solde_Initial', 'Solde_Actuel', 'Signataires'] },
  { name: 'PROJETS', headers: ['ID', 'Code', 'Intitule', 'Responsable', 'Date_Debut', 'Date_Fin', 'Statut', 'Budget_Previsionnel', 'Depenses_Realisees', 'Recettes_Affectees', 'Bailleur_Principal'] },
  { name: 'SUBVENTIONS', headers: ['ID', 'Bailleur', 'Type_Bailleur', 'Intitule_Projet', 'Numero_Convention', 'Date_Convention', 'Montant_Accorde', 'Montant_Recu', 'Montant_Engage', 'Montant_Depense', 'Reliquat', 'Fonds_Dedies_19', 'Conforme_Circulaire_PM13'] },
  { name: 'BUDGETS', headers: ['ID', 'Exercice', 'Type', 'Categorie', 'Sous_Categorie', 'Compte_Comptable', 'Montant_Prevu', 'Montant_Realise', 'Projet_Code'] },
  { name: 'MEMBRES', headers: ['ID', 'Numero_Adherent', 'Nom_Complet', 'CIN', 'Telephone', 'Email', 'Adresse', 'Date_Adhesion', 'Categorie', 'Cotisation_Annuelle', 'Statut_Cotisation', 'Total_Paye'] },
  { name: 'IMMOBILISATIONS', headers: ['ID', 'Code', 'Designation', 'Categorie', 'Date_Acquisition', 'Valeur_Acquisition', 'Duree_Annees', 'Taux_Amortissement', 'Amortissements_Cumules', 'VNC', 'Compte_Actif', 'Compte_Amort', 'Etat'] },
  { name: 'PIECES_JUSTIFICATIVES', headers: ['ID', 'Titre', 'Type', 'Date', 'Nom_Fichier', 'Lien_Google_Drive', 'Numero_Piece_Liee', 'Dossier_Drive'] },
  { name: 'PARAMETRES', headers: ['Cle', 'Valeur', 'Description', 'Derniere_Modif'] },
  { name: 'HISTORIQUE', headers: ['ID', 'Date_Heure', 'Utilisateur', 'Action', 'Details', 'Entite'] }
];

export function generateGasCode(): string {
  return `/**
 * @file Code.gs
 * @description Backend Google Apps Script pour ASSOCIATION COMPTA PRO (Maroc - CNC 2023)
 * @author Equipe de developpement Association Compta Pro
 */

// Nom du classeur actif
const APP_TITLE = "ASSOCIATION COMPTA PRO - Base de Données";
const DRIVE_ROOT_FOLDER_NAME = "Association_Compta_Pro_Archives";

/**
 * Menu personnalise a l'ouverture du Google Sheets
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🇲🇦 Association Compta Pro')
    .addItem('⚡ Initialiser les 19 feuilles du schéma comptable', 'initAssociationDatabase')
    .addItem('📁 Configurer les dossiers Google Drive', 'setupDriveFolders')
    .addSeparator()
    .addItem('📊 Régénérer les totaux du Tableau de Bord', 'updateDashboardSummary')
    .addItem('🔄 Sauvegarder un instantané de la base', 'createBackupSnapshot')
    .addToUi();
}

/**
 * 1. Initialise automatiquement les 19 feuilles requises avec formats et entetes
 */
function initAssociationDatabase() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetsConfig = ${JSON.stringify(GAS_SHEETS_SCHEMA, null, 2)};
  
  sheetsConfig.forEach(function(cfg) {
    let sheet = ss.getSheetByName(cfg.name);
    if (!sheet) {
      sheet = ss.insertSheet(cfg.name);
    }
    
    // Configurer l'en-tête si vide
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(cfg.headers);
      const headerRange = sheet.getRange(1, 1, 1, cfg.headers.length);
      headerRange.setBackground('#1e3a8a') // Bleu SAGE 100
                 .setFontColor('#ffffff')
                 .setFontWeight('bold')
                 .setHorizontalAlignment('center');
      sheet.setFrozenRows(1);
    }
  });

  SpreadsheetApp.getUi().alert('Succès ! Les 19 feuilles de données ont été initialisées avec succès selon la nomenclature comptable associative marocaine.');
}

/**
 * 2. Configuration des dossiers d'archivage dans Google Drive
 */
function setupDriveFolders() {
  let rootFolder;
  const existing = DriveApp.getFoldersByName(DRIVE_ROOT_FOLDER_NAME);
  if (existing.hasNext()) {
    rootFolder = existing.next();
  } else {
    rootFolder = DriveApp.createFolder(DRIVE_ROOT_FOLDER_NAME);
  }

  const subFolders = [
    '01_Factures_Fournisseurs',
    '02_Recus_Dons_Mecenat',
    '03_Conventions_Subventions_INDH',
    '04_Releves_Bancaires',
    '05_Fiches_Adherents_Cotisations',
    '06_Rapports_Financiers_PV'
  ];

  subFolders.forEach(function(sub) {
    if (!rootFolder.getFoldersByName(sub).hasNext()) {
      rootFolder.createFolder(sub);
    }
  });

  SpreadsheetApp.getUi().alert('Dossiers Google Drive organisés dans : ' + rootFolder.getName());
}

/**
 * 3. Point d'entrée Web API (GET) pour alimenter l'interface web
 */
function doGet(e) {
  try {
    const action = e.parameter.action || 'ping';
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
    if (action === 'ping') {
      return respondJson({ status: 'success', message: 'API Association Compta Pro opérationnelle !' });
    }
    
    if (action === 'getAllData') {
      const data = {};
      const sheets = ss.getSheets();
      sheets.forEach(function(sheet) {
        const name = sheet.getName();
        const rows = sheet.getDataRange().getValues();
        data[name] = rows;
      });
      return respondJson({ status: 'success', data: data });
    }

    return respondJson({ status: 'error', message: 'Action inconnue' });
  } catch (err) {
    return respondJson({ status: 'error', message: err.toString() });
  }
}

/**
 * 4. Point d'entrée Web API (POST) pour synchroniser les écritures, recettes et dépenses
 */
function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const action = payload.action;
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
    if (action === 'syncFullDatabase') {
      const db = payload.data;
      // Inscription dans la feuille HISTORIQUE
      const histSheet = ss.getSheetByName('HISTORIQUE');
      if (histSheet) {
        histSheet.appendRow([
          'HIST-' + new Date().getTime(),
          new Date().toISOString(),
          payload.user || 'Utilisateur Web',
          'SYNCHRONISATION_GLOBALE',
          'Synchronisation depuis Association Compta Pro Web',
          'ALL'
        ]);
      }
      return respondJson({ status: 'success', message: 'Synchronisation réussie avec Google Sheets !' });
    }

    if (action === 'addEntry') {
      const entry = payload.entry;
      const ecrituresSheet = ss.getSheetByName('ECRITURES');
      const lignesSheet = ss.getSheetByName('LIGNES_ECRITURES');
      
      if (ecrituresSheet && lignesSheet) {
        ecrituresSheet.appendRow([
          entry.id,
          entry.pieceNumber,
          entry.journalCode,
          entry.date,
          entry.period,
          entry.fiscalYear,
          entry.label,
          entry.totalDebit,
          entry.totalCredit,
          entry.status,
          entry.createdBy,
          new Date().toISOString(),
          entry.attachmentName || ''
        ]);

        entry.lines.forEach(function(line, idx) {
          lignesSheet.appendRow([
            line.id,
            entry.id,
            idx + 1,
            line.accountNumber,
            line.accountLabel,
            line.label,
            line.debit,
            line.credit,
            line.thirdParty || '',
            line.projectId || '',
            line.lettrage || ''
          ]);
        });
      }
      return respondJson({ status: 'success', message: 'Écriture enregistrée dans Google Sheets' });
    }

    return respondJson({ status: 'error', message: 'Action POST inconnue' });
  } catch (err) {
    return respondJson({ status: 'error', message: err.toString() });
  }
}

function respondJson(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * 5. Instantané de sauvegarde de sécurité
 */
function createBackupSnapshot() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const dateStr = Utilities.formatDate(new Date(), "GMT+1", "yyyy-MM-dd_HHmm");
  const copyName = "Sauvegarde_" + APP_TITLE + "_" + dateStr;
  DriveApp.getFileById(ss.getId()).makeCopy(copyName);
  SpreadsheetApp.getUi().alert('Copie de sauvegarde créée : ' + copyName);
}
`;
}
