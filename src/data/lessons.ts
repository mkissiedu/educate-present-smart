import { Lesson } from '../types/lesson';
import { skillsUnits1to3 } from './ckla-skills-units-1-3';
import { skillsUnits4to6 } from './ckla-skills-units-4-6';
import { skillsUnits7to9 } from './ckla-skills-units-7-9';
import { knowledgeDomains1to4 } from './ckla-knowledge-domains-1-4';
import { knowledgeDomains5to8 } from './ckla-knowledge-domains-5-8';
import { knowledgeDomains9to12 } from './ckla-knowledge-domains-9-12';

// Combine all CKLA lessons
export const lessons: Lesson[] = [
  ...skillsUnits1to3,
  ...skillsUnits4to6,
  ...skillsUnits7to9,
  ...knowledgeDomains1to4,
  ...knowledgeDomains5to8,
  ...knowledgeDomains9to12
];
