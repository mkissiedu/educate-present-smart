import { SubjectCurriculum } from './nacca-curriculum-types';

export const upperPrimaryGhanaianLangCurriculum: SubjectCurriculum = {
  subject: 'Ghanaian Language',
  strands: [
    { id: 'oral', name: 'Oral Language', subStrands: [
      { id: 'listening', name: 'Listening Skills', contentStandards: [
        { id: 'up-gl-ls1', code: 'B3.1.1.1', description: 'Listen and respond in Ghanaian language', indicators: [
          { id: 'up-gl-ls1-i1', code: 'B3.1.1.1.1', description: 'Understand spoken instructions' },
          { id: 'up-gl-ls1-i2', code: 'B3.1.1.1.2', description: 'Respond to questions' }
        ]},
        { id: 'up-gl-ls2', code: 'B5.1.1.1', description: 'Comprehend complex speech', indicators: [
          { id: 'up-gl-ls2-i1', code: 'B5.1.1.1.1', description: 'Understand narratives' }
        ]}
      ]},
      { id: 'speaking', name: 'Speaking Skills', contentStandards: [
        { id: 'up-gl-sp1', code: 'B3.1.2.1', description: 'Speak fluently in Ghanaian language', indicators: [
          { id: 'up-gl-sp1-i1', code: 'B3.1.2.1.1', description: 'Use correct pronunciation' },
          { id: 'up-gl-sp1-i2', code: 'B3.1.2.1.2', description: 'Speak in complete sentences' }
        ]},
        { id: 'up-gl-sp2', code: 'B5.1.2.1', description: 'Present ideas clearly', indicators: [
          { id: 'up-gl-sp2-i1', code: 'B5.1.2.1.1', description: 'Give oral presentations' }
        ]}
      ]}
    ]},
    { id: 'reading', name: 'Reading', subStrands: [
      { id: 'comprehension', name: 'Reading Comprehension', contentStandards: [
        { id: 'up-gl-rc1', code: 'B3.2.1.1', description: 'Read and understand texts', indicators: [
          { id: 'up-gl-rc1-i1', code: 'B3.2.1.1.1', description: 'Read with fluency' },
          { id: 'up-gl-rc1-i2', code: 'B3.2.1.1.2', description: 'Answer comprehension questions' }
        ]},
        { id: 'up-gl-rc2', code: 'B5.2.1.1', description: 'Analyze literary texts', indicators: [
          { id: 'up-gl-rc2-i1', code: 'B5.2.1.1.1', description: 'Identify themes in stories' }
        ]}
      ]},
      { id: 'vocabulary', name: 'Vocabulary Development', contentStandards: [
        { id: 'up-gl-vd1', code: 'B3.2.2.1', description: 'Expand vocabulary', indicators: [
          { id: 'up-gl-vd1-i1', code: 'B3.2.2.1.1', description: 'Learn new words' },
          { id: 'up-gl-vd1-i2', code: 'B3.2.2.1.2', description: 'Use words in context' }
        ]}
      ]}
    ]},
    { id: 'writing', name: 'Writing', subStrands: [
      { id: 'composition', name: 'Composition', contentStandards: [
        { id: 'up-gl-co1', code: 'B3.3.1.1', description: 'Write coherent texts', indicators: [
          { id: 'up-gl-co1-i1', code: 'B3.3.1.1.1', description: 'Write paragraphs' },
          { id: 'up-gl-co1-i2', code: 'B3.3.1.1.2', description: 'Use correct spelling' }
        ]},
        { id: 'up-gl-co2', code: 'B5.3.1.1', description: 'Write essays', indicators: [
          { id: 'up-gl-co2-i1', code: 'B5.3.1.1.1', description: 'Write narrative essays' }
        ]}
      ]},
      { id: 'grammar', name: 'Grammar', contentStandards: [
        { id: 'up-gl-gr1', code: 'B3.3.2.1', description: 'Apply grammar rules', indicators: [
          { id: 'up-gl-gr1-i1', code: 'B3.3.2.1.1', description: 'Use correct sentence structure' }
        ]}
      ]}
    ]},
    { id: 'culture', name: 'Culture and Literature', subStrands: [
      { id: 'literature', name: 'Ghanaian Literature', contentStandards: [
        { id: 'up-gl-lt1', code: 'B3.4.1.1', description: 'Appreciate Ghanaian literature', indicators: [
          { id: 'up-gl-lt1-i1', code: 'B3.4.1.1.1', description: 'Read folktales' },
          { id: 'up-gl-lt1-i2', code: 'B3.4.1.1.2', description: 'Learn proverbs' }
        ]},
        { id: 'up-gl-lt2', code: 'B5.4.1.1', description: 'Analyze literary works', indicators: [
          { id: 'up-gl-lt2-i1', code: 'B5.4.1.1.1', description: 'Interpret proverbs' }
        ]}
      ]}
    ]}
  ]
};
