import { SubjectCurriculum } from './nacca-curriculum-types';

export const jhsMathematicsCurriculum: SubjectCurriculum = {
  subject: 'Mathematics',
  strands: [
    { id: 'number', name: 'Number', subStrands: [
      { id: 'num-ops', name: 'Number Operations', contentStandards: [
        { id: 'ma-n1', code: 'B7.1.1.1', description: 'Perform operations with integers', indicators: [
          { id: 'ma-n1-i1', code: 'B7.1.1.1.1', description: 'Add and subtract integers' },
          { id: 'ma-n1-i2', code: 'B7.1.1.1.2', description: 'Multiply and divide integers' }
        ]},
        { id: 'ma-n2', code: 'B7.1.1.2', description: 'Work with fractions and decimals', indicators: [
          { id: 'ma-n2-i1', code: 'B7.1.1.2.1', description: 'Convert between fractions and decimals' }
        ]}
      ]},
      { id: 'ratios', name: 'Ratios and Proportions', contentStandards: [
        { id: 'ma-r1', code: 'B7.1.2.1', description: 'Solve ratio and proportion problems', indicators: [
          { id: 'ma-r1-i1', code: 'B7.1.2.1.1', description: 'Calculate ratios' },
          { id: 'ma-r1-i2', code: 'B7.1.2.1.2', description: 'Solve proportion problems' }
        ]}
      ]}
    ]},
    { id: 'algebra', name: 'Algebra', subStrands: [
      { id: 'expressions', name: 'Algebraic Expressions', contentStandards: [
        { id: 'ma-a1', code: 'B7.2.1.1', description: 'Simplify algebraic expressions', indicators: [
          { id: 'ma-a1-i1', code: 'B7.2.1.1.1', description: 'Collect like terms' },
          { id: 'ma-a1-i2', code: 'B7.2.1.1.2', description: 'Expand brackets' }
        ]}
      ]},
      { id: 'equations', name: 'Equations', contentStandards: [
        { id: 'ma-e1', code: 'B7.2.2.1', description: 'Solve linear equations', indicators: [
          { id: 'ma-e1-i1', code: 'B7.2.2.1.1', description: 'Solve one-step equations' },
          { id: 'ma-e1-i2', code: 'B7.2.2.1.2', description: 'Solve two-step equations' }
        ]}
      ]}
    ]},
    { id: 'geometry', name: 'Geometry and Measurement', subStrands: [
      { id: 'shapes', name: 'Shapes and Space', contentStandards: [
        { id: 'ma-g1', code: 'B7.3.1.1', description: 'Understand properties of shapes', indicators: [
          { id: 'ma-g1-i1', code: 'B7.3.1.1.1', description: 'Calculate angles in polygons' },
          { id: 'ma-g1-i2', code: 'B7.3.1.1.2', description: 'Identify congruent shapes' }
        ]}
      ]},
      { id: 'measure', name: 'Measurement', contentStandards: [
        { id: 'ma-m1', code: 'B7.3.2.1', description: 'Calculate area and perimeter', indicators: [
          { id: 'ma-m1-i1', code: 'B7.3.2.1.1', description: 'Find area of compound shapes' }
        ]}
      ]}
    ]},
    { id: 'data', name: 'Data Handling', subStrands: [
      { id: 'stats', name: 'Statistics', contentStandards: [
        { id: 'ma-d1', code: 'B7.4.1.1', description: 'Collect and analyze data', indicators: [
          { id: 'ma-d1-i1', code: 'B7.4.1.1.1', description: 'Calculate mean, median, mode' }
        ]}
      ]}
    ]}
  ]
};
