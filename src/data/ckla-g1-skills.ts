import { CKLACurriculum } from './ckla-curriculum-types';

export const cklaG1Skills: CKLACurriculum = {
  subject: 'Skills Strand',
  level: 'G1',
  strands: [
    {
      id: 'g1-pa', name: 'Advanced Phonemic Awareness', color: 'emerald',
      subStrands: [
        { id: 'g1-pa-1', name: 'Phoneme Manipulation',
          contentStandards: [
            { id: 'g1-pa-1-1', code: 'G1.PA.1', description: 'Manipulate phonemes in spoken words',
              indicators: [
                { id: 'g1-pa-1-1a', code: 'G1.PA.1a', description: 'Add phonemes to create new words' },
                { id: 'g1-pa-1-1b', code: 'G1.PA.1b', description: 'Delete phonemes to form new words' },
                { id: 'g1-pa-1-1c', code: 'G1.PA.1c', description: 'Substitute phonemes in words' }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'g1-ph', name: 'Phonics & Word Recognition', color: 'blue',
      subStrands: [
        { id: 'g1-ph-1', name: 'Consonant Blends & Digraphs',
          contentStandards: [
            { id: 'g1-ph-1-1', code: 'G1.PH.1', description: 'Decode words with blends and digraphs',
              indicators: [
                { id: 'g1-ph-1-1a', code: 'G1.PH.1a', description: 'Read words with initial blends (bl, cr, st)' },
                { id: 'g1-ph-1-1b', code: 'G1.PH.1b', description: 'Read words with final blends (nd, mp, sk)' },
                { id: 'g1-ph-1-1c', code: 'G1.PH.1c', description: 'Read digraphs (sh, ch, th, wh)' }
              ]
            }
          ]
        },
        { id: 'g1-ph-2', name: 'Long Vowels',
          contentStandards: [
            { id: 'g1-ph-2-1', code: 'G1.PH.2', description: 'Decode words with long vowel patterns',
              indicators: [
                { id: 'g1-ph-2-1a', code: 'G1.PH.2a', description: 'Read CVCe words (make, like, home)' },
                { id: 'g1-ph-2-1b', code: 'G1.PH.2b', description: 'Read vowel teams (ai, ea, oa)' }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'g1-fl', name: 'Fluency', color: 'amber',
      subStrands: [
        { id: 'g1-fl-1', name: 'Reading Fluency',
          contentStandards: [
            { id: 'g1-fl-1-1', code: 'G1.FL.1', description: 'Read with accuracy and expression',
              indicators: [
                { id: 'g1-fl-1-1a', code: 'G1.FL.1a', description: 'Read grade-level text with purpose' },
                { id: 'g1-fl-1-1b', code: 'G1.FL.1b', description: 'Use context to self-correct' }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'g1-wr', name: 'Writing & Spelling', color: 'rose',
      subStrands: [
        { id: 'g1-wr-1', name: 'Spelling Patterns',
          contentStandards: [
            { id: 'g1-wr-1-1', code: 'G1.WR.1', description: 'Spell words using phonetic patterns',
              indicators: [
                { id: 'g1-wr-1-1a', code: 'G1.WR.1a', description: 'Spell words with blends and digraphs' },
                { id: 'g1-wr-1-1b', code: 'G1.WR.1b', description: 'Spell CVCe words correctly' }
              ]
            }
          ]
        }
      ]
    }
  ]
};
