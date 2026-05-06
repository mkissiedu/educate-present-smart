import { SubjectCurriculum } from './nacca-curriculum-types';

export const jhsSocialStudiesCurriculum: SubjectCurriculum = {
  subject: 'Social Studies',
  strands: [
    { id: 'environment', name: 'Environment', subStrands: [
      { id: 'physical', name: 'Physical Environment', contentStandards: [
        { id: 'ss-p1', code: 'B7.1.1.1', description: 'Understand physical features of Ghana', indicators: [
          { id: 'ss-p1-i1', code: 'B7.1.1.1.1', description: 'Identify major landforms' },
          { id: 'ss-p1-i2', code: 'B7.1.1.1.2', description: 'Describe climate zones' }
        ]}
      ]},
      { id: 'conservation', name: 'Environmental Conservation', contentStandards: [
        { id: 'ss-c1', code: 'B7.1.2.1', description: 'Understand environmental issues', indicators: [
          { id: 'ss-c1-i1', code: 'B7.1.2.1.1', description: 'Identify causes of deforestation' }
        ]}
      ]}
    ]},
    { id: 'governance', name: 'Governance', subStrands: [
      { id: 'govt', name: 'Government and Politics', contentStandards: [
        { id: 'ss-g1', code: 'B7.2.1.1', description: 'Understand Ghana\'s government structure', indicators: [
          { id: 'ss-g1-i1', code: 'B7.2.1.1.1', description: 'Describe the three arms of government' },
          { id: 'ss-g1-i2', code: 'B7.2.1.1.2', description: 'Explain the electoral process' }
        ]}
      ]},
      { id: 'rights', name: 'Rights and Responsibilities', contentStandards: [
        { id: 'ss-r1', code: 'B7.2.2.1', description: 'Understand citizen rights', indicators: [
          { id: 'ss-r1-i1', code: 'B7.2.2.1.1', description: 'Identify fundamental human rights' }
        ]}
      ]}
    ]},
    { id: 'socio-econ', name: 'Socio-Economic Development', subStrands: [
      { id: 'economy', name: 'Economic Activities', contentStandards: [
        { id: 'ss-e1', code: 'B7.3.1.1', description: 'Understand economic sectors', indicators: [
          { id: 'ss-e1-i1', code: 'B7.3.1.1.1', description: 'Describe primary, secondary, tertiary sectors' },
          { id: 'ss-e1-i2', code: 'B7.3.1.1.2', description: 'Explain Ghana\'s major exports' }
        ]}
      ]}
    ]},
    { id: 'culture', name: 'Culture and Identity', subStrands: [
      { id: 'heritage', name: 'Cultural Heritage', contentStandards: [
        { id: 'ss-h1', code: 'B7.4.1.1', description: 'Appreciate Ghanaian culture', indicators: [
          { id: 'ss-h1-i1', code: 'B7.4.1.1.1', description: 'Describe traditional festivals' },
          { id: 'ss-h1-i2', code: 'B7.4.1.1.2', description: 'Identify ethnic groups in Ghana' }
        ]}
      ]}
    ]}
  ]
};
