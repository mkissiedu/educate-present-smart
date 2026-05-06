import { LowerPrimarySubjectCurriculum } from './nacca-lower-primary-types';

export const lowerPrimaryGhanaianLangCurriculum: LowerPrimarySubjectCurriculum = {
  subject: 'Ghanaian Language',
  strands: [
    { id: 'lp-gl-oral', name: 'Oral Language', subStrands: [
      { id: 'lp-gl-listening', name: 'Listening', contentStandards: [
        { id: 'lp-gl-l1', code: 'B1.1.1.1', description: 'Listen and respond in Ghanaian language', indicators: [
          { id: 'lp-gl-l1-i1', code: 'B1.1.1.1.1', description: 'Listen to stories in local language' },
          { id: 'lp-gl-l1-i2', code: 'B1.1.1.1.2', description: 'Follow simple instructions' }
        ]},
        { id: 'lp-gl-l2', code: 'B2.1.1.1', description: 'Comprehend spoken Ghanaian language', indicators: [
          { id: 'lp-gl-l2-i1', code: 'B2.1.1.1.1', description: 'Retell stories heard' }
        ]}
      ]},
      { id: 'lp-gl-speaking', name: 'Speaking', contentStandards: [
        { id: 'lp-gl-s1', code: 'B1.1.2.1', description: 'Speak using simple expressions', indicators: [
          { id: 'lp-gl-s1-i1', code: 'B1.1.2.1.1', description: 'Greet in local language' },
          { id: 'lp-gl-s1-i2', code: 'B1.1.2.1.2', description: 'Introduce self' }
        ]},
        { id: 'lp-gl-s2', code: 'B2.1.2.1', description: 'Converse in Ghanaian language', indicators: [
          { id: 'lp-gl-s2-i1', code: 'B2.1.2.1.1', description: 'Ask and answer questions' }
        ]}
      ]}
    ]},
    { id: 'lp-gl-reading', name: 'Reading', subStrands: [
      { id: 'lp-gl-phonics', name: 'Phonics', contentStandards: [
        { id: 'lp-gl-p1', code: 'B1.2.1.1', description: 'Recognize sounds and letters', indicators: [
          { id: 'lp-gl-p1-i1', code: 'B1.2.1.1.1', description: 'Identify letter sounds' }
        ]},
        { id: 'lp-gl-p2', code: 'B2.2.1.1', description: 'Read simple words', indicators: [
          { id: 'lp-gl-p2-i1', code: 'B2.2.1.1.1', description: 'Read CVC words' }
        ]}
      ]}
    ]},
    { id: 'lp-gl-writing', name: 'Writing', subStrands: [
      { id: 'lp-gl-handwriting', name: 'Handwriting', contentStandards: [
        { id: 'lp-gl-w1', code: 'B1.3.1.1', description: 'Write letters and words', indicators: [
          { id: 'lp-gl-w1-i1', code: 'B1.3.1.1.1', description: 'Write alphabet letters' }
        ]},
        { id: 'lp-gl-w2', code: 'B2.3.1.1', description: 'Write simple sentences', indicators: [
          { id: 'lp-gl-w2-i1', code: 'B2.3.1.1.1', description: 'Copy simple sentences' }
        ]}
      ]}
    ]},
    { id: 'lp-gl-culture', name: 'Culture', subStrands: [
      { id: 'lp-gl-traditions', name: 'Traditions', contentStandards: [
        { id: 'lp-gl-c1', code: 'B1.4.1.1', description: 'Know cultural practices', indicators: [
          { id: 'lp-gl-c1-i1', code: 'B1.4.1.1.1', description: 'Recite proverbs and riddles' }
        ]},
        { id: 'lp-gl-c2', code: 'B2.4.1.1', description: 'Appreciate cultural heritage', indicators: [
          { id: 'lp-gl-c2-i1', code: 'B2.4.1.1.1', description: 'Sing traditional songs' }
        ]}
      ]}
    ]}
  ]
};
