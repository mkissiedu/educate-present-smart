import { KGSubjectCurriculum, KGLevel } from './nacca-kg-curriculum-types';
import { kg1LanguageLiteracy } from './nacca-kg1-language-literacy';
import { kg1Numeracy } from './nacca-kg1-numeracy';
import { kg1OWOP } from './nacca-kg1-owop';
import { kg2LanguageLiteracy } from './nacca-kg2-language-literacy';
import { kg2Numeracy } from './nacca-kg2-numeracy';

// KG1 Creative Arts
const kg1CreativeArts: KGSubjectCurriculum = {
  subject: 'Creative Arts',
  level: 'KG1',
  strands: [
    {
      id: 'kg1-ca-visual', name: 'Visual Arts',
      subStrands: [
        { id: 'kg1-ca-draw', name: 'Drawing', contentStandards: [
          { id: 'kg1-ca-d1', code: 'KG1.1.1.1', description: 'Create simple drawings', indicators: [
            { id: 'kg1-ca-d1-i1', code: 'KG1.1.1.1.1', description: 'Draw basic shapes' },
            { id: 'kg1-ca-d1-i2', code: 'KG1.1.1.1.2', description: 'Color within lines' }
          ]}
        ]}
      ]
    },
    {
      id: 'kg1-ca-music', name: 'Music',
      subStrands: [
        { id: 'kg1-ca-sing', name: 'Singing', contentStandards: [
          { id: 'kg1-ca-s1', code: 'KG1.2.1.1', description: 'Sing simple songs', indicators: [
            { id: 'kg1-ca-s1-i1', code: 'KG1.2.1.1.1', description: 'Sing nursery rhymes' },
            { id: 'kg1-ca-s1-i2', code: 'KG1.2.1.1.2', description: 'Move to music' }
          ]}
        ]}
      ]
    }
  ]
};

// KG2 Creative Arts
const kg2CreativeArts: KGSubjectCurriculum = {
  subject: 'Creative Arts',
  level: 'KG2',
  strands: [
    {
      id: 'kg2-ca-visual', name: 'Visual Arts',
      subStrands: [
        { id: 'kg2-ca-draw', name: 'Drawing and Painting', contentStandards: [
          { id: 'kg2-ca-d1', code: 'KG2.1.1.1', description: 'Create detailed drawings', indicators: [
            { id: 'kg2-ca-d1-i1', code: 'KG2.1.1.1.1', description: 'Draw people and objects' },
            { id: 'kg2-ca-d1-i2', code: 'KG2.1.1.1.2', description: 'Mix colors' }
          ]}
        ]}
      ]
    }
  ]
};

// KG2 OWOP
const kg2OWOP: KGSubjectCurriculum = {
  subject: 'Our World Our People',
  level: 'KG2',
  strands: [
    {
      id: 'kg2-owop-community', name: 'My Community',
      subStrands: [
        { id: 'kg2-owop-helpers', name: 'Community Helpers', contentStandards: [
          { id: 'kg2-owop-ch1', code: 'KG2.1.1.1', description: 'Know community helpers', indicators: [
            { id: 'kg2-owop-ch1-i1', code: 'KG2.1.1.1.1', description: 'Identify community helpers' },
            { id: 'kg2-owop-ch1-i2', code: 'KG2.1.1.1.2', description: 'Describe their roles' }
          ]}
        ]}
      ]
    }
  ]
};

export const kgCurriculums: Record<KGLevel, Record<string, KGSubjectCurriculum>> = {
  'KG1': {
    'Language & Literacy': kg1LanguageLiteracy,
    'Numeracy': kg1Numeracy,
    'Our World Our People': kg1OWOP,
    'Creative Arts': kg1CreativeArts
  },
  'KG2': {
    'Language & Literacy': kg2LanguageLiteracy,
    'Numeracy': kg2Numeracy,
    'Our World Our People': kg2OWOP,
    'Creative Arts': kg2CreativeArts
  }
};

export const getKGCurriculum = (level: KGLevel, subject: string): KGSubjectCurriculum | undefined => {
  return kgCurriculums[level]?.[subject];
};
