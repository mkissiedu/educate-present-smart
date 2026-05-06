import React, { useState, useRef } from 'react';
import { X, Upload, Download, FileJson, FileSpreadsheet, FileText, File, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { downloadTemplate } from '@/lib/bulk-import-templates';
import { ImportResult } from '@/lib/bulk-import-types';
import { BulkImportPreview } from './BulkImportPreview';
import { parseDocument, ACCEPTED_EXTENSIONS, isValidFileType, getFileTypeLabel } from '@/lib/document-parser';

interface Props {
  onClose: () => void;
  onImport: (result: ImportResult) => void;
}

export const BulkImportModal: React.FC<Props> = ({ onClose, onImport }) => {
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!isValidFileType(file.name)) {
      setImportResult({ lessons: [], errors: [{ row: 0, field: 'file', message: 'Unsupported file type. Use CSV, JSON, Word (.docx), or PDF.' }], warnings: [] });
      return;
    }
    setIsProcessing(true);
    setSelectedFile(`${file.name} (${getFileTypeLabel(file.name)})`);
    const result = await parseDocument(file);
    setImportResult(result);
    setIsProcessing(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleImport = () => {
    if (importResult && importResult.errors.length === 0) {
      onImport(importResult);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl border border-white/10">
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">Bulk Import Lessons</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-white/70 hover:text-white">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="mb-6">
            <h3 className="text-white font-semibold mb-3">Download Template</h3>
            <div className="grid grid-cols-3 gap-2">
              <Button onClick={() => downloadTemplate('csv')} variant="outline" className="bg-white/5 border-white/20 text-white hover:bg-white/10 text-xs">
                <FileSpreadsheet className="w-4 h-4 mr-1" /> CSV
              </Button>
              <Button onClick={() => downloadTemplate('json')} variant="outline" className="bg-white/5 border-white/20 text-white hover:bg-white/10 text-xs">
                <FileJson className="w-4 h-4 mr-1" /> JSON
              </Button>
              <Button onClick={() => downloadTemplate('word')} variant="outline" className="bg-white/5 border-white/20 text-white hover:bg-white/10 text-xs">
                <FileText className="w-4 h-4 mr-1" /> Word
              </Button>
            </div>
          </div>

          <div className="mb-4 p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg">
            <p className="text-blue-200 text-sm"><strong>Supported formats:</strong> CSV, JSON, Word (.docx), PDF</p>
          </div>

          <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${dragOver ? 'border-blue-400 bg-blue-500/10' : 'border-white/20'}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)} onDrop={handleDrop}>
            {isProcessing ? (
              <div className="space-y-2">
                <Loader2 className="w-10 h-10 text-blue-400 mx-auto animate-spin" />
                <p className="text-white/70 text-sm">Processing {selectedFile}...</p>
              </div>
            ) : (
              <>
                <Upload className="w-10 h-10 text-white/40 mx-auto mb-3" />
                <p className="text-white/70 mb-2">Drag & drop your file here</p>
                <p className="text-white/50 text-xs mb-3">CSV, JSON, Word (.docx), or PDF</p>
                <Button onClick={() => fileInputRef.current?.click()} variant="secondary" size="sm">Browse Files</Button>
                <input ref={fileInputRef} type="file" accept={ACCEPTED_EXTENSIONS} className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
              </>
            )}
          </div>

          {selectedFile && !isProcessing && <p className="text-white/60 text-sm mt-2 text-center">Selected: {selectedFile}</p>}
          {importResult && <div className="mt-6"><BulkImportPreview {...importResult} /></div>}
        </div>

        <div className="p-4 border-t border-white/10 flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose} className="text-white/70">Cancel</Button>
          <Button onClick={handleImport} disabled={!importResult || importResult.errors.length > 0}
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700">
            Import {importResult?.lessons.length || 0} Lessons
          </Button>
        </div>
      </div>
    </div>
  );
};
