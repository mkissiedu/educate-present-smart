import { SubjectCurriculum } from './nacca-curriculum-types';

export const languageLiteracyCurriculum: SubjectCurriculum = {
  subject: 'Language & Literacy',
  strands: [
    {
      id: 'oral-lang',
      name: 'Oral Language',
      subStrands: [
        {
          id: 'listening',
          name: 'Listening',
          contentStandards: [
            {
              id: 'ol-l1',
              code: 'B1.1.1.1',
              description: 'Demonstrate listening skills for comprehension',
              indicators: [
                { id: 'ol-l1-i1', code: 'B1.1.1.1.1', description: 'Listen to and follow simple instructions' },
                { id: 'ol-l1-i2', code: 'B1.1.1.1.2', description: 'Listen to stories and answer questions' },
                { id: 'ol-l1-i3', code: 'B1.1.1.1.3', description: 'Identify main ideas in spoken text' }
              ]
            }
          ]
        },
        {
          id: 'speaking',
          name: 'Speaking',
          contentStandards: [
            {
              id: 'ol-s1',
              code: 'B1.1.2.1',
              description: 'Speak clearly and audibly',
              indicators: [
                { id: 'ol-s1-i1', code: 'B1.1.2.1.1', description: 'Speak clearly in complete sentences' },
                { id: 'ol-s1-i2', code: 'B1.1.2.1.2', description: 'Use appropriate vocabulary' }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'reading',
      name: 'Reading',
      subStrands: [
        {
          id: 'phonics',
          name: 'Phonics and Word Recognition',
          contentStandards: [
            {
              id: 'r-p1',
              code: 'B1.2.1.1',
              description: 'Apply phonics knowledge to decode words',
              indicators: [
                { id: 'r-p1-i1', code: 'B1.2.1.1.1', description: 'Recognize letter-sound relationships' },
                { id: 'r-p1-i2', code: 'B1.2.1.1.2', description: 'Blend sounds to read words' }
              ]
            }
          ]
        },
        {
          id: 'comprehension',
          name: 'Reading Comprehension',
          contentStandards: [
            {
              id: 'r-c1',
              code: 'B1.2.2.1',
              description: 'Read and understand texts',
              indicators: [
                { id: 'r-c1-i1', code: 'B1.2.2.1.1', description: 'Identify main characters' },
                { id: 'r-c1-i2', code: 'B1.2.2.1.2', description: 'Retell stories in sequence' }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'writing',
      name: 'Writing',
      subStrands: [
        {
          id: 'handwriting',
          name: 'Handwriting',
          contentStandards: [
            {
              id: 'w-h1',
              code: 'B1.3.1.1',
              description: 'Write legibly',
              indicators: [
                { id: 'w-h1-i1', code: 'B1.3.1.1.1', description: 'Form letters correctly' },
                { id: 'w-h1-i2', code: 'B1.3.1.1.2', description: 'Write on lines' }
              ]
            }
          ]
        }
      ]
    }
  ]
};
