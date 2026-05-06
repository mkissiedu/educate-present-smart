import { ImportedLesson, ImportedSlide, ImportResult, SLIDE_TITLES } from './bulk-import-types';
import { validateLesson } from './bulk-import-validation';

export function parseCSV(csvText: string): ImportResult {
  const lines = csvText.split('\n').filter(line => line.trim());
  if (lines.length < 2) return { lessons: [], errors: [{ row: 0, field: 'file', message: 'CSV must have header and data rows' }], warnings: [] };

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  const lessons: ImportedLesson[] = [];
  const errors: any[] = [];
  const warnings: string[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => { row[h] = values[idx] || ''; });

    const lesson = createLessonFromRow(row);
    const validationErrors = validateLesson(lesson, i - 1);
    
    if (validationErrors.length === 0) {
      lessons.push(lesson as ImportedLesson);
    } else {
      errors.push(...validationErrors);
    }
  }

  return { lessons, errors, warnings };
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (const char of line) {
    if (char === '"') inQuotes = !inQuotes;
    else if (char === ',' && !inQuotes) { result.push(current.trim()); current = ''; }
    else current += char;
  }
  result.push(current.trim());
  return result;
}

function createLessonFromRow(row: Record<string, string>): Partial<ImportedLesson> {
  const slides: ImportedSlide[] = SLIDE_TITLES.map((title, idx) => ({
    slideNumber: idx + 1,
    title,
    content: row[`slide${idx + 1}_content`] || '',
    type: 'text' as const,
    teacherNotes: row[`slide${idx + 1}_notes`] || '',
  }));

  return {
    title: row.title || row.lesson_title,
    subject: row.subject,
    class: row.class || row.class_level,
    week: parseInt(row.week) || 1,
    lessonNumber: parseInt(row.lesson_number || row.lessonnumber) || 1,
    duration: row.duration || '30 minutes',
    thumbnailUrl: row.thumbnail_url || row.thumbnailurl,
    slides
  };
}

export function parseJSON(jsonText: string): ImportResult {
  try {
    const data = JSON.parse(jsonText);
    const lessonsArray = Array.isArray(data) ? data : [data];
    const lessons: ImportedLesson[] = [];
    const errors: any[] = [];

    lessonsArray.forEach((item, idx) => {
      const validationErrors = validateLesson(item, idx);
      if (validationErrors.length === 0) {
        lessons.push(normalizeJSONLesson(item));
      } else {
        errors.push(...validationErrors);
      }
    });

    return { lessons, errors, warnings: [] };
  } catch (e) {
    return { lessons: [], errors: [{ row: 0, field: 'file', message: 'Invalid JSON format' }], warnings: [] };
  }
}

function normalizeJSONLesson(data: any): ImportedLesson {
  const slides = data.slides?.length ? data.slides : SLIDE_TITLES.map((title, idx) => ({
    slideNumber: idx + 1, title, content: '', type: 'text', teacherNotes: ''
  }));

  return { ...data, slides };
}
