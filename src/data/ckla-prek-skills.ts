import { CKLACurriculum } from './ckla-curriculum-types';

export const cklaPreKSkills: CKLACurriculum = {
  subject: 'Skills Strand',
  level: 'PreK',
  strands: [
    {
      id: 'prek-pa', name: 'Phonological Awareness', color: 'emerald',
      subStrands: [
        { id: 'prek-pa-1', name: 'Listening & Sound Awareness',
          contentStandards: [
            { id: 'prek-pa-1-1', code: 'PK.PA.1', description: 'Recognize and discriminate environmental sounds',
              indicators: [
                { id: 'prek-pa-1-1a', code: 'PK.PA.1a', description: 'Identify common sounds (animals, vehicles, nature)' },
                { id: 'prek-pa-1-1b', code: 'PK.PA.1b', description: 'Match sounds to their sources' }
              ]
            }
          ]
        },
        { id: 'prek-pa-2', name: 'Rhyme Recognition',
          contentStandards: [
            { id: 'prek-pa-2-1', code: 'PK.PA.2', description: 'Recognize and produce rhyming words',
              indicators: [
                { id: 'prek-pa-2-1a', code: 'PK.PA.2a', description: 'Identify words that rhyme in songs and poems' },
                { id: 'prek-pa-2-1b', code: 'PK.PA.2b', description: 'Complete rhyming patterns orally' }
              ]
            }
          ]
        },
        { id: 'prek-pa-3', name: 'Syllable Awareness',
          contentStandards: [
            { id: 'prek-pa-3-1', code: 'PK.PA.3', description: 'Segment words into syllables',
              indicators: [
                { id: 'prek-pa-3-1a', code: 'PK.PA.3a', description: 'Clap syllables in familiar words' },
                { id: 'prek-pa-3-1b', code: 'PK.PA.3b', description: 'Count syllables in names' }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'prek-pc', name: 'Print Concepts', color: 'blue',
      subStrands: [
        { id: 'prek-pc-1', name: 'Book Handling',
          contentStandards: [
            { id: 'prek-pc-1-1', code: 'PK.PC.1', description: 'Demonstrate understanding of book organization',
              indicators: [
                { id: 'prek-pc-1-1a', code: 'PK.PC.1a', description: 'Hold book correctly and turn pages' },
                { id: 'prek-pc-1-1b', code: 'PK.PC.1b', description: 'Identify front cover, back cover, title' }
              ]
            }
          ]
        },
        { id: 'prek-pc-2', name: 'Print Awareness',
          contentStandards: [
            { id: 'prek-pc-2-1', code: 'PK.PC.2', description: 'Understand print carries meaning',
              indicators: [
                { id: 'prek-pc-2-1a', code: 'PK.PC.2a', description: 'Track print left to right, top to bottom' },
                { id: 'prek-pc-2-1b', code: 'PK.PC.2b', description: 'Distinguish letters from words' }
              ]
            }
          ]
        }
      ]
    }
  ]
};
