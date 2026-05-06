import { SubjectCurriculum } from './nacca-curriculum-types';

export const upperPrimaryEnglishCurriculum: SubjectCurriculum = {
  subject: 'English Language',
  strands: [
    { id: 'oral-lang', name: 'Oral Language', subStrands: [
      { id: 'listening', name: 'Listening Comprehension', contentStandards: [
        { id: 'up-el-l1', code: 'B3.1.1.1', description: 'Listen and respond to spoken English', indicators: [
          { id: 'up-el-l1-i1', code: 'B3.1.1.1.1', description: 'Identify main ideas in stories' },
          { id: 'up-el-l1-i2', code: 'B3.1.1.1.2', description: 'Follow multi-step instructions' }
        ]},
        { id: 'up-el-l2', code: 'B4.1.1.1', description: 'Comprehend spoken texts critically', indicators: [
          { id: 'up-el-l2-i1', code: 'B4.1.1.1.1', description: 'Distinguish fact from opinion' }
        ]},
        { id: 'up-el-l3', code: 'B5.1.1.1', description: 'Analyze spoken content', indicators: [
          { id: 'up-el-l3-i1', code: 'B5.1.1.1.1', description: 'Evaluate speaker purpose' }
        ]},
        { id: 'up-el-l4', code: 'B6.1.1.1', description: 'Synthesize information from speeches', indicators: [
          { id: 'up-el-l4-i1', code: 'B6.1.1.1.1', description: 'Compare multiple spoken sources' }
        ]}
      ]},
      { id: 'speaking', name: 'Speaking Skills', contentStandards: [
        { id: 'up-el-s1', code: 'B3.1.2.1', description: 'Speak clearly and fluently', indicators: [
          { id: 'up-el-s1-i1', code: 'B3.1.2.1.1', description: 'Use correct pronunciation' },
          { id: 'up-el-s1-i2', code: 'B3.1.2.1.2', description: 'Speak in complete sentences' }
        ]},
        { id: 'up-el-s2', code: 'B5.1.2.1', description: 'Present ideas persuasively', indicators: [
          { id: 'up-el-s2-i1', code: 'B5.1.2.1.1', description: 'Use rhetorical devices' }
        ]}
      ]}
    ]},
    { id: 'reading', name: 'Reading', subStrands: [
      { id: 'comprehension', name: 'Reading Comprehension', contentStandards: [
        { id: 'up-el-r1', code: 'B3.2.1.1', description: 'Read and understand grade-level texts', indicators: [
          { id: 'up-el-r1-i1', code: 'B3.2.1.1.1', description: 'Identify story elements' },
          { id: 'up-el-r1-i2', code: 'B3.2.1.1.2', description: 'Make predictions' }
        ]},
        { id: 'up-el-r2', code: 'B5.2.1.1', description: 'Analyze literary texts', indicators: [
          { id: 'up-el-r2-i1', code: 'B5.2.1.1.1', description: 'Identify figurative language' }
        ]}
      ]},
      { id: 'fluency', name: 'Reading Fluency', contentStandards: [
        { id: 'up-el-f1', code: 'B3.2.2.1', description: 'Read with fluency and expression', indicators: [
          { id: 'up-el-f1-i1', code: 'B3.2.2.1.1', description: 'Read at appropriate pace' }
        ]}
      ]}
    ]},
    { id: 'writing', name: 'Writing', subStrands: [
      { id: 'composition', name: 'Composition', contentStandards: [
        { id: 'up-el-w1', code: 'B3.3.1.1', description: 'Write coherent paragraphs', indicators: [
          { id: 'up-el-w1-i1', code: 'B3.3.1.1.1', description: 'Write topic sentences' },
          { id: 'up-el-w1-i2', code: 'B3.3.1.1.2', description: 'Use supporting details' }
        ]},
        { id: 'up-el-w2', code: 'B5.3.1.1', description: 'Write multi-paragraph essays', indicators: [
          { id: 'up-el-w2-i1', code: 'B5.3.1.1.1', description: 'Write introduction and conclusion' }
        ]}
      ]},
      { id: 'grammar', name: 'Grammar', contentStandards: [
        { id: 'up-el-g1', code: 'B3.3.2.1', description: 'Apply grammar rules', indicators: [
          { id: 'up-el-g1-i1', code: 'B3.3.2.1.1', description: 'Use correct verb tenses' },
          { id: 'up-el-g1-i2', code: 'B3.3.2.1.2', description: 'Apply subject-verb agreement' }
        ]}
      ]}
    ]}
  ]
};
