"use client";

import * as React from "react";

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (docData: any) => void;
}

const DocumentUploadModal = ({ isOpen, onClose, onUpload }: DocumentUploadModalProps) => {
  const [name, setName] = React.useState('');
  const [type, setType] = React.useState('');
  const [file, setFile] = React.useState<File | null>(null);
  const [dragActive, setDragActive] = React.useState(false);
  
  const documentTypes = [
    { key: 'statutes', label: 'Statuts du club' },
    { key: 'legal_receipt', label: 'Recepisse legal' },
    { key: 'bank_certificate', label: 'Attestation bancaire' },
    { key: 'insurance', label: 'Assurance du club' },
    { key: 'ag_pv', label: 'PV d\'Assemblee Generale' },
    { key: 'other', label: 'Autre document' },
  ];
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && type && file) {
      const docData = {
        file: file,
        name: name || file.name,
        type,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`
      };
      onUpload(docData);
      // Reset form
      setName('');
      setType('');
      setFile(null);
      onClose();
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
        if (!name) {
          setName(selectedFile.name);
        }
      }
    }
  };
  
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (validateFile(droppedFile)) {
        setFile(droppedFile);
        if (!name) {
          setName(droppedFile.name);
        }
      }
    }
  };
  
  const validateFile = (file: File): boolean => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'];
    
    if (file.size > maxSize) {
      alert('Le fichier est trop volumineux. Taille maximale : 10MB');
      return false;
    }
    
    if (!allowedTypes.includes(file.type)) {
      alert('Type de fichier non autorisé. Formats acceptés : PDF, DOC, DOCX, JPG, PNG');
      return false;
    }
    
    return true;
  };
  
  const removeFile = () => {
    setFile(null);
    setName('');
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">Ajouter un document</h3>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type de document *</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                required
              >
                <option value="">Selectionner un type</option>
                {documentTypes.map(docType => (
                  <option key={docType.key} value={docType.key}>{docType.label}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nom du fichier</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                placeholder="Nom du document"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Fichier *</label>
            <div 
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive 
                  ? 'border-brand-400 bg-brand-50' 
                  : 'border-gray-300 hover:border-brand-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                required={!file}
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                {file ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-center text-green-600">
                      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{file.name}</p>
                      <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        removeFile();
                      }}
                      className="text-sm text-red-600 hover:text-red-800 font-medium"
                    >
                      Supprimer le fichier
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="text-brand-600 mb-3">
                      <svg className="mx-auto h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <p className="text-gray-600 mb-1">Glisser-déposer ou cliquer pour sélectionner</p>
                    <p className="text-sm text-gray-500">PDF, DOC, DOCX, JPG, PNG jusqu'à 10MB</p>
                  </div>
                )}
              </label>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={!type || !file}
              className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Ajouter le document
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DocumentUploadModal;