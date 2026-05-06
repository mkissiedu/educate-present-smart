import { SubjectCurriculum } from './nacca-curriculum-types';

export const jhsEnglishCurriculum: SubjectCurriculum = {
  subject: 'English Language',
  strands: [
    { id: 'oral-lang', name: 'Oral Language', subStrands: [
      { id: 'listening', name: 'Listening Comprehension', contentStandards: [
        { id: 'el-l1', code: 'B7.1.1.1', description: 'Listen and respond to spoken texts', indicators: [
          { id: 'el-l1-i1', code: 'B7.1.1.1.1', description: 'Identify main ideas in spoken texts' },
          { id: 'el-l1-i2', code: 'B7.1.1.1.2', description: 'Make inferences from spoken content' }
        ]},
        { id: 'el-l2', code: 'B8.1.1.1', description: 'Analyze spoken texts critically', indicators: [
          { id: 'el-l2-i1', code: 'B8.1.1.1.1', description: 'Evaluate arguments in speeches' }
        ]}
      ]},
      { id: 'speaking', name: 'Speaking Skills', contentStandards: [
        { id: 'el-s1', code: 'B7.1.2.1', description: 'Speak fluently and confidently', indicators: [
          { id: 'el-s1-i1', code: 'B7.1.2.1.1', description: 'Present ideas clearly' },
          { id: 'el-s1-i2', code: 'B7.1.2.1.2', description: 'Use appropriate register' }
        ]}
      ]}
    ]},
    { id: 'reading', name: 'Reading', subStrands: [
      { id: 'comprehension', name: 'Reading Comprehension', contentStandards: [
        { id: 'el-r1', code: 'B7.2.1.1', description: 'Read and understand various texts', indicators: [
          { id: 'el-r1-i1', code: 'B7.2.1.1.1', description: 'Identify themes in texts' },
          { id: 'el-r1-i2', code: 'B7.2.1.1.2', description: 'Analyze character development' }
        ]}
      ]},
      { id: 'vocab', name: 'Vocabulary Development', contentStandards: [
        { id: 'el-v1', code: 'B7.2.2.1', description: 'Expand vocabulary through reading', indicators: [
          { id: 'el-v1-i1', code: 'B7.2.2.1.1', description: 'Use context clues for meaning' }
        ]}
      ]}
    ]},
    { id: 'writing', name: 'Writing', subStrands: [
      { id: 'composition', name: 'Composition Writing', contentStandards: [
        { id: 'el-w1', code: 'B7.3.1.1', description: 'Write coherent compositions', indicators: [
          { id: 'el-w1-i1', code: 'B7.3.1.1.1', description: 'Write narrative essays' },
          { id: 'el-w1-i2', code: 'B7.3.1.1.2', description: 'Write descriptive essays' }
        ]}
      ]},
      { id: 'grammar', name: 'Grammar and Usage', contentStandards: [
        { id: 'el-g1', code: 'B7.3.2.1', description: 'Apply grammar rules correctly', indicators: [
          { id: 'el-g1-i1', code: 'B7.3.2.1.1', description: 'Use tenses appropriately' },
          { id: 'el-g1-i2', code: 'B7.3.2.1.2', description: 'Apply punctuation rules' }
        ]}
      ]}
    ]}
  ]
};
