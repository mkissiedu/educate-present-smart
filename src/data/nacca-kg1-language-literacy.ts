import { KGSubjectCurriculum } from './nacca-kg-curriculum-types';

export const kg1LanguageLiteracy: KGSubjectCurriculum = {
  subject: 'Language & Literacy',
  level: 'KG1',
  strands: [
    {
      id: 'kg1-ll-oral',
      name: 'Oral Language',
      subStrands: [
        {
          id: 'kg1-ll-listening',
          name: 'Listening',
          contentStandards: [
            {
              id: 'kg1-ll-l1',
              code: 'KG1.1.1.1',
              description: 'Demonstrate listening and comprehension skills',
              indicators: [
                { id: 'kg1-ll-l1-i1', code: 'KG1.1.1.1.1', description: 'Listen attentively to stories, rhymes and songs' },
                { id: 'kg1-ll-l1-i2', code: 'KG1.1.1.1.2', description: 'Follow simple one-step instructions' },
                { id: 'kg1-ll-l1-i3', code: 'KG1.1.1.1.3', description: 'Answer simple questions about stories heard' },
                { id: 'kg1-ll-l1-i4', code: 'KG1.1.1.1.4', description: 'Identify sounds in the environment' }
              ]
            }
          ]
        },
        {
          id: 'kg1-ll-speaking',
          name: 'Speaking',
          contentStandards: [
            {
              id: 'kg1-ll-s1',
              code: 'KG1.1.2.1',
              description: 'Speak clearly using appropriate vocabulary',
              indicators: [
                { id: 'kg1-ll-s1-i1', code: 'KG1.1.2.1.1', description: 'Say own name and names of family members' },
                { id: 'kg1-ll-s1-i2', code: 'KG1.1.2.1.2', description: 'Use simple greetings appropriately' },
                { id: 'kg1-ll-s1-i3', code: 'KG1.1.2.1.3', description: 'Recite simple rhymes and songs' },
                { id: 'kg1-ll-s1-i4', code: 'KG1.1.2.1.4', description: 'Describe objects using simple words' }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'kg1-ll-reading',
      name: 'Reading',
      subStrands: [
        {
          id: 'kg1-ll-phonics',
          name: 'Phonological Awareness',
          contentStandards: [
            {
              id: 'kg1-ll-p1',
              code: 'KG1.2.1.1',
              description: 'Develop phonological awareness skills',
              indicators: [
                { id: 'kg1-ll-p1-i1', code: 'KG1.2.1.1.1', description: 'Recognize rhyming words' },
                { id: 'kg1-ll-p1-i2', code: 'KG1.2.1.1.2', description: 'Identify initial sounds in words' },
                { id: 'kg1-ll-p1-i3', code: 'KG1.2.1.1.3', description: 'Clap syllables in words' }
              ]
            }
          ]
        }
      ]
    }
  ]
};
