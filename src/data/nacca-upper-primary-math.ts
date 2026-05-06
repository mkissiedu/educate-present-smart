import { SubjectCurriculum } from './nacca-curriculum-types';

export const upperPrimaryMathCurriculum: SubjectCurriculum = {
  subject: 'Mathematics',
  strands: [
    { id: 'number', name: 'Number', subStrands: [
      { id: 'whole-numbers', name: 'Whole Numbers', contentStandards: [
        { id: 'up-m-wn1', code: 'B3.1.1.1', description: 'Read and write numbers to 10,000', indicators: [
          { id: 'up-m-wn1-i1', code: 'B3.1.1.1.1', description: 'Count in thousands' },
          { id: 'up-m-wn1-i2', code: 'B3.1.1.1.2', description: 'Compare and order numbers' }
        ]},
        { id: 'up-m-wn2', code: 'B4.1.1.1', description: 'Work with numbers to 100,000', indicators: [
          { id: 'up-m-wn2-i1', code: 'B4.1.1.1.1', description: 'Round numbers to nearest thousand' }
        ]},
        { id: 'up-m-wn3', code: 'B5.1.1.1', description: 'Work with numbers to 1,000,000', indicators: [
          { id: 'up-m-wn3-i1', code: 'B5.1.1.1.1', description: 'Use place value to millions' }
        ]},
        { id: 'up-m-wn4', code: 'B6.1.1.1', description: 'Work with large numbers', indicators: [
          { id: 'up-m-wn4-i1', code: 'B6.1.1.1.1', description: 'Apply operations to large numbers' }
        ]}
      ]},
      { id: 'fractions', name: 'Fractions and Decimals', contentStandards: [
        { id: 'up-m-fr1', code: 'B3.1.2.1', description: 'Understand basic fractions', indicators: [
          { id: 'up-m-fr1-i1', code: 'B3.1.2.1.1', description: 'Identify halves and quarters' },
          { id: 'up-m-fr1-i2', code: 'B3.1.2.1.2', description: 'Compare simple fractions' }
        ]},
        { id: 'up-m-fr2', code: 'B5.1.2.1', description: 'Perform operations with fractions', indicators: [
          { id: 'up-m-fr2-i1', code: 'B5.1.2.1.1', description: 'Add and subtract fractions' }
        ]}
      ]},
      { id: 'operations', name: 'Operations', contentStandards: [
        { id: 'up-m-op1', code: 'B3.1.3.1', description: 'Multiply and divide', indicators: [
          { id: 'up-m-op1-i1', code: 'B3.1.3.1.1', description: 'Know multiplication tables to 10' },
          { id: 'up-m-op1-i2', code: 'B3.1.3.1.2', description: 'Divide with remainders' }
        ]}
      ]}
    ]},
    { id: 'algebra', name: 'Algebra', subStrands: [
      { id: 'patterns', name: 'Patterns and Relations', contentStandards: [
        { id: 'up-m-pt1', code: 'B3.2.1.1', description: 'Identify and extend patterns', indicators: [
          { id: 'up-m-pt1-i1', code: 'B3.2.1.1.1', description: 'Complete number patterns' }
        ]},
        { id: 'up-m-pt2', code: 'B5.2.1.1', description: 'Use variables in expressions', indicators: [
          { id: 'up-m-pt2-i1', code: 'B5.2.1.1.1', description: 'Solve simple equations' }
        ]}
      ]}
    ]},
    { id: 'geometry', name: 'Geometry and Measurement', subStrands: [
      { id: 'shapes', name: 'Shapes and Space', contentStandards: [
        { id: 'up-m-sh1', code: 'B3.3.1.1', description: 'Identify 2D and 3D shapes', indicators: [
          { id: 'up-m-sh1-i1', code: 'B3.3.1.1.1', description: 'Classify polygons' },
          { id: 'up-m-sh1-i2', code: 'B3.3.1.1.2', description: 'Identify solid shapes' }
        ]}
      ]},
      { id: 'measurement', name: 'Measurement', contentStandards: [
        { id: 'up-m-ms1', code: 'B3.3.2.1', description: 'Measure length, mass, and capacity', indicators: [
          { id: 'up-m-ms1-i1', code: 'B3.3.2.1.1', description: 'Use standard units' }
        ]},
        { id: 'up-m-ms2', code: 'B5.3.2.1', description: 'Calculate perimeter and area', indicators: [
          { id: 'up-m-ms2-i1', code: 'B5.3.2.1.1', description: 'Find area of rectangles' }
        ]}
      ]}
    ]},
    { id: 'data', name: 'Data Handling', subStrands: [
      { id: 'collection', name: 'Data Collection', contentStandards: [
        { id: 'up-m-dc1', code: 'B3.4.1.1', description: 'Collect and organize data', indicators: [
          { id: 'up-m-dc1-i1', code: 'B3.4.1.1.1', description: 'Create tally charts' },
          { id: 'up-m-dc1-i2', code: 'B3.4.1.1.2', description: 'Read bar graphs' }
        ]}
      ]}
    ]}
  ]
};
