import { KGSubjectCurriculum } from './nacca-kg-curriculum-types';

export const kg1OWOP: KGSubjectCurriculum = {
  subject: 'Our World Our People',
  level: 'KG1',
  strands: [
    {
      id: 'kg1-owop-me',
      name: 'All About Me',
      subStrands: [
        {
          id: 'kg1-owop-body',
          name: 'My Body',
          contentStandards: [
            {
              id: 'kg1-owop-b1',
              code: 'KG1.1.1.1',
              description: 'Know and care for body parts',
              indicators: [
                { id: 'kg1-owop-b1-i1', code: 'KG1.1.1.1.1', description: 'Name major body parts' },
                { id: 'kg1-owop-b1-i2', code: 'KG1.1.1.1.2', description: 'Describe functions of body parts' },
                { id: 'kg1-owop-b1-i3', code: 'KG1.1.1.1.3', description: 'Practice personal hygiene' }
              ]
            }
          ]
        },
        {
          id: 'kg1-owop-family',
          name: 'My Family',
          contentStandards: [
            {
              id: 'kg1-owop-f1',
              code: 'KG1.1.2.1',
              description: 'Know family members and their roles',
              indicators: [
                { id: 'kg1-owop-f1-i1', code: 'KG1.1.2.1.1', description: 'Identify immediate family members' },
                { id: 'kg1-owop-f1-i2', code: 'KG1.1.2.1.2', description: 'Describe roles of family members' },
                { id: 'kg1-owop-f1-i3', code: 'KG1.1.2.1.3', description: 'Show respect for family members' }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'kg1-owop-env',
      name: 'My Environment',
      subStrands: [
        {
          id: 'kg1-owop-school',
          name: 'My School',
          contentStandards: [
            {
              id: 'kg1-owop-sc1',
              code: 'KG1.2.1.1',
              description: 'Know the school environment',
              indicators: [
                { id: 'kg1-owop-sc1-i1', code: 'KG1.2.1.1.1', description: 'Identify places in school' },
                { id: 'kg1-owop-sc1-i2', code: 'KG1.2.1.1.2', description: 'Name school workers' },
                { id: 'kg1-owop-sc1-i3', code: 'KG1.2.1.1.3', description: 'Follow school rules' }
              ]
            }
          ]
        },
        {
          id: 'kg1-owop-home',
          name: 'My Home',
          contentStandards: [
            {
              id: 'kg1-owop-h1',
              code: 'KG1.2.2.1',
              description: 'Know the home environment',
              indicators: [
                { id: 'kg1-owop-h1-i1', code: 'KG1.2.2.1.1', description: 'Identify rooms in the home' },
                { id: 'kg1-owop-h1-i2', code: 'KG1.2.2.1.2', description: 'Name household items' },
                { id: 'kg1-owop-h1-i3', code: 'KG1.2.2.1.3', description: 'Keep home clean and tidy' }
              ]
            }
          ]
        }
      ]
    }
  ]
};
