import { SubjectCurriculum } from './nacca-curriculum-types';

export const upperPrimaryOwopCurriculum: SubjectCurriculum = {
  subject: 'Our World Our People',
  strands: [
    { id: 'environment', name: 'Environment', subStrands: [
      { id: 'physical', name: 'Physical Environment', contentStandards: [
        { id: 'up-ow-pe1', code: 'B3.1.1.1', description: 'Understand physical features of Ghana', indicators: [
          { id: 'up-ow-pe1-i1', code: 'B3.1.1.1.1', description: 'Identify major landforms' },
          { id: 'up-ow-pe1-i2', code: 'B3.1.1.1.2', description: 'Describe climate zones' }
        ]},
        { id: 'up-ow-pe2', code: 'B5.1.1.1', description: 'Analyze environmental issues', indicators: [
          { id: 'up-ow-pe2-i1', code: 'B5.1.1.1.1', description: 'Discuss environmental conservation' }
        ]}
      ]},
      { id: 'resources', name: 'Natural Resources', contentStandards: [
        { id: 'up-ow-nr1', code: 'B3.1.2.1', description: 'Know natural resources of Ghana', indicators: [
          { id: 'up-ow-nr1-i1', code: 'B3.1.2.1.1', description: 'Identify mineral resources' },
          { id: 'up-ow-nr1-i2', code: 'B3.1.2.1.2', description: 'Explain resource importance' }
        ]}
      ]}
    ]},
    { id: 'governance', name: 'Governance', subStrands: [
      { id: 'local', name: 'Local Governance', contentStandards: [
        { id: 'up-ow-lg1', code: 'B3.2.1.1', description: 'Understand local government', indicators: [
          { id: 'up-ow-lg1-i1', code: 'B3.2.1.1.1', description: 'Identify local leaders' },
          { id: 'up-ow-lg1-i2', code: 'B3.2.1.1.2', description: 'Explain roles of local government' }
        ]}
      ]},
      { id: 'national', name: 'National Governance', contentStandards: [
        { id: 'up-ow-ng1', code: 'B4.2.2.1', description: 'Understand national government', indicators: [
          { id: 'up-ow-ng1-i1', code: 'B4.2.2.1.1', description: 'Identify branches of government' },
          { id: 'up-ow-ng1-i2', code: 'B4.2.2.1.2', description: 'Explain democratic processes' }
        ]},
        { id: 'up-ow-ng2', code: 'B6.2.2.1', description: 'Analyze governance systems', indicators: [
          { id: 'up-ow-ng2-i1', code: 'B6.2.2.1.1', description: 'Compare governance systems' }
        ]}
      ]}
    ]},
    { id: 'history', name: 'History and Culture', subStrands: [
      { id: 'ghana-history', name: 'History of Ghana', contentStandards: [
        { id: 'up-ow-gh1', code: 'B3.3.1.1', description: 'Know Ghana history', indicators: [
          { id: 'up-ow-gh1-i1', code: 'B3.3.1.1.1', description: 'Describe pre-colonial Ghana' },
          { id: 'up-ow-gh1-i2', code: 'B3.3.1.1.2', description: 'Explain independence struggle' }
        ]},
        { id: 'up-ow-gh2', code: 'B5.3.1.1', description: 'Analyze historical events', indicators: [
          { id: 'up-ow-gh2-i1', code: 'B5.3.1.1.1', description: 'Evaluate impact of colonialism' }
        ]}
      ]},
      { id: 'culture', name: 'Ghanaian Culture', contentStandards: [
        { id: 'up-ow-cu1', code: 'B3.3.2.1', description: 'Appreciate Ghanaian culture', indicators: [
          { id: 'up-ow-cu1-i1', code: 'B3.3.2.1.1', description: 'Identify cultural practices' },
          { id: 'up-ow-cu1-i2', code: 'B3.3.2.1.2', description: 'Respect cultural diversity' }
        ]}
      ]}
    ]},
    { id: 'citizenship', name: 'Citizenship', subStrands: [
      { id: 'rights', name: 'Rights and Responsibilities', contentStandards: [
        { id: 'up-ow-rr1', code: 'B3.4.1.1', description: 'Know citizen rights and duties', indicators: [
          { id: 'up-ow-rr1-i1', code: 'B3.4.1.1.1', description: 'Identify fundamental rights' },
          { id: 'up-ow-rr1-i2', code: 'B3.4.1.1.2', description: 'Explain civic responsibilities' }
        ]}
      ]}
    ]}
  ]
};
