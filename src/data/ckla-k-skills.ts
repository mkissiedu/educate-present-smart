import { CKLACurriculum } from './ckla-curriculum-types';

export const cklaKSkills: CKLACurriculum = {
  subject: 'Skills Strand',
  level: 'K',
  strands: [
    {
      id: 'k-pa', name: 'Phonemic Awareness', color: 'emerald',
      subStrands: [
        { id: 'k-pa-1', name: 'Phoneme Isolation',
          contentStandards: [
            { id: 'k-pa-1-1', code: 'K.PA.1', description: 'Isolate and pronounce initial, medial, and final sounds',
              indicators: [
                { id: 'k-pa-1-1a', code: 'K.PA.1a', description: 'Identify initial sounds in CVC words' },
                { id: 'k-pa-1-1b', code: 'K.PA.1b', description: 'Identify final sounds in CVC words' },
                { id: 'k-pa-1-1c', code: 'K.PA.1c', description: 'Identify medial vowel sounds' }
              ]
            }
          ]
        },
        { id: 'k-pa-2', name: 'Blending & Segmenting',
          contentStandards: [
            { id: 'k-pa-2-1', code: 'K.PA.2', description: 'Blend and segment phonemes in words',
              indicators: [
                { id: 'k-pa-2-1a', code: 'K.PA.2a', description: 'Orally blend 2-3 phonemes into words' },
                { id: 'k-pa-2-1b', code: 'K.PA.2b', description: 'Segment CVC words into phonemes' }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'k-ph', name: 'Phonics', color: 'blue',
      subStrands: [
        { id: 'k-ph-1', name: 'Letter-Sound Correspondence',
          contentStandards: [
            { id: 'k-ph-1-1', code: 'K.PH.1', description: 'Know letter-sound correspondences',
              indicators: [
                { id: 'k-ph-1-1a', code: 'K.PH.1a', description: 'Produce sounds for all consonants' },
                { id: 'k-ph-1-1b', code: 'K.PH.1b', description: 'Produce short vowel sounds' },
                { id: 'k-ph-1-1c', code: 'K.PH.1c', description: 'Recognize uppercase and lowercase letters' }
              ]
            }
          ]
        },
        { id: 'k-ph-2', name: 'Decoding',
          contentStandards: [
            { id: 'k-ph-2-1', code: 'K.PH.2', description: 'Decode CVC words and high-frequency words',
              indicators: [
                { id: 'k-ph-2-1a', code: 'K.PH.2a', description: 'Read CVC words with short vowels' },
                { id: 'k-ph-2-1b', code: 'K.PH.2b', description: 'Read tricky words (the, a, is, to)' }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'k-wr', name: 'Writing & Spelling', color: 'amber',
      subStrands: [
        { id: 'k-wr-1', name: 'Encoding',
          contentStandards: [
            { id: 'k-wr-1-1', code: 'K.WR.1', description: 'Spell and write CVC words',
              indicators: [
                { id: 'k-wr-1-1a', code: 'K.WR.1a', description: 'Write letters for consonant sounds' },
                { id: 'k-wr-1-1b', code: 'K.WR.1b', description: 'Spell CVC words phonetically' }
              ]
            }
          ]
        }
      ]
    }
  ]
};
