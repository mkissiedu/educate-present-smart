import { ImportResult } from './bulk-import-types';

const FUNCTION_URL = 'https://api.databasepad.com/functions/v1/parse-document';

export async function parseDocument(file: File): Promise<ImportResult> {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch(FUNCTION_URL, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      return {
        lessons: [],
        errors: [{ row: 0, field: 'file', message: errorData.error || `Server error: ${response.status}` }],
        warnings: []
      };
    }

    const data = await response.json();
    
    if (data.error) {
      return {
        lessons: [],
        errors: [{ row: 0, field: 'file', message: data.error }],
        warnings: []
      };
    }

    return data as ImportResult;
  } catch (err: any) {
    console.error('Document parse error:', err);
    return {
      lessons: [],
      errors: [{ row: 0, field: 'file', message: err.message || 'Failed to parse document' }],
      warnings: []
    };
  }
}

export const SUPPORTED_FILE_TYPES = {
  'text/csv': ['.csv'],
  'application/json': ['.json'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/pdf': ['.pdf'],
};

export const ACCEPTED_EXTENSIONS = '.csv,.json,.docx,.pdf';

export function getFileTypeLabel(fileName: string): string {
  const ext = fileName.toLowerCase().split('.').pop();
  switch (ext) {
    case 'csv': return 'CSV Spreadsheet';
    case 'json': return 'JSON Data';
    case 'docx': return 'Word Document';
    case 'pdf': return 'PDF Document';
    default: return 'Unknown';
  }
}

export function isValidFileType(fileName: string): boolean {
  const ext = fileName.toLowerCase();
  return ext.endsWith('.csv') || ext.endsWith('.json') || 
         ext.endsWith('.docx') || ext.endsWith('.pdf');
}
