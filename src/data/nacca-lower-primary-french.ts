import { LowerPrimarySubjectCurriculum } from './nacca-lower-primary-types';

export const lowerPrimaryFrenchCurriculum: LowerPrimarySubjectCurriculum = {
  subject: 'French',
  strands: [
    { id: 'lp-fr-oral', name: 'Oral Communication', subStrands: [
      { id: 'lp-fr-listening', name: 'Listening Comprehension', contentStandards: [
        { id: 'lp-fr-l1', code: 'B1.1.1.1', description: 'Listen and respond to French', indicators: [
          { id: 'lp-fr-l1-i1', code: 'B1.1.1.1.1', description: 'Respond to greetings in French' },
          { id: 'lp-fr-l1-i2', code: 'B1.1.1.1.2', description: 'Follow simple classroom instructions' }
        ]},
        { id: 'lp-fr-l2', code: 'B2.1.1.1', description: 'Comprehend spoken French', indicators: [
          { id: 'lp-fr-l2-i1', code: 'B2.1.1.1.1', description: 'Understand simple questions' }
        ]}
      ]},
      { id: 'lp-fr-speaking', name: 'Speaking', contentStandards: [
        { id: 'lp-fr-s1', code: 'B1.1.2.1', description: 'Speak simple French phrases', indicators: [
          { id: 'lp-fr-s1-i1', code: 'B1.1.2.1.1', description: 'Greet in French (Bonjour, Au revoir)' },
          { id: 'lp-fr-s1-i2', code: 'B1.1.2.1.2', description: 'Introduce self (Je m\'appelle...)' }
        ]},
        { id: 'lp-fr-s2', code: 'B2.1.2.1', description: 'Converse in simple French', indicators: [
          { id: 'lp-fr-s2-i1', code: 'B2.1.2.1.1', description: 'Ask and answer simple questions' }
        ]}
      ]}
    ]},
    { id: 'lp-fr-vocab', name: 'Vocabulary', subStrands: [
      { id: 'lp-fr-words', name: 'Word Knowledge', contentStandards: [
        { id: 'lp-fr-v1', code: 'B1.2.1.1', description: 'Learn basic French vocabulary', indicators: [
          { id: 'lp-fr-v1-i1', code: 'B1.2.1.1.1', description: 'Name colors (rouge, bleu, vert)' },
          { id: 'lp-fr-v1-i2', code: 'B1.2.1.1.2', description: 'Count 1-10 in French' },
          { id: 'lp-fr-v1-i3', code: 'B1.2.1.1.3', description: 'Name body parts' }
        ]},
        { id: 'lp-fr-v2', code: 'B2.2.1.1', description: 'Expand French vocabulary', indicators: [
          { id: 'lp-fr-v2-i1', code: 'B2.2.1.1.1', description: 'Name days of the week' },
          { id: 'lp-fr-v2-i2', code: 'B2.2.1.1.2', description: 'Name family members' }
        ]}
      ]}
    ]},
    { id: 'lp-fr-reading', name: 'Reading', subStrands: [
      { id: 'lp-fr-recognition', name: 'Word Recognition', contentStandards: [
        { id: 'lp-fr-r1', code: 'B1.3.1.1', description: 'Recognize French words', indicators: [
          { id: 'lp-fr-r1-i1', code: 'B1.3.1.1.1', description: 'Read simple French words' }
        ]},
        { id: 'lp-fr-r2', code: 'B2.3.1.1', description: 'Read simple sentences', indicators: [
          { id: 'lp-fr-r2-i1', code: 'B2.3.1.1.1', description: 'Read short French sentences' }
        ]}
      ]}
    ]},
    { id: 'lp-fr-writing', name: 'Writing', subStrands: [
      { id: 'lp-fr-copying', name: 'Copying', contentStandards: [
        { id: 'lp-fr-w1', code: 'B1.4.1.1', description: 'Copy French words', indicators: [
          { id: 'lp-fr-w1-i1', code: 'B1.4.1.1.1', description: 'Copy vocabulary words' }
        ]},
        { id: 'lp-fr-w2', code: 'B2.4.1.1', description: 'Write simple sentences', indicators: [
          { id: 'lp-fr-w2-i1', code: 'B2.4.1.1.1', description: 'Write short sentences' }
        ]}
      ]}
    ]}
  ]
};
