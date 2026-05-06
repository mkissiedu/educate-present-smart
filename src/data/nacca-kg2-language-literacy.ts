import { KGSubjectCurriculum } from './nacca-kg-curriculum-types';

export const kg2LanguageLiteracy: KGSubjectCurriculum = {
  subject: 'Language & Literacy',
  level: 'KG2',
  strands: [
    {
      id: 'kg2-ll-oral',
      name: 'Oral Language',
      subStrands: [
        {
          id: 'kg2-ll-listening',
          name: 'Listening',
          contentStandards: [
            {
              id: 'kg2-ll-l1',
              code: 'KG2.1.1.1',
              description: 'Demonstrate advanced listening skills',
              indicators: [
                { id: 'kg2-ll-l1-i1', code: 'KG2.1.1.1.1', description: 'Follow two-step instructions' },
                { id: 'kg2-ll-l1-i2', code: 'KG2.1.1.1.2', description: 'Retell stories in sequence' },
                { id: 'kg2-ll-l1-i3', code: 'KG2.1.1.1.3', description: 'Identify main characters in stories' },
                { id: 'kg2-ll-l1-i4', code: 'KG2.1.1.1.4', description: 'Predict story outcomes' }
              ]
            }
          ]
        },
        {
          id: 'kg2-ll-speaking',
          name: 'Speaking',
          contentStandards: [
            {
              id: 'kg2-ll-s1',
              code: 'KG2.1.2.1',
              description: 'Speak fluently using expanded vocabulary',
              indicators: [
                { id: 'kg2-ll-s1-i1', code: 'KG2.1.2.1.1', description: 'Speak in complete sentences' },
                { id: 'kg2-ll-s1-i2', code: 'KG2.1.2.1.2', description: 'Ask and answer questions' },
                { id: 'kg2-ll-s1-i3', code: 'KG2.1.2.1.3', description: 'Describe events and experiences' },
                { id: 'kg2-ll-s1-i4', code: 'KG2.1.2.1.4', description: 'Participate in conversations' }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'kg2-ll-reading',
      name: 'Reading',
      subStrands: [
        {
          id: 'kg2-ll-phonics',
          name: 'Phonics',
          contentStandards: [
            {
              id: 'kg2-ll-p1',
              code: 'KG2.2.1.1',
              description: 'Apply phonics skills to read',
              indicators: [
                { id: 'kg2-ll-p1-i1', code: 'KG2.2.1.1.1', description: 'Recognize all letter sounds' },
                { id: 'kg2-ll-p1-i2', code: 'KG2.2.1.1.2', description: 'Blend CVC words' },
                { id: 'kg2-ll-p1-i3', code: 'KG2.2.1.1.3', description: 'Read simple sight words' },
                { id: 'kg2-ll-p1-i4', code: 'KG2.2.1.1.4', description: 'Read simple sentences' }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'kg2-ll-writing',
      name: 'Writing',
      subStrands: [
        {
          id: 'kg2-ll-handwriting',
          name: 'Handwriting',
          contentStandards: [
            {
              id: 'kg2-ll-hw1',
              code: 'KG2.3.1.1',
              description: 'Write legibly',
              indicators: [
                { id: 'kg2-ll-hw1-i1', code: 'KG2.3.1.1.1', description: 'Write all letters correctly' },
                { id: 'kg2-ll-hw1-i2', code: 'KG2.3.1.1.2', description: 'Write own name' },
                { id: 'kg2-ll-hw1-i3', code: 'KG2.3.1.1.3', description: 'Copy simple words' }
              ]
            }
          ]
        }
      ]
    }
  ]
};
