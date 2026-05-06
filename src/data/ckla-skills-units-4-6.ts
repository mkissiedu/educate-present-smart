import { Lesson } from '../types/lesson';

export const skillsUnits4to6: Lesson[] = [
  {
    id: 'skills-u4',
    title: 'Unit 4: Letter Sounds A-M',
    subject: "Ananse's Phonics",
    class: 'KG 1',
    week: 2,
    lessonNumber: 1,
    duration: '50 min',
    thumbnailUrl: 'https://d64gsuwffb70l.cloudfront.net/69292778b5e860d8b45503e2_1764304867883_0d195761.webp',
    isFavorite: false,
    slides: [
      { id: 's4-1', title: 'Letters and Sounds', content: '<h1>Unit 4: Letter Sounds A-M</h1><p>Letters make sounds! A says /a/ as in apple.</p>', type: 'text', teacherNotes: 'Introduce letter-sound correspondence for A-M. Use picture cards.' },
      { id: 's4-2', title: 'Letter A', content: 'A says /a/. Apple starts with A.', type: 'image', imageUrl: 'https://d64gsuwffb70l.cloudfront.net/69292778b5e860d8b45503e2_1764304867883_0d195761.webp', teacherNotes: 'Show letter A. Practice /a/ sound. Show pictures of apple, ant, alligator.' },
      { id: 's4-3', title: 'Letter Sound Quiz', content: 'What sound does M make?', type: 'quiz', teacherNotes: 'Assess letter-sound knowledge for A-M.' }
    ]
  },
  {
    id: 'skills-u5',
    title: 'Unit 5: Letter Sounds N-Z',
    subject: "Ananse's Phonics",
    class: 'KG 2',
    week: 2,
    lessonNumber: 2,
    duration: '50 min',
    thumbnailUrl: 'https://d64gsuwffb70l.cloudfront.net/69292778b5e860d8b45503e2_1764304868767_fd458945.webp',
    isFavorite: false,
    slides: [
      { id: 's5-1', title: 'More Letters', content: '<h1>Unit 5: Letter Sounds N-Z</h1><p>Learning the rest of the alphabet sounds!</p>', type: 'text', teacherNotes: 'Complete alphabet with N-Z. Focus on tricky letters like Q, X, Z.' },
      { id: 's5-2', title: 'Letter Practice', content: 'Which letter says /z/?', type: 'quiz', teacherNotes: 'Review all 26 letter sounds.' }
    ]
  },
  {
    id: 'skills-u6',
    title: 'Unit 6: Blending CVC Words',
    subject: "Ananse's Phonics",
    class: 'KG 2',
    week: 2,
    lessonNumber: 3,
    duration: '55 min',
    thumbnailUrl: 'https://d64gsuwffb70l.cloudfront.net/69292778b5e860d8b45503e2_1764304870623_dd5e6af7.webp',
    isFavorite: false,
    slides: [
      { id: 's6-1', title: 'Blending Sounds', content: '<h1>Unit 6: Blending CVC Words</h1><p>/c/ /a/ /t/ = cat</p><p>Put sounds together to read words!</p>', type: 'text', teacherNotes: 'Teach blending consonant-vowel-consonant words. Model slowly then faster.' },
      { id: 's6-2', title: 'Blend It', content: 'Blend these sounds: /m/ /a/ /p/', type: 'quiz', teacherNotes: 'Students practice blending to read CVC words.' }
    ]
  }
];
