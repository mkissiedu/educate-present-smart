import { SubjectCurriculum } from './nacca-curriculum-types';

export const jhsCareerTechCurriculum: SubjectCurriculum = {
  subject: 'Career Technology',
  strands: [
    { id: 'career-dev', name: 'Career Development', subStrands: [
      { id: 'self-awareness', name: 'Self-Awareness', contentStandards: [
        { id: 'ct-s1', code: 'B7.1.1.1', description: 'Understand personal strengths', indicators: [
          { id: 'ct-s1-i1', code: 'B7.1.1.1.1', description: 'Identify personal interests and abilities' },
          { id: 'ct-s1-i2', code: 'B7.1.1.1.2', description: 'Set career goals' }
        ]}
      ]},
      { id: 'exploration', name: 'Career Exploration', contentStandards: [
        { id: 'ct-e1', code: 'B7.1.2.1', description: 'Explore career options', indicators: [
          { id: 'ct-e1-i1', code: 'B7.1.2.1.1', description: 'Research various careers' }
        ]}
      ]}
    ]},
    { id: 'tech-skills', name: 'Technical Skills', subStrands: [
      { id: 'basic-tech', name: 'Basic Technology', contentStandards: [
        { id: 'ct-t1', code: 'B7.2.1.1', description: 'Apply basic technical skills', indicators: [
          { id: 'ct-t1-i1', code: 'B7.2.1.1.1', description: 'Use basic tools safely' },
          { id: 'ct-t1-i2', code: 'B7.2.1.1.2', description: 'Follow technical instructions' }
        ]}
      ]},
      { id: 'design', name: 'Design and Making', contentStandards: [
        { id: 'ct-d1', code: 'B7.2.2.1', description: 'Design and create products', indicators: [
          { id: 'ct-d1-i1', code: 'B7.2.2.1.1', description: 'Sketch design ideas' },
          { id: 'ct-d1-i2', code: 'B7.2.2.1.2', description: 'Construct simple projects' }
        ]}
      ]}
    ]},
    { id: 'entrepreneurship', name: 'Entrepreneurship', subStrands: [
      { id: 'business', name: 'Business Basics', contentStandards: [
        { id: 'ct-b1', code: 'B7.3.1.1', description: 'Understand entrepreneurship', indicators: [
          { id: 'ct-b1-i1', code: 'B7.3.1.1.1', description: 'Identify business opportunities' },
          { id: 'ct-b1-i2', code: 'B7.3.1.1.2', description: 'Create simple business plans' }
        ]}
      ]}
    ]},
    { id: 'life-skills', name: 'Life Skills', subStrands: [
      { id: 'practical', name: 'Practical Life Skills', contentStandards: [
        { id: 'ct-l1', code: 'B7.4.1.1', description: 'Apply life skills', indicators: [
          { id: 'ct-l1-i1', code: 'B7.4.1.1.1', description: 'Manage time effectively' },
          { id: 'ct-l1-i2', code: 'B7.4.1.1.2', description: 'Work collaboratively' }
        ]}
      ]}
    ]}
  ]
};
