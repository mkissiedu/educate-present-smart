import { CKLACurriculum } from './ckla-curriculum-types';

export const cklaKKnowledge: CKLACurriculum = {
  subject: 'Knowledge Strand',
  level: 'K',
  strands: [
    {
      id: 'k-nr', name: 'Nursery Rhymes & Fables', color: 'purple',
      subStrands: [
        { id: 'k-nr-1', name: 'Classic Tales',
          contentStandards: [
            { id: 'k-nr-1-1', code: 'K.NR.1', description: 'Understand and retell classic stories',
              indicators: [
                { id: 'k-nr-1-1a', code: 'K.NR.1a', description: 'Retell fables with key details' },
                { id: 'k-nr-1-1b', code: 'K.NR.1b', description: 'Identify story elements (character, setting, plot)' },
                { id: 'k-nr-1-1c', code: 'K.NR.1c', description: 'Explain lessons from fables' }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'k-fs', name: 'Five Senses', color: 'amber',
      subStrands: [
        { id: 'k-fs-1', name: 'Sensory Exploration',
          contentStandards: [
            { id: 'k-fs-1-1', code: 'K.FS.1', description: 'Explore the world through five senses',
              indicators: [
                { id: 'k-fs-1-1a', code: 'K.FS.1a', description: 'Describe how senses help us learn' },
                { id: 'k-fs-1-1b', code: 'K.FS.1b', description: 'Use sensory vocabulary in descriptions' }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'k-pl', name: 'Plants', color: 'green',
      subStrands: [
        { id: 'k-pl-1', name: 'Plant Life',
          contentStandards: [
            { id: 'k-pl-1-1', code: 'K.PL.1', description: 'Understand plant parts and growth',
              indicators: [
                { id: 'k-pl-1-1a', code: 'K.PL.1a', description: 'Identify plant parts (roots, stem, leaves, flower)' },
                { id: 'k-pl-1-1b', code: 'K.PL.1b', description: 'Describe what plants need to grow' }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'k-an', name: 'Animals', color: 'rose',
      subStrands: [
        { id: 'k-an-1', name: 'Animal Habitats',
          contentStandards: [
            { id: 'k-an-1-1', code: 'K.AN.1', description: 'Understand animal characteristics and habitats',
              indicators: [
                { id: 'k-an-1-1a', code: 'K.AN.1a', description: 'Classify animals by habitat' },
                { id: 'k-an-1-1b', code: 'K.AN.1b', description: 'Describe animal needs for survival' }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'k-ss', name: 'Seasons & Weather', color: 'cyan',
      subStrands: [
        { id: 'k-ss-1', name: 'Weather Patterns',
          contentStandards: [
            { id: 'k-ss-1-1', code: 'K.SS.1', description: 'Observe and describe weather and seasons',
              indicators: [
                { id: 'k-ss-1-1a', code: 'K.SS.1a', description: 'Identify types of weather' },
                { id: 'k-ss-1-1b', code: 'K.SS.1b', description: 'Describe characteristics of seasons' }
              ]
            }
          ]
        }
      ]
    }
  ]
};
