import { Lesson } from '../types/lesson';

export const skillsUnits1to3: Lesson[] = [
  {
    id: 'skills-u1',
    title: 'Unit 1: Listening for Sounds',
    subject: "Ananse's Phonics",
    class: 'Nursery',
    week: 1,
    lessonNumber: 1,
    duration: '45 min',
    thumbnailUrl: 'https://d64gsuwffb70l.cloudfront.net/69292778b5e860d8b45503e2_1764306724330_aeecf81f.webp',
    isFavorite: true,
    slides: [
      { id: 's1-1', title: 'Introduction to Sounds', content: '<h1>Unit 1: Listening for Sounds</h1><p>We will learn to listen carefully to sounds around us.</p>', type: 'text', teacherNotes: 'Introduce phonological awareness. Students learn to distinguish environmental sounds before letter sounds.' },
      { id: 's1-2', title: 'Environmental Sounds', content: 'What sounds do you hear?', type: 'image', imageUrl: 'https://d64gsuwffb70l.cloudfront.net/69292778b5e860d8b45503e2_1764306724330_aeecf81f.webp', teacherNotes: 'Play recordings: dog bark, car horn, water running. Have students identify each.' },
      { id: 's1-3', title: 'Sound Quiz', content: 'Can you match the sound?', type: 'quiz', teacherNotes: 'Assessment of listening skills.' }
    ]
  },
  {
    id: 'skills-u2',
    title: 'Unit 2: Rhyming Words',
    subject: "Ananse's Phonics",
    class: 'KG 1',
    week: 1,
    lessonNumber: 2,
    duration: '45 min',
    thumbnailUrl: 'https://d64gsuwffb70l.cloudfront.net/69292778b5e860d8b45503e2_1764304864151_c71adc13.webp',
    isFavorite: false,
    slides: [
      { id: 's2-1', title: 'What is Rhyming?', content: '<h1>Unit 2: Rhyming Words</h1><p>Words that end with the same sound rhyme!</p><p>Examples: cat/hat, dog/log</p>', type: 'text', teacherNotes: 'Teach rhyming as words with same ending sounds.' },
      { id: 's2-2', title: 'Rhyme Time', content: 'Cat rhymes with...', type: 'quiz', teacherNotes: 'Present word pairs. Students identify rhymes.' }
    ]
  },
  {
    id: 'skills-u3',
    title: 'Unit 3: Beginning Sounds',
    subject: "Ananse's Phonics",
    class: 'KG 1',
    week: 1,
    lessonNumber: 3,
    duration: '50 min',
    thumbnailUrl: 'https://d64gsuwffb70l.cloudfront.net/69292778b5e860d8b45503e2_1764304865994_85b587d4.webp',
    isFavorite: false,
    slides: [
      { id: 's3-1', title: 'First Sounds', content: '<h1>Unit 3: Beginning Sounds</h1><p>Every word starts with a sound. Listen: /b/ /b/ ball</p>', type: 'text', teacherNotes: 'Focus on initial phonemes. Model isolating first sound.' },
      { id: 's3-2', title: 'Beginning Sound Practice', content: 'What sound does "sun" start with?', type: 'quiz', teacherNotes: 'Students identify initial sounds in spoken words.' }
    ]
  }
];
