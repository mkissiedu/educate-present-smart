import { CKLACurriculum } from './ckla-curriculum-types';

export const cklaG2Knowledge: CKLACurriculum = {
  subject: 'Knowledge Strand',
  level: 'G2',
  strands: [
    {
      id: 'g2-ft', name: 'Fairy Tales & Tall Tales', color: 'purple',
      subStrands: [
        { id: 'g2-ft-1', name: 'Classic Tales',
          contentStandards: [
            { id: 'g2-ft-1-1', code: 'G2.FT.1', description: 'Analyze fairy tales and tall tales',
              indicators: [
                { id: 'g2-ft-1-1a', code: 'G2.FT.1a', description: 'Identify elements of fairy tales' },
                { id: 'g2-ft-1-1b', code: 'G2.FT.1b', description: 'Compare versions of classic tales' },
                { id: 'g2-ft-1-1c', code: 'G2.FT.1c', description: 'Recognize exaggeration in tall tales' }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'g2-ac', name: 'Ancient Civilizations', color: 'amber',
      subStrands: [
        { id: 'g2-ac-1', name: 'Early Civilizations',
          contentStandards: [
            { id: 'g2-ac-1-1', code: 'G2.AC.1', description: 'Explore ancient civilizations',
              indicators: [
                { id: 'g2-ac-1-1a', code: 'G2.AC.1a', description: 'Describe ancient Egypt and its culture' },
                { id: 'g2-ac-1-1b', code: 'G2.AC.1b', description: 'Identify contributions of ancient Greece' },
                { id: 'g2-ac-1-1c', code: 'G2.AC.1c', description: 'Explore ancient China and India' }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'g2-ww', name: 'World of Water', color: 'cyan',
      subStrands: [
        { id: 'g2-ww-1', name: 'Water Cycle & Oceans',
          contentStandards: [
            { id: 'g2-ww-1-1', code: 'G2.WW.1', description: 'Understand water cycle and ocean life',
              indicators: [
                { id: 'g2-ww-1-1a', code: 'G2.WW.1a', description: 'Describe the water cycle stages' },
                { id: 'g2-ww-1-1b', code: 'G2.WW.1b', description: 'Identify ocean zones and creatures' }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'g2-in', name: 'Insects', color: 'green',
      subStrands: [
        { id: 'g2-in-1', name: 'Insect Life',
          contentStandards: [
            { id: 'g2-in-1-1', code: 'G2.IN.1', description: 'Study insect characteristics and life cycles',
              indicators: [
                { id: 'g2-in-1-1a', code: 'G2.IN.1a', description: 'Identify insect body parts' },
                { id: 'g2-in-1-1b', code: 'G2.IN.1b', description: 'Describe metamorphosis stages' }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'g2-us', name: 'US History', color: 'rose',
      subStrands: [
        { id: 'g2-us-1', name: 'American History',
          contentStandards: [
            { id: 'g2-us-1-1', code: 'G2.US.1', description: 'Learn about American history and government',
              indicators: [
                { id: 'g2-us-1-1a', code: 'G2.US.1a', description: 'Identify American symbols and landmarks' },
                { id: 'g2-us-1-1b', code: 'G2.US.1b', description: 'Describe the US Constitution basics' }
              ]
            }
          ]
        }
      ]
    }
  ]
};
