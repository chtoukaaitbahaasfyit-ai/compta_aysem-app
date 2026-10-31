/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Gestion Électronique des Documents & Archives Google Drive pour ASSOCIATION COMPTA PRO
 */

import React, { useState } from 'react';
import {
  FolderArchive,
  Plus,
  Search,
  Download,
  Eye,
  FileText,
  Folder,
  Upload,
  Link,
  Paperclip,
  CheckCircle2
} from 'lucide-react';
import { DocumentArchive } from '../types/accounting';

interface DocumentsManagerProps {
  documents: DocumentArchive[];
  onUpdateDocuments: (docs: DocumentArchive[]) => void;
}

export const DocumentsManager: React.FC<DocumentsManagerProps> = ({
  documents,
  onUpdateDocuments
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedDocPreview, setSelectedDocPreview] = useState<DocumentArchive | null>(null);

  // New document form
  const [title, setTitle] = useState('');
  const [type, setType] = useState<DocumentArchive['type']>('facture');
  const [fileName, setFileName] = useState('');
  const [folder, setFolder] = useState('01_Factures_Fournisseurs');
  const [linkedPiece, setLinkedPiece] = useState('');
  const [description, setDescription] = useState('');

  const driveFolders = [
    '01_Factures_Fournisseurs',
    '02_Recus_Dons_Mecenat',
    '03_Conventions_Subventions_INDH',
    '04_Releves_Bancaires',
    '05_Fiches_Adherents_Cotisations',
    '06_Rapports_Financiers_PV'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !fileName.trim()) {
      alert('Veuillez renseigner le titre et le nom du fichier.');
      return;
    }

    const newDoc: DocumentArchive = {
      id: `doc-${Date.now()}`,
      title: title.trim(),
      type,
      date: new Date().toISOString().split('T')[0],
      fileName: fileName.trim(),
      fileSize: '450 KB',
      googleDriveFolder: `Drive / Association_Compta_Pro_Archives / ${folder}`,
      linkedPieceNumber: linkedPiece.trim() || undefined,
      description: description.trim() || undefined
    };

    onUpdateDocuments([newDoc, ...documents]);
    setShowModal(false);
    setTitle('');
    setFileName('');
    setLinkedPiece('');
    setDescription('');
  };

  const filteredDocs = documents.filter(d => {
    const matchesSearch =
      d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.linkedPieceNumber && d.linkedPieceNumber.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFolder = selectedFolder === 'all' || d.googleDriveFolder.includes(selectedFolder);
    return matchesSearch && matchesFolder;
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Title & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4 no-print">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FolderArchive className="w-5 h-5 text-blue-700" />
            Documents, Pièces Justificatives & Archives GED
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Classement méthodique des factures, reçus, conventions et relevés avec structure Google Drive
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded bg-blue-700 hover:bg-blue-600 text-white shadow-sm transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Archiver un Document</span>
        </button>
      </div>

      {/* Drive folders visual tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs no-print">
        {driveFolders.map(f => {
          const count = documents.filter(d => d.googleDriveFolder.includes(f)).length;
          const isSelected = selectedFolder === f;
          return (
            <div
              key={f}
              onClick={() => setSelectedFolder(isSelected ? 'all' : f)}
              className={`p-3 rounded-lg border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-blue-900 text-white border-blue-950 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-blue-400'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-2">
                <Folder className={`w-4 h-4 ${isSelected ? 'text-sky-300' : 'text-amber-500'}`} />
                <span className="font-semibold truncate text-[11px]">{f.replace(/^[0-9]+_/, '')}</span>
              </div>
              <span className={`text-[10px] ${isSelected ? 'text-blue-200' : 'text-slate-400'}`}>
                {count} document{count > 1 ? 's' : ''}
              </span>
            </div>
          );
        })}
      </div>

      {/* Search and list */}
      <div className="bg-white rounded-lg border border-slate-300 shadow-xs overflow-hidden">
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
          <div className="relative w-80">
            <Search className="w-4 h-4 absolute left-3 top-2 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher par titre, fichier, N° pièce liée..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1 bg-white border border-slate-200 rounded text-xs"
            />
          </div>

          <div className="flex items-center gap-2">
            {selectedFolder !== 'all' && (
              <button
                onClick={() => setSelectedFolder('all')}
                className="text-xs text-blue-600 hover:underline font-semibold"
              >
                Afficher tous les dossiers
              </button>
            )}
            <span className="text-slate-500">{filteredDocs.length} documents répertoriés</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-900 text-white font-semibold">
              <tr>
                <th className="py-2.5 px-4">Titre du Document</th>
                <th className="py-2.5 px-3 w-28">Type</th>
                <th className="py-2.5 px-3 w-24">Date</th>
                <th className="py-2.5 px-3 w-40">Nom de Fichier</th>
                <th className="py-2.5 px-3 w-32 font-mono">Pièce Comptable</th>
                <th className="py-2.5 px-3">Dossier Google Drive</th>
                <th className="py-2.5 px-3 text-center w-28">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal">
              {filteredDocs.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 px-4 font-bold text-slate-900">
                    {doc.title}
                    {doc.description && (
                      <span className="block text-[11px] text-slate-400 font-normal">{doc.description}</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 uppercase">
                      {doc.type}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 font-mono">{doc.date}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-700 flex items-center gap-1">
                    <Paperclip className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate max-w-[140px]">{doc.fileName}</span>
                  </td>
                  <td className="py-2.5 px-3 font-mono font-semibold text-blue-700">
                    {doc.linkedPieceNumber || '-'}
                  </td>
                  <td className="py-2.5 px-3 text-slate-500 text-[11px] truncate max-w-[200px]">
                    {doc.googleDriveFolder}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <button
                      type="button"
                      onClick={() => setSelectedDocPreview(doc)}
                      className="p-1 text-slate-500 hover:text-blue-700 hover:bg-slate-100 rounded cursor-pointer"
                      title="Prévisualiser la pièce justificative"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Preview modal */}
      {selectedDocPreview && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full border border-slate-300 overflow-hidden text-xs">
            <div className="px-5 py-3 bg-slate-900 text-white font-bold flex items-center justify-between">
              <span>Aperçu de la Pièce Justificative</span>
              <button onClick={() => setSelectedDocPreview(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="p-6 space-y-4">
              <div className="text-center p-8 bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg">
                <FileText className="w-12 h-12 text-blue-700 mx-auto mb-2" />
                <h4 className="font-bold text-sm text-slate-900">{selectedDocPreview.title}</h4>
                <p className="font-mono text-xs text-slate-500 mt-1">{selectedDocPreview.fileName} ({selectedDocPreview.fileSize || '350 KB'})</p>
                <div className="mt-3 text-[11px] text-slate-400">
                  Emplacement Drive : {selectedDocPreview.googleDriveFolder}
                </div>
              </div>

              <div className="space-y-1 text-slate-700">
                <div><strong>Date :</strong> {selectedDocPreview.date}</div>
                <div><strong>N° Pièce Comptable Liée :</strong> {selectedDocPreview.linkedPieceNumber || 'Non rattaché'}</div>
                <div><strong>Description :</strong> {selectedDocPreview.description || 'Document archivé'}</div>
              </div>
            </div>

            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedDocPreview(null)}
                className="px-4 py-1.5 rounded border border-slate-300 text-slate-700 hover:bg-white"
              >
                Fermer
              </button>
              <button
                type="button"
                onClick={() => alert(`Téléchargement de la pièce justificative ${selectedDocPreview.fileName} depuis les archives sécurisées.`)}
                className="px-4 py-1.5 rounded bg-blue-700 hover:bg-blue-600 text-white font-bold flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Télécharger Fichier</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Add Document */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full border border-slate-300 overflow-hidden text-xs">
            <div className="px-5 py-3 bg-slate-900 text-white font-bold flex items-center justify-between">
              <span>Archiver une Pièce Justificative</span>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Titre descriptif du document *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Facture Pharmacie Centrale F-9912"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded font-medium focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Type de document *</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded bg-white"
                  >
                    <option value="facture">Facture Fournisseur</option>
                    <option value="recu">Reçu de don / quittance</option>
                    <option value="convention">Convention de subvention</option>
                    <option value="bon_commande">Bon de commande</option>
                    <option value="releve">Relevé bancaire</option>
                    <option value="pv">Procès-verbal d'AG</option>
                    <option value="autre">Autre justificatif</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Dossier Google Drive *</label>
                  <select
                    value={folder}
                    onChange={(e) => setFolder(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded bg-white font-mono"
                  >
                    {driveFolders.map(f => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nom du fichier PDF / Image *</label>
                  <input
                    type="text"
                    required
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    placeholder="Ex: Facture_9912.pdf"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">N° Pièce Comptable Liée</label>
                  <input
                    type="text"
                    value={linkedPiece}
                    onChange={(e) => setLinkedPiece(e.target.value)}
                    placeholder="Ex: AC-2026-0001"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Remarques / Observations</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ex: Facture originale acquittée et certifiée conforme"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-1.5 rounded border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-blue-700 hover:bg-blue-600 text-white font-bold cursor-pointer"
                >
                  Enregistrer l'archive
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
