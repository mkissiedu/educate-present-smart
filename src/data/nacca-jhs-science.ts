import { SubjectCurriculum } from './nacca-curriculum-types';

export const jhsScienceCurriculum: SubjectCurriculum = {
  subject: 'Science',
  strands: [
    { id: 'diversity', name: 'Diversity of Matter', subStrands: [
      { id: 'materials', name: 'Materials', contentStandards: [
        { id: 'sc-m1', code: 'B7.1.1.1', description: 'Classify materials by properties', indicators: [
          { id: 'sc-m1-i1', code: 'B7.1.1.1.1', description: 'Distinguish physical and chemical properties' },
          { id: 'sc-m1-i2', code: 'B7.1.1.1.2', description: 'Classify matter as elements, compounds, mixtures' }
        ]}
      ]},
      { id: 'mixtures', name: 'Mixtures', contentStandards: [
        { id: 'sc-mx1', code: 'B7.1.2.1', description: 'Separate mixtures using various methods', indicators: [
          { id: 'sc-mx1-i1', code: 'B7.1.2.1.1', description: 'Use filtration, evaporation, distillation' }
        ]}
      ]}
    ]},
    { id: 'cycles', name: 'Cycles', subStrands: [
      { id: 'earth', name: 'Earth Science', contentStandards: [
        { id: 'sc-e1', code: 'B7.2.1.1', description: 'Understand water and carbon cycles', indicators: [
          { id: 'sc-e1-i1', code: 'B7.2.1.1.1', description: 'Describe the water cycle' },
          { id: 'sc-e1-i2', code: 'B7.2.1.1.2', description: 'Explain the carbon cycle' }
        ]}
      ]},
      { id: 'life', name: 'Life Cycles', contentStandards: [
        { id: 'sc-lc1', code: 'B7.2.2.1', description: 'Understand life cycles of organisms', indicators: [
          { id: 'sc-lc1-i1', code: 'B7.2.2.1.1', description: 'Describe plant life cycles' }
        ]}
      ]}
    ]},
    { id: 'systems', name: 'Systems', subStrands: [
      { id: 'human', name: 'Human Body Systems', contentStandards: [
        { id: 'sc-h1', code: 'B7.3.1.1', description: 'Understand body systems', indicators: [
          { id: 'sc-h1-i1', code: 'B7.3.1.1.1', description: 'Describe the digestive system' },
          { id: 'sc-h1-i2', code: 'B7.3.1.1.2', description: 'Explain the circulatory system' }
        ]}
      ]},
      { id: 'eco', name: 'Ecosystems', contentStandards: [
        { id: 'sc-ec1', code: 'B7.3.2.1', description: 'Understand ecosystem interactions', indicators: [
          { id: 'sc-ec1-i1', code: 'B7.3.2.1.1', description: 'Describe food chains and webs' }
        ]}
      ]}
    ]},
    { id: 'forces', name: 'Forces and Energy', subStrands: [
      { id: 'energy', name: 'Energy', contentStandards: [
        { id: 'sc-f1', code: 'B7.4.1.1', description: 'Understand forms of energy', indicators: [
          { id: 'sc-f1-i1', code: 'B7.4.1.1.1', description: 'Identify energy transformations' },
          { id: 'sc-f1-i2', code: 'B7.4.1.1.2', description: 'Explain renewable energy sources' }
        ]}
      ]}
    ]}
  ]
};
