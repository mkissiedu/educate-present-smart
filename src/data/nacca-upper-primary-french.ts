import { SubjectCurriculum } from './nacca-curriculum-types';

export const upperPrimaryFrenchCurriculum: SubjectCurriculum = {
  subject: 'French',
  strands: [
    { id: 'oral', name: 'Oral Communication', subStrands: [
      { id: 'listening', name: 'Listening', contentStandards: [
        { id: 'up-fr-li1', code: 'B3.1.1.1', description: 'Understand spoken French', indicators: [
          { id: 'up-fr-li1-i1', code: 'B3.1.1.1.1', description: 'Respond to greetings' },
          { id: 'up-fr-li1-i2', code: 'B3.1.1.1.2', description: 'Follow simple instructions' }
        ]},
        { id: 'up-fr-li2', code: 'B5.1.1.1', description: 'Comprehend conversations', indicators: [
          { id: 'up-fr-li2-i1', code: 'B5.1.1.1.1', description: 'Understand dialogues' }
        ]}
      ]},
      { id: 'speaking', name: 'Speaking', contentStandards: [
        { id: 'up-fr-sp1', code: 'B3.1.2.1', description: 'Speak basic French', indicators: [
          { id: 'up-fr-sp1-i1', code: 'B3.1.2.1.1', description: 'Introduce oneself' },
          { id: 'up-fr-sp1-i2', code: 'B3.1.2.1.2', description: 'Ask and answer questions' }
        ]},
        { id: 'up-fr-sp2', code: 'B5.1.2.1', description: 'Engage in conversations', indicators: [
          { id: 'up-fr-sp2-i1', code: 'B5.1.2.1.1', description: 'Discuss daily activities' }
        ]}
      ]}
    ]},
    { id: 'reading', name: 'Reading', subStrands: [
      { id: 'comprehension', name: 'Reading Comprehension', contentStandards: [
        { id: 'up-fr-rc1', code: 'B3.2.1.1', description: 'Read simple French texts', indicators: [
          { id: 'up-fr-rc1-i1', code: 'B3.2.1.1.1', description: 'Read words and phrases' },
          { id: 'up-fr-rc1-i2', code: 'B3.2.1.1.2', description: 'Read short sentences' }
        ]},
        { id: 'up-fr-rc2', code: 'B5.2.1.1', description: 'Read and understand passages', indicators: [
          { id: 'up-fr-rc2-i1', code: 'B5.2.1.1.1', description: 'Answer comprehension questions' }
        ]}
      ]},
      { id: 'vocabulary', name: 'Vocabulary', contentStandards: [
        { id: 'up-fr-vo1', code: 'B3.2.2.1', description: 'Build French vocabulary', indicators: [
          { id: 'up-fr-vo1-i1', code: 'B3.2.2.1.1', description: 'Learn common nouns' },
          { id: 'up-fr-vo1-i2', code: 'B3.2.2.1.2', description: 'Learn action verbs' }
        ]}
      ]}
    ]},
    { id: 'writing', name: 'Writing', subStrands: [
      { id: 'composition', name: 'Written Expression', contentStandards: [
        { id: 'up-fr-we1', code: 'B3.3.1.1', description: 'Write simple French', indicators: [
          { id: 'up-fr-we1-i1', code: 'B3.3.1.1.1', description: 'Write words correctly' },
          { id: 'up-fr-we1-i2', code: 'B3.3.1.1.2', description: 'Write simple sentences' }
        ]},
        { id: 'up-fr-we2', code: 'B5.3.1.1', description: 'Write paragraphs', indicators: [
          { id: 'up-fr-we2-i1', code: 'B5.3.1.1.1', description: 'Write short compositions' }
        ]}
      ]}
    ]},
    { id: 'grammar', name: 'Grammar', subStrands: [
      { id: 'structure', name: 'Language Structure', contentStandards: [
        { id: 'up-fr-gr1', code: 'B3.4.1.1', description: 'Apply French grammar rules', indicators: [
          { id: 'up-fr-gr1-i1', code: 'B3.4.1.1.1', description: 'Use articles correctly' },
          { id: 'up-fr-gr1-i2', code: 'B3.4.1.1.2', description: 'Apply gender agreement' }
        ]},
        { id: 'up-fr-gr2', code: 'B5.4.1.1', description: 'Use verb conjugations', indicators: [
          { id: 'up-fr-gr2-i1', code: 'B5.4.1.1.1', description: 'Conjugate regular verbs' }
        ]}
      ]}
    ]}
  ]
};
