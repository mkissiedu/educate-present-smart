import { CKLACurriculum } from './ckla-curriculum-types';

export const cklaG2Skills: CKLACurriculum = {
  subject: 'Skills Strand',
  level: 'G2',
  strands: [
    {
      id: 'g2-ph', name: 'Advanced Phonics', color: 'blue',
      subStrands: [
        { id: 'g2-ph-1', name: 'Complex Vowel Patterns',
          contentStandards: [
            { id: 'g2-ph-1-1', code: 'G2.PH.1', description: 'Decode words with complex vowel patterns',
              indicators: [
                { id: 'g2-ph-1-1a', code: 'G2.PH.1a', description: 'Read r-controlled vowels (ar, er, ir, or, ur)' },
                { id: 'g2-ph-1-1b', code: 'G2.PH.1b', description: 'Read diphthongs (oi, oy, ou, ow)' },
                { id: 'g2-ph-1-1c', code: 'G2.PH.1c', description: 'Read variant vowels (oo, aw, au)' }
              ]
            }
          ]
        },
        { id: 'g2-ph-2', name: 'Multisyllabic Words',
          contentStandards: [
            { id: 'g2-ph-2-1', code: 'G2.PH.2', description: 'Decode multisyllabic words',
              indicators: [
                { id: 'g2-ph-2-1a', code: 'G2.PH.2a', description: 'Apply syllable division rules' },
                { id: 'g2-ph-2-1b', code: 'G2.PH.2b', description: 'Read words with prefixes and suffixes' }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'g2-fl', name: 'Fluency & Comprehension', color: 'emerald',
      subStrands: [
        { id: 'g2-fl-1', name: 'Reading Fluency',
          contentStandards: [
            { id: 'g2-fl-1-1', code: 'G2.FL.1', description: 'Read fluently with comprehension',
              indicators: [
                { id: 'g2-fl-1-1a', code: 'G2.FL.1a', description: 'Read grade-level text with expression' },
                { id: 'g2-fl-1-1b', code: 'G2.FL.1b', description: 'Adjust reading rate for purpose' }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'g2-wr', name: 'Writing & Grammar', color: 'amber',
      subStrands: [
        { id: 'g2-wr-1', name: 'Spelling & Conventions',
          contentStandards: [
            { id: 'g2-wr-1-1', code: 'G2.WR.1', description: 'Apply spelling and grammar conventions',
              indicators: [
                { id: 'g2-wr-1-1a', code: 'G2.WR.1a', description: 'Spell high-frequency words correctly' },
                { id: 'g2-wr-1-1b', code: 'G2.WR.1b', description: 'Use proper capitalization and punctuation' },
                { id: 'g2-wr-1-1c', code: 'G2.WR.1c', description: 'Write complete sentences' }
              ]
            }
          ]
        },
        { id: 'g2-wr-2', name: 'Composition',
          contentStandards: [
            { id: 'g2-wr-2-1', code: 'G2.WR.2', description: 'Write narratives and informational texts',
              indicators: [
                { id: 'g2-wr-2-1a', code: 'G2.WR.2a', description: 'Write stories with beginning, middle, end' },
                { id: 'g2-wr-2-1b', code: 'G2.WR.2b', description: 'Write informational paragraphs' }
              ]
            }
          ]
        }
      ]
    }
  ]
};
