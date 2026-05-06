import { Lesson } from '../types/lesson';

export const knowledgeDomains1to4: Lesson[] = [
  {
    id: 'know-d1',
    title: 'Domain 1: Nursery Rhymes & Fables',
    subject: 'Language & Literacy',
    class: 'Nursery',
    week: 4,
    lessonNumber: 1,
    duration: '40 min',
    thumbnailUrl: 'https://d64gsuwffb70l.cloudfront.net/69292778b5e860d8b45503e2_1764304864151_c71adc13.webp',
    isFavorite: true,
    slides: [
      { id: 'k1-1', title: 'Nursery Rhymes', content: '<h1>Nursery Rhymes & Fables</h1><p>Classic rhymes and stories passed down through generations.</p>', type: 'text', teacherNotes: 'Introduce oral tradition. Discuss rhyme and rhythm.' },
      { id: 'k1-2', title: 'Humpty Dumpty', content: '<h2>Humpty Dumpty</h2><p>Humpty Dumpty sat on a wall,<br>Humpty Dumpty had a great fall...</p>', type: 'text', teacherNotes: 'Recite together. Discuss what happened. Act it out.' },
      { id: 'k1-3', title: 'Comprehension', content: 'Where did Humpty Dumpty sit?', type: 'quiz', teacherNotes: 'Check understanding of story details.' }
    ]
  },
  {
    id: 'know-d2',
    title: 'Domain 2: The Five Senses',
    subject: 'Our World Our People',
    class: 'Nursery',
    week: 4,
    lessonNumber: 2,
    duration: '45 min',
    thumbnailUrl: 'https://d64gsuwffb70l.cloudfront.net/69292778b5e860d8b45503e2_1764304865994_85b587d4.webp',
    isFavorite: false,
    slides: [
      { id: 'k2-1', title: 'Our Five Senses', content: '<h1>The Five Senses</h1><p>We learn about the world through: sight, hearing, touch, taste, smell</p>', type: 'text', teacherNotes: 'Introduce each sense. Discuss body parts: eyes, ears, skin, tongue, nose.' },
      { id: 'k2-2', title: 'Sense of Touch', content: 'We feel with our skin. Soft, hard, rough, smooth.', type: 'image', imageUrl: 'https://d64gsuwffb70l.cloudfront.net/69292778b5e860d8b45503e2_1764304865994_85b587d4.webp', teacherNotes: 'Bring texture samples. Have students feel and describe.' },
      { id: 'k2-3', title: 'Senses Quiz', content: 'Which sense do we use to see?', type: 'quiz', teacherNotes: 'Review all five senses.' }
    ]
  },
  {
    id: 'know-d3',
    title: 'Domain 3: Classic Stories',
    subject: 'Language & Literacy',
    class: 'KG 1',
    week: 5,
    lessonNumber: 1,
    duration: '50 min',
    thumbnailUrl: 'https://d64gsuwffb70l.cloudfront.net/69292778b5e860d8b45503e2_1764304867883_0d195761.webp',
    isFavorite: true,
    slides: [
      { id: 'k3-1', title: 'Classic Stories', content: '<h1>Classic Stories</h1><p>Ananse the Spider, The Tortoise and the Hare, The Lion and the Mouse</p>', type: 'text', teacherNotes: 'Read aloud classic tales. Discuss characters, setting, problem, solution.' }
    ]
  },
  {
    id: 'know-d4',
    title: 'Domain 4: Plants',
    subject: 'Our World Our People',
    class: 'KG 1',
    week: 5,
    lessonNumber: 2,
    duration: '45 min',
    thumbnailUrl: 'https://d64gsuwffb70l.cloudfront.net/69292778b5e860d8b45503e2_1764304868767_fd458945.webp',
    isFavorite: false,
    slides: [
      { id: 'k4-1', title: 'How Plants Grow', content: '<h1>Plants</h1><p>Plants need: sunlight, water, air, soil</p>', type: 'text', teacherNotes: 'Discuss plant parts: roots, stem, leaves, flowers.' }
    ]
  }
];
