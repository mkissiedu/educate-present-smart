import { SLIDE_TITLES, VALID_SUBJECTS, VALID_CLASSES } from './bulk-import-types';

export function generateCSVTemplate(): string {
  const headers = [
    'title', 'subject', 'class', 'week', 'lesson_number', 'duration', 'thumbnail_url',
    ...SLIDE_TITLES.flatMap((_, i) => [`slide${i + 1}_content`, `slide${i + 1}_notes`])
  ];

  const exampleRow = [
    'Introduction to Numbers', 'Numeracy', 'KG 1', '1', '1', '30 minutes', '',
    'Welcome to our lesson on numbers!', 'Greet students warmly',
    'Today we will learn about counting 1-10', 'Review learning objectives',
    'Counting blocks, number cards', 'Prepare materials beforehand',
    'Use songs to help remember', 'Engage kinesthetic learners',
    'Visual aids for struggling students', 'Pair advanced with beginners',
    'one, two, three, count, number', 'Write on board clearly',
    'Let\'s sing the counting song!', 'Get students moving',
    'Show how numbers work', 'Use manipulatives',
    'Practice counting objects', 'Monitor progress',
    'Count items independently', 'Provide support as needed',
    'We use numbers every day!', 'Connect to real life',
    'What did we learn today?', 'Review key points'
  ];

  return [headers.join(','), exampleRow.map(v => `"${v}"`).join(',')].join('\n');
}

export function generateJSONTemplate(): string {
  const template = {
    lessons: [{
      title: 'Introduction to Numbers',
      subject: 'Numeracy',
      class: 'KG 1',
      week: 1,
      lessonNumber: 1,
      duration: '30 minutes',
      slides: SLIDE_TITLES.map((title, idx) => ({
        slideNumber: idx + 1, title, content: `Content for ${title}`, type: 'text', teacherNotes: `Notes for ${title}`
      }))
    }],
    validSubjects: VALID_SUBJECTS,
    validClasses: VALID_CLASSES
  };
  return JSON.stringify(template, null, 2);
}

export function generateWordTemplate(): string {
  return `LESSON PLAN TEMPLATE
==================

Title: Introduction to Numbers
Subject: Numeracy
Class: KG 1
Week: 1
Lesson Number: 1
Duration: 30 minutes

---

${SLIDE_TITLES.map((title, idx) => `${title}:
[Enter content for ${title} here]

Teacher Notes:
[Enter teacher notes here]

`).join('---\n\n')}
---

INSTRUCTIONS:
- Fill in each section with your lesson content
- Separate multiple lessons with "---" or "Lesson 2", "Lesson 3", etc.
- Valid Subjects: ${VALID_SUBJECTS.join(', ')}
- Valid Classes: ${VALID_CLASSES.join(', ')}`;
}

export function downloadTemplate(type: 'csv' | 'json' | 'word'): void {
  let content: string, mimeType: string, ext: string;
  
  if (type === 'csv') {
    content = generateCSVTemplate();
    mimeType = 'text/csv';
    ext = 'csv';
  } else if (type === 'json') {
    content = generateJSONTemplate();
    mimeType = 'application/json';
    ext = 'json';
  } else {
    content = generateWordTemplate();
    mimeType = 'text/plain';
    ext = 'txt';
  }
  
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `lesson-import-template.${ext}`;
  a.click();
  URL.revokeObjectURL(url);
}
