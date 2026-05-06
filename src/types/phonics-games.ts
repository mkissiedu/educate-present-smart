export interface GameScore {
  id?: string;
  student_id?: string;
  game_type: 'sound_match' | 'word_builder' | 'rhyme_time';
  score: number;
  total_questions: number;
  accuracy: number;
  time_spent: number;
  level: number;
  played_at: string;
}

export interface SoundMatchItem {
  letter: string;
  sound: string;
  word: string;
  image?: string;
}

export interface WordBuilderItem {
  word: string;
  phonemes: string[];
  hint: string;
  image?: string;
}

export interface RhymeItem {
  targetWord: string;
  options: string[];
  correctAnswer: string;
}

export const SOUND_MATCH_DATA: SoundMatchItem[] = [
  { letter: 'A', sound: '/æ/', word: 'apple' },
  { letter: 'B', sound: '/b/', word: 'ball' },
  { letter: 'C', sound: '/k/', word: 'cat' },
  { letter: 'D', sound: '/d/', word: 'dog' },
  { letter: 'E', sound: '/ɛ/', word: 'egg' },
  { letter: 'F', sound: '/f/', word: 'fish' },
  { letter: 'G', sound: '/g/', word: 'goat' },
  { letter: 'H', sound: '/h/', word: 'hat' },
  { letter: 'M', sound: '/m/', word: 'moon' },
  { letter: 'S', sound: '/s/', word: 'sun' },
  { letter: 'T', sound: '/t/', word: 'tree' },
  { letter: 'P', sound: '/p/', word: 'pig' },
];

export const WORD_BUILDER_DATA: WordBuilderItem[] = [
  { word: 'cat', phonemes: ['c', 'a', 't'], hint: 'A furry pet that meows' },
  { word: 'dog', phonemes: ['d', 'o', 'g'], hint: 'A pet that barks' },
  { word: 'sun', phonemes: ['s', 'u', 'n'], hint: 'Shines in the sky' },
  { word: 'hat', phonemes: ['h', 'a', 't'], hint: 'Wear on your head' },
  { word: 'bed', phonemes: ['b', 'e', 'd'], hint: 'Sleep on this' },
  { word: 'pig', phonemes: ['p', 'i', 'g'], hint: 'Pink farm animal' },
  { word: 'map', phonemes: ['m', 'a', 'p'], hint: 'Shows directions' },
  { word: 'cup', phonemes: ['c', 'u', 'p'], hint: 'Drink from this' },
];

export const RHYME_DATA: RhymeItem[] = [
  { targetWord: 'cat', options: ['bat', 'dog', 'sun', 'pig'], correctAnswer: 'bat' },
  { targetWord: 'dog', options: ['cat', 'log', 'hat', 'cup'], correctAnswer: 'log' },
  { targetWord: 'sun', options: ['fun', 'cat', 'bed', 'pig'], correctAnswer: 'fun' },
  { targetWord: 'hat', options: ['dog', 'mat', 'cup', 'log'], correctAnswer: 'mat' },
  { targetWord: 'bed', options: ['red', 'cat', 'sun', 'pig'], correctAnswer: 'red' },
  { targetWord: 'pig', options: ['cat', 'dog', 'wig', 'hat'], correctAnswer: 'wig' },
  { targetWord: 'cake', options: ['lake', 'dog', 'sun', 'bed'], correctAnswer: 'lake' },
  { targetWord: 'ball', options: ['cat', 'tall', 'pig', 'cup'], correctAnswer: 'tall' },
];
