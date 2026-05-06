import { SubjectCurriculum } from './nacca-curriculum-types';
import { languageLiteracyCurriculum } from './nacca-language-literacy';
import { numeracyCurriculum } from './nacca-numeracy';
import { jhsCurriculums } from './nacca-jhs-all-subjects';
import { upperPrimaryCurriculums } from './nacca-upper-primary-all-subjects';

const owopCurriculum: SubjectCurriculum = {
  subject: 'Our World Our People',
  strands: [
    { id: 'all-about-me', name: 'All About Me', subStrands: [
      { id: 'my-family', name: 'My Family', contentStandards: [
        { id: 'owop-f1', code: 'B1.1.1.1', description: 'Know family members and roles', indicators: [
          { id: 'owop-f1-i1', code: 'B1.1.1.1.1', description: 'Identify family members' },
          { id: 'owop-f1-i2', code: 'B1.1.1.1.2', description: 'Describe family roles' }
        ]}
      ]}
    ]},
    { id: 'environment', name: 'My Environment', subStrands: [
      { id: 'school', name: 'My School', contentStandards: [
        { id: 'owop-s1', code: 'B1.2.1.1', description: 'Know school environment', indicators: [
          { id: 'owop-s1-i1', code: 'B1.2.1.1.1', description: 'Identify school facilities' }
        ]}
      ]}
    ]}
  ]
};

const phonicsCurriculum: SubjectCurriculum = {
  subject: "Ananse's Phonics",
  strands: [
    { id: 'phonemic', name: 'Phonemic Awareness', subStrands: [
      { id: 'sounds', name: 'Sound Recognition', contentStandards: [
        { id: 'ph-s1', code: 'B1.1.1.1', description: 'Recognize initial sounds', indicators: [
          { id: 'ph-s1-i1', code: 'B1.1.1.1.1', description: 'Identify beginning sounds' },
          { id: 'ph-s1-i2', code: 'B1.1.1.1.2', description: 'Match sounds to letters' }
        ]}
      ]}
    ]},
    { id: 'blending', name: 'Blending and Segmenting', subStrands: [
      { id: 'blend', name: 'Blending', contentStandards: [
        { id: 'ph-b1', code: 'B1.2.1.1', description: 'Blend sounds to form words', indicators: [
          { id: 'ph-b1-i1', code: 'B1.2.1.1.1', description: 'Blend CVC words' }
        ]}
      ]}
    ]}
  ]
};

const creativeArtsCurriculum: SubjectCurriculum = {
  subject: 'Creative Arts',
  strands: [
    { id: 'visual-arts', name: 'Visual Arts', subStrands: [
      { id: 'drawing', name: 'Drawing and Painting', contentStandards: [
        { id: 'ca-d1', code: 'B1.1.1.1', description: 'Create simple drawings', indicators: [
          { id: 'ca-d1-i1', code: 'B1.1.1.1.1', description: 'Draw basic shapes' },
          { id: 'ca-d1-i2', code: 'B1.1.1.1.2', description: 'Use colors appropriately' }
        ]}
      ]}
    ]},
    { id: 'performing', name: 'Performing Arts', subStrands: [
      { id: 'music', name: 'Music', contentStandards: [
        { id: 'ca-m1', code: 'B1.2.1.1', description: 'Sing and perform songs', indicators: [
          { id: 'ca-m1-i1', code: 'B1.2.1.1.1', description: 'Sing simple songs' }
        ]}
      ]}
    ]}
  ]
};

// Combined curriculums for all levels
export const allCurriculums: Record<string, SubjectCurriculum> = {
  'Language & Literacy': languageLiteracyCurriculum,
  'Numeracy': numeracyCurriculum,
  'Our World Our People': owopCurriculum,
  "Ananse's Phonics": phonicsCurriculum,
  'Creative Arts': creativeArtsCurriculum,
  ...upperPrimaryCurriculums,
  ...jhsCurriculums
};

// Export level-specific curriculums
export { jhsCurriculums };
export { upperPrimaryCurriculums };
