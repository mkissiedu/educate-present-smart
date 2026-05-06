import { LowerPrimarySubjectCurriculum } from './nacca-lower-primary-types';

export const lowerPrimaryOWOPCurriculum: LowerPrimarySubjectCurriculum = {
  subject: 'Our World Our People',
  strands: [
    { id: 'lp-owop-identity', name: 'All About Me', subStrands: [
      { id: 'lp-owop-self', name: 'My Identity', contentStandards: [
        { id: 'lp-owop-s1', code: 'B1.1.1.1', description: 'Know and appreciate personal identity', indicators: [
          { id: 'lp-owop-s1-i1', code: 'B1.1.1.1.1', description: 'State full name and age' },
          { id: 'lp-owop-s1-i2', code: 'B1.1.1.1.2', description: 'Identify body parts and their functions' },
          { id: 'lp-owop-s1-i3', code: 'B1.1.1.1.3', description: 'Describe physical characteristics' }
        ]},
        { id: 'lp-owop-s2', code: 'B2.1.1.1', description: 'Appreciate uniqueness and diversity', indicators: [
          { id: 'lp-owop-s2-i1', code: 'B2.1.1.1.1', description: 'Describe personal strengths' },
          { id: 'lp-owop-s2-i2', code: 'B2.1.1.1.2', description: 'Respect differences in others' }
        ]}
      ]},
      { id: 'lp-owop-health', name: 'Personal Health', contentStandards: [
        { id: 'lp-owop-h1', code: 'B1.1.2.1', description: 'Practice personal hygiene', indicators: [
          { id: 'lp-owop-h1-i1', code: 'B1.1.2.1.1', description: 'Demonstrate proper handwashing' },
          { id: 'lp-owop-h1-i2', code: 'B1.1.2.1.2', description: 'Brush teeth correctly' }
        ]},
        { id: 'lp-owop-h2', code: 'B2.1.2.1', description: 'Maintain good health habits', indicators: [
          { id: 'lp-owop-h2-i1', code: 'B2.1.2.1.1', description: 'Choose healthy foods' }
        ]}
      ]}
    ]},
    { id: 'lp-owop-family', name: 'My Family', subStrands: [
      { id: 'lp-owop-members', name: 'Family Members', contentStandards: [
        { id: 'lp-owop-f1', code: 'B1.2.1.1', description: 'Know family members and roles', indicators: [
          { id: 'lp-owop-f1-i1', code: 'B1.2.1.1.1', description: 'Name immediate family members' },
          { id: 'lp-owop-f1-i2', code: 'B1.2.1.1.2', description: 'Describe roles of family members' }
        ]},
        { id: 'lp-owop-f2', code: 'B2.2.1.1', description: 'Understand extended family', indicators: [
          { id: 'lp-owop-f2-i1', code: 'B2.2.1.1.1', description: 'Identify extended family members' }
        ]}
      ]}
    ]},
    { id: 'lp-owop-community', name: 'My Community', subStrands: [
      { id: 'lp-owop-school', name: 'My School', contentStandards: [
        { id: 'lp-owop-sc1', code: 'B1.3.1.1', description: 'Know school environment', indicators: [
          { id: 'lp-owop-sc1-i1', code: 'B1.3.1.1.1', description: 'Name school and classroom' },
          { id: 'lp-owop-sc1-i2', code: 'B1.3.1.1.2', description: 'Identify school workers' }
        ]}
      ]},
      { id: 'lp-owop-neighborhood', name: 'My Neighborhood', contentStandards: [
        { id: 'lp-owop-n1', code: 'B2.3.1.1', description: 'Know community helpers', indicators: [
          { id: 'lp-owop-n1-i1', code: 'B2.3.1.1.1', description: 'Identify community workers' }
        ]}
      ]}
    ]},
    { id: 'lp-owop-environment', name: 'Our Environment', subStrands: [
      { id: 'lp-owop-nature', name: 'Natural Environment', contentStandards: [
        { id: 'lp-owop-e1', code: 'B1.4.1.1', description: 'Observe natural environment', indicators: [
          { id: 'lp-owop-e1-i1', code: 'B1.4.1.1.1', description: 'Identify plants and animals' }
        ]},
        { id: 'lp-owop-e2', code: 'B2.4.1.1', description: 'Care for the environment', indicators: [
          { id: 'lp-owop-e2-i1', code: 'B2.4.1.1.1', description: 'Practice proper waste disposal' }
        ]}
      ]}
    ]}
  ]
};
