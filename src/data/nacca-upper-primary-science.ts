import { SubjectCurriculum } from './nacca-curriculum-types';

export const upperPrimaryScienceCurriculum: SubjectCurriculum = {
  subject: 'Science',
  strands: [
    { id: 'diversity', name: 'Diversity of Matter', subStrands: [
      { id: 'living', name: 'Living and Non-Living Things', contentStandards: [
        { id: 'up-sc-lv1', code: 'B3.1.1.1', description: 'Classify living and non-living things', indicators: [
          { id: 'up-sc-lv1-i1', code: 'B3.1.1.1.1', description: 'Identify characteristics of living things' },
          { id: 'up-sc-lv1-i2', code: 'B3.1.1.1.2', description: 'Group organisms by features' }
        ]},
        { id: 'up-sc-lv2', code: 'B5.1.1.1', description: 'Understand classification systems', indicators: [
          { id: 'up-sc-lv2-i1', code: 'B5.1.1.1.1', description: 'Use scientific classification' }
        ]}
      ]},
      { id: 'materials', name: 'Materials', contentStandards: [
        { id: 'up-sc-mt1', code: 'B3.1.2.1', description: 'Identify properties of materials', indicators: [
          { id: 'up-sc-mt1-i1', code: 'B3.1.2.1.1', description: 'Compare material properties' },
          { id: 'up-sc-mt1-i2', code: 'B3.1.2.1.2', description: 'Classify materials by state' }
        ]},
        { id: 'up-sc-mt2', code: 'B5.1.2.1', description: 'Understand changes in matter', indicators: [
          { id: 'up-sc-mt2-i1', code: 'B5.1.2.1.1', description: 'Distinguish physical and chemical changes' }
        ]}
      ]}
    ]},
    { id: 'cycles', name: 'Cycles', subStrands: [
      { id: 'life-cycle', name: 'Life Cycles', contentStandards: [
        { id: 'up-sc-lc1', code: 'B3.2.1.1', description: 'Understand life cycles of organisms', indicators: [
          { id: 'up-sc-lc1-i1', code: 'B3.2.1.1.1', description: 'Describe plant life cycles' },
          { id: 'up-sc-lc1-i2', code: 'B3.2.1.1.2', description: 'Describe animal life cycles' }
        ]}
      ]},
      { id: 'earth-cycles', name: 'Earth Cycles', contentStandards: [
        { id: 'up-sc-ec1', code: 'B4.2.2.1', description: 'Understand water and rock cycles', indicators: [
          { id: 'up-sc-ec1-i1', code: 'B4.2.2.1.1', description: 'Explain the water cycle' },
          { id: 'up-sc-ec1-i2', code: 'B4.2.2.1.2', description: 'Describe rock formation' }
        ]}
      ]}
    ]},
    { id: 'systems', name: 'Systems', subStrands: [
      { id: 'human-body', name: 'Human Body Systems', contentStandards: [
        { id: 'up-sc-hb1', code: 'B3.3.1.1', description: 'Know major body systems', indicators: [
          { id: 'up-sc-hb1-i1', code: 'B3.3.1.1.1', description: 'Identify body organs' },
          { id: 'up-sc-hb1-i2', code: 'B3.3.1.1.2', description: 'Explain organ functions' }
        ]},
        { id: 'up-sc-hb2', code: 'B5.3.1.1', description: 'Understand system interactions', indicators: [
          { id: 'up-sc-hb2-i1', code: 'B5.3.1.1.1', description: 'Explain how systems work together' }
        ]}
      ]},
      { id: 'ecosystem', name: 'Ecosystems', contentStandards: [
        { id: 'up-sc-es1', code: 'B4.3.2.1', description: 'Understand ecosystems', indicators: [
          { id: 'up-sc-es1-i1', code: 'B4.3.2.1.1', description: 'Identify food chains' },
          { id: 'up-sc-es1-i2', code: 'B4.3.2.1.2', description: 'Explain food webs' }
        ]}
      ]}
    ]},
    { id: 'forces', name: 'Forces and Energy', subStrands: [
      { id: 'forces', name: 'Forces and Motion', contentStandards: [
        { id: 'up-sc-fm1', code: 'B3.4.1.1', description: 'Understand forces', indicators: [
          { id: 'up-sc-fm1-i1', code: 'B3.4.1.1.1', description: 'Identify push and pull forces' },
          { id: 'up-sc-fm1-i2', code: 'B3.4.1.1.2', description: 'Describe effects of forces' }
        ]}
      ]},
      { id: 'energy', name: 'Energy', contentStandards: [
        { id: 'up-sc-en1', code: 'B4.4.2.1', description: 'Understand energy forms', indicators: [
          { id: 'up-sc-en1-i1', code: 'B4.4.2.1.1', description: 'Identify energy sources' },
          { id: 'up-sc-en1-i2', code: 'B4.4.2.1.2', description: 'Explain energy transformations' }
        ]}
      ]}
    ]}
  ]
};
