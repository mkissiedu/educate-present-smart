import { LowerPrimarySubjectCurriculum } from './nacca-lower-primary-types';

export const lowerPrimaryEnglishCurriculum: LowerPrimarySubjectCurriculum = {
  subject: 'English Language',
  strands: [
    { id: 'lp-oral', name: 'Oral Language', subStrands: [
      { id: 'lp-listening', name: 'Listening', contentStandards: [
        { id: 'lp-el-l1', code: 'B1.1.1.1', description: 'Listen attentively and respond appropriately', indicators: [
          { id: 'lp-el-l1-i1', code: 'B1.1.1.1.1', description: 'Listen to stories and answer questions' },
          { id: 'lp-el-l1-i2', code: 'B1.1.1.1.2', description: 'Follow two-step oral instructions' },
          { id: 'lp-el-l1-i3', code: 'B1.1.1.1.3', description: 'Identify main characters in stories' }
        ]},
        { id: 'lp-el-l2', code: 'B2.1.1.1', description: 'Comprehend spoken language in context', indicators: [
          { id: 'lp-el-l2-i1', code: 'B2.1.1.1.1', description: 'Retell stories in sequence' },
          { id: 'lp-el-l2-i2', code: 'B2.1.1.1.2', description: 'Follow multi-step instructions' }
        ]}
      ]},
      { id: 'lp-speaking', name: 'Speaking', contentStandards: [
        { id: 'lp-el-s1', code: 'B1.1.2.1', description: 'Speak clearly using simple sentences', indicators: [
          { id: 'lp-el-s1-i1', code: 'B1.1.2.1.1', description: 'Introduce self and others' },
          { id: 'lp-el-s1-i2', code: 'B1.1.2.1.2', description: 'Ask and answer simple questions' }
        ]},
        { id: 'lp-el-s2', code: 'B2.1.2.1', description: 'Express ideas in complete sentences', indicators: [
          { id: 'lp-el-s2-i1', code: 'B2.1.2.1.1', description: 'Describe objects and events' },
          { id: 'lp-el-s2-i2', code: 'B2.1.2.1.2', description: 'Participate in conversations' }
        ]}
      ]}
    ]},
    { id: 'lp-reading', name: 'Reading', subStrands: [
      { id: 'lp-phonics', name: 'Phonics & Word Recognition', contentStandards: [
        { id: 'lp-el-p1', code: 'B1.2.1.1', description: 'Apply phonics skills', indicators: [
          { id: 'lp-el-p1-i1', code: 'B1.2.1.1.1', description: 'Identify letter sounds' },
          { id: 'lp-el-p1-i2', code: 'B1.2.1.1.2', description: 'Blend CVC words' }
        ]},
        { id: 'lp-el-p2', code: 'B2.2.1.1', description: 'Decode words fluently', indicators: [
          { id: 'lp-el-p2-i1', code: 'B2.2.1.1.1', description: 'Read CVCC and CCVC words' }
        ]}
      ]},
      { id: 'lp-comprehension', name: 'Reading Comprehension', contentStandards: [
        { id: 'lp-el-c1', code: 'B1.2.2.1', description: 'Understand simple texts', indicators: [
          { id: 'lp-el-c1-i1', code: 'B1.2.2.1.1', description: 'Identify story characters' }
        ]},
        { id: 'lp-el-c2', code: 'B2.2.2.1', description: 'Comprehend grade-level texts', indicators: [
          { id: 'lp-el-c2-i1', code: 'B2.2.2.1.1', description: 'Make predictions' }
        ]}
      ]}
    ]},
    { id: 'lp-writing', name: 'Writing', subStrands: [
      { id: 'lp-handwriting', name: 'Handwriting', contentStandards: [
        { id: 'lp-el-h1', code: 'B1.3.1.1', description: 'Form letters correctly', indicators: [
          { id: 'lp-el-h1-i1', code: 'B1.3.1.1.1', description: 'Write uppercase and lowercase letters' }
        ]}
      ]},
      { id: 'lp-composition', name: 'Composition', contentStandards: [
        { id: 'lp-el-w1', code: 'B1.3.2.1', description: 'Write simple sentences', indicators: [
          { id: 'lp-el-w1-i1', code: 'B1.3.2.1.1', description: 'Write sentences with capital letters and periods' }
        ]},
        { id: 'lp-el-w2', code: 'B2.3.2.1', description: 'Write short paragraphs', indicators: [
          { id: 'lp-el-w2-i1', code: 'B2.3.2.1.1', description: 'Write 3-4 related sentences' }
        ]}
      ]}
    ]}
  ]
};
