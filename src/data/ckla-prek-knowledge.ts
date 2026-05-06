import { CKLACurriculum } from './ckla-curriculum-types';

export const cklaPreKKnowledge: CKLACurriculum = {
  subject: 'Knowledge Strand',
  level: 'PreK',
  strands: [
    {
      id: 'prek-nr', name: 'Nursery Rhymes & Fables', color: 'purple',
      subStrands: [
        { id: 'prek-nr-1', name: 'Classic Nursery Rhymes',
          contentStandards: [
            { id: 'prek-nr-1-1', code: 'PK.NR.1', description: 'Recite and understand nursery rhymes',
              indicators: [
                { id: 'prek-nr-1-1a', code: 'PK.NR.1a', description: 'Recite familiar nursery rhymes with expression' },
                { id: 'prek-nr-1-1b', code: 'PK.NR.1b', description: 'Identify characters and events in rhymes' }
              ]
            }
          ]
        },
        { id: 'prek-nr-2', name: 'Fables & Folktales',
          contentStandards: [
            { id: 'prek-nr-2-1', code: 'PK.NR.2', description: 'Understand simple fables and their lessons',
              indicators: [
                { id: 'prek-nr-2-1a', code: 'PK.NR.2a', description: 'Retell key events from fables' },
                { id: 'prek-nr-2-1b', code: 'PK.NR.2b', description: 'Identify the moral or lesson' }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'prek-fs', name: 'Five Senses', color: 'amber',
      subStrands: [
        { id: 'prek-fs-1', name: 'Exploring Senses',
          contentStandards: [
            { id: 'prek-fs-1-1', code: 'PK.FS.1', description: 'Identify and describe the five senses',
              indicators: [
                { id: 'prek-fs-1-1a', code: 'PK.FS.1a', description: 'Name the five senses and associated body parts' },
                { id: 'prek-fs-1-1b', code: 'PK.FS.1b', description: 'Describe objects using sensory words' }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'prek-st', name: 'Stories', color: 'rose',
      subStrands: [
        { id: 'prek-st-1', name: 'Story Comprehension',
          contentStandards: [
            { id: 'prek-st-1-1', code: 'PK.ST.1', description: 'Demonstrate comprehension of read-alouds',
              indicators: [
                { id: 'prek-st-1-1a', code: 'PK.ST.1a', description: 'Answer questions about characters and setting' },
                { id: 'prek-st-1-1b', code: 'PK.ST.1b', description: 'Sequence story events' },
                { id: 'prek-st-1-1c', code: 'PK.ST.1c', description: 'Make predictions about stories' }
              ]
            }
          ]
        }
      ]
    }
  ]
};
