import { SubjectCurriculum } from './nacca-curriculum-types';

export const jhsFrenchCurriculum: SubjectCurriculum = {
  subject: 'French',
  strands: [
    { id: 'oral', name: 'Oral Communication', subStrands: [
      { id: 'listening', name: 'Listening', contentStandards: [
        { id: 'fr-l1', code: 'B7.1.1.1', description: 'Understand spoken French', indicators: [
          { id: 'fr-l1-i1', code: 'B7.1.1.1.1', description: 'Identify key words in conversations' },
          { id: 'fr-l1-i2', code: 'B7.1.1.1.2', description: 'Follow simple instructions in French' }
        ]}
      ]},
      { id: 'speaking', name: 'Speaking', contentStandards: [
        { id: 'fr-s1', code: 'B7.1.2.1', description: 'Communicate in French', indicators: [
          { id: 'fr-s1-i1', code: 'B7.1.2.1.1', description: 'Introduce oneself in French' },
          { id: 'fr-s1-i2', code: 'B7.1.2.1.2', description: 'Ask and answer simple questions' }
        ]}
      ]}
    ]},
    { id: 'reading', name: 'Reading', subStrands: [
      { id: 'comprehension', name: 'Reading Comprehension', contentStandards: [
        { id: 'fr-r1', code: 'B7.2.1.1', description: 'Read and understand French texts', indicators: [
          { id: 'fr-r1-i1', code: 'B7.2.1.1.1', description: 'Read simple passages' },
          { id: 'fr-r1-i2', code: 'B7.2.1.1.2', description: 'Identify main ideas in texts' }
        ]}
      ]}
    ]},
    { id: 'writing', name: 'Writing', subStrands: [
      { id: 'composition', name: 'Written Expression', contentStandards: [
        { id: 'fr-w1', code: 'B7.3.1.1', description: 'Write in French', indicators: [
          { id: 'fr-w1-i1', code: 'B7.3.1.1.1', description: 'Write simple sentences' },
          { id: 'fr-w1-i2', code: 'B7.3.1.1.2', description: 'Write short paragraphs' }
        ]}
      ]}
    ]},
    { id: 'grammar', name: 'Grammar and Vocabulary', subStrands: [
      { id: 'structure', name: 'Language Structure', contentStandards: [
        { id: 'fr-g1', code: 'B7.4.1.1', description: 'Apply French grammar rules', indicators: [
          { id: 'fr-g1-i1', code: 'B7.4.1.1.1', description: 'Use articles correctly' },
          { id: 'fr-g1-i2', code: 'B7.4.1.1.2', description: 'Conjugate regular verbs' }
        ]}
      ]}
    ]}
  ]
};
