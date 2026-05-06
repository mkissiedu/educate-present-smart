import { CKLACurriculum } from './ckla-curriculum-types';

export const cklaG1Knowledge: CKLACurriculum = {
  subject: 'Knowledge Strand',
  level: 'G1',
  strands: [
    {
      id: 'g1-fa', name: 'Fables & Stories', color: 'purple',
      subStrands: [
        { id: 'g1-fa-1', name: 'Classic Fables',
          contentStandards: [
            { id: 'g1-fa-1-1', code: 'G1.FA.1', description: 'Analyze fables and identify themes',
              indicators: [
                { id: 'g1-fa-1-1a', code: 'G1.FA.1a', description: 'Identify central message or lesson' },
                { id: 'g1-fa-1-1b', code: 'G1.FA.1b', description: 'Compare characters across fables' },
                { id: 'g1-fa-1-1c', code: 'G1.FA.1c', description: 'Retell stories with key details' }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'g1-hb', name: 'Human Body', color: 'rose',
      subStrands: [
        { id: 'g1-hb-1', name: 'Body Systems',
          contentStandards: [
            { id: 'g1-hb-1-1', code: 'G1.HB.1', description: 'Understand basic human body systems',
              indicators: [
                { id: 'g1-hb-1-1a', code: 'G1.HB.1a', description: 'Identify major body parts and functions' },
                { id: 'g1-hb-1-1b', code: 'G1.HB.1b', description: 'Describe how to stay healthy' }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'g1-dw', name: 'Different Lands', color: 'cyan',
      subStrands: [
        { id: 'g1-dw-1', name: 'World Geography',
          contentStandards: [
            { id: 'g1-dw-1-1', code: 'G1.DW.1', description: 'Explore different lands and cultures',
              indicators: [
                { id: 'g1-dw-1-1a', code: 'G1.DW.1a', description: 'Identify continents and oceans' },
                { id: 'g1-dw-1-1b', code: 'G1.DW.1b', description: 'Describe features of different habitats' }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'g1-ea', name: 'Early American', color: 'amber',
      subStrands: [
        { id: 'g1-ea-1', name: 'Early Civilizations',
          contentStandards: [
            { id: 'g1-ea-1-1', code: 'G1.EA.1', description: 'Learn about early American history',
              indicators: [
                { id: 'g1-ea-1-1a', code: 'G1.EA.1a', description: 'Describe Native American cultures' },
                { id: 'g1-ea-1-1b', code: 'G1.EA.1b', description: 'Identify early explorers and settlers' }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'g1-as', name: 'Astronomy', color: 'indigo',
      subStrands: [
        { id: 'g1-as-1', name: 'Space & Sky',
          contentStandards: [
            { id: 'g1-as-1-1', code: 'G1.AS.1', description: 'Understand basic astronomy concepts',
              indicators: [
                { id: 'g1-as-1-1a', code: 'G1.AS.1a', description: 'Describe the sun, moon, and stars' },
                { id: 'g1-as-1-1b', code: 'G1.AS.1b', description: 'Explain day and night cycle' }
              ]
            }
          ]
        }
      ]
    }
  ]
};
