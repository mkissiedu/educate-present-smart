import { SubjectCurriculum } from './nacca-curriculum-types';

export const jhsGhanaianLanguageCurriculum: SubjectCurriculum = {
  subject: 'Ghanaian Language',
  strands: [
    { id: 'oral', name: 'Oral Language Skills', subStrands: [
      { id: 'listening', name: 'Listening and Speaking', contentStandards: [
        { id: 'gl-l1', code: 'B7.1.1.1', description: 'Listen and respond in Ghanaian language', indicators: [
          { id: 'gl-l1-i1', code: 'B7.1.1.1.1', description: 'Understand spoken narratives' },
          { id: 'gl-l1-i2', code: 'B7.1.1.1.2', description: 'Respond appropriately to questions' }
        ]}
      ]},
      { id: 'conversation', name: 'Conversation', contentStandards: [
        { id: 'gl-c1', code: 'B7.1.2.1', description: 'Engage in conversations', indicators: [
          { id: 'gl-c1-i1', code: 'B7.1.2.1.1', description: 'Use greetings and courtesies' },
          { id: 'gl-c1-i2', code: 'B7.1.2.1.2', description: 'Discuss everyday topics' }
        ]}
      ]}
    ]},
    { id: 'reading', name: 'Reading', subStrands: [
      { id: 'comprehension', name: 'Reading Comprehension', contentStandards: [
        { id: 'gl-r1', code: 'B7.2.1.1', description: 'Read and understand texts', indicators: [
          { id: 'gl-r1-i1', code: 'B7.2.1.1.1', description: 'Read traditional stories' },
          { id: 'gl-r1-i2', code: 'B7.2.1.1.2', description: 'Identify themes in texts' }
        ]}
      ]}
    ]},
    { id: 'writing', name: 'Writing', subStrands: [
      { id: 'composition', name: 'Written Expression', contentStandards: [
        { id: 'gl-w1', code: 'B7.3.1.1', description: 'Write in Ghanaian language', indicators: [
          { id: 'gl-w1-i1', code: 'B7.3.1.1.1', description: 'Write simple compositions' },
          { id: 'gl-w1-i2', code: 'B7.3.1.1.2', description: 'Use correct spelling' }
        ]}
      ]}
    ]},
    { id: 'culture', name: 'Culture and Literature', subStrands: [
      { id: 'literature', name: 'Traditional Literature', contentStandards: [
        { id: 'gl-lit1', code: 'B7.4.1.1', description: 'Appreciate traditional literature', indicators: [
          { id: 'gl-lit1-i1', code: 'B7.4.1.1.1', description: 'Recite proverbs and riddles' },
          { id: 'gl-lit1-i2', code: 'B7.4.1.1.2', description: 'Narrate folktales' }
        ]}
      ]}
    ]}
  ]
};
