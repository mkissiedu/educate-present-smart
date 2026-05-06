import { ImportedLesson, ValidationError, VALID_SUBJECTS, VALID_CLASSES } from './bulk-import-types';

export function validateLesson(lesson: Partial<ImportedLesson>, index: number): ValidationError[] {
  const errors: ValidationError[] = [];
  const row = index + 1;

  if (!lesson.title?.trim()) {
    errors.push({ row, field: 'title', message: 'Lesson title is required' });
  }

  if (!lesson.subject || !VALID_SUBJECTS.includes(lesson.subject)) {
    errors.push({ row, field: 'subject', message: `Invalid subject. Must be one of: ${VALID_SUBJECTS.join(', ')}` });
  }

  if (!lesson.class || !VALID_CLASSES.includes(lesson.class)) {
    errors.push({ row, field: 'class', message: `Invalid class. Must be one of: ${VALID_CLASSES.join(', ')}` });
  }

  const week = Number(lesson.week);
  if (isNaN(week) || week < 1 || week > 12) {
    errors.push({ row, field: 'week', message: 'Week must be a number between 1 and 12' });
  }

  const lessonNum = Number(lesson.lessonNumber);
  if (isNaN(lessonNum) || lessonNum < 1 || lessonNum > 5) {
    errors.push({ row, field: 'lessonNumber', message: 'Lesson number must be between 1 and 5' });
  }

  if (!lesson.duration?.trim()) {
    errors.push({ row, field: 'duration', message: 'Duration is required' });
  }

  return errors;
}

export function validateSlide(slide: any, lessonIndex: number, slideIndex: number): ValidationError[] {
  const errors: ValidationError[] = [];
  const row = lessonIndex + 1;

  if (!slide.content && slideIndex === 0) {
    errors.push({ row, field: `slide${slideIndex + 1}`, message: 'First slide content is required' });
  }

  return errors;
}
