import { LowerPrimarySubjectCurriculum } from './nacca-lower-primary-types';

export const lowerPrimaryMathCurriculum: LowerPrimarySubjectCurriculum = {
  subject: 'Mathematics',
  strands: [
    { id: 'lp-number', name: 'Number', subStrands: [
      { id: 'lp-counting', name: 'Counting', contentStandards: [
        { id: 'lp-m-c1', code: 'B1.1.1.1', description: 'Count whole numbers up to 100', indicators: [
          { id: 'lp-m-c1-i1', code: 'B1.1.1.1.1', description: 'Count objects up to 20' },
          { id: 'lp-m-c1-i2', code: 'B1.1.1.1.2', description: 'Count forward and backward 1-50' },
          { id: 'lp-m-c1-i3', code: 'B1.1.1.1.3', description: 'Skip count by 2s, 5s, 10s' }
        ]},
        { id: 'lp-m-c2', code: 'B2.1.1.1', description: 'Count whole numbers up to 1000', indicators: [
          { id: 'lp-m-c2-i1', code: 'B2.1.1.1.1', description: 'Count objects up to 100' },
          { id: 'lp-m-c2-i2', code: 'B2.1.1.1.2', description: 'Count in hundreds' }
        ]}
      ]},
      { id: 'lp-place-value', name: 'Place Value', contentStandards: [
        { id: 'lp-m-pv1', code: 'B1.1.2.1', description: 'Understand place value to 99', indicators: [
          { id: 'lp-m-pv1-i1', code: 'B1.1.2.1.1', description: 'Identify tens and ones' }
        ]},
        { id: 'lp-m-pv2', code: 'B2.1.2.1', description: 'Understand place value to 999', indicators: [
          { id: 'lp-m-pv2-i1', code: 'B2.1.2.1.1', description: 'Identify hundreds, tens, ones' }
        ]}
      ]},
      { id: 'lp-operations', name: 'Number Operations', contentStandards: [
        { id: 'lp-m-o1', code: 'B1.1.3.1', description: 'Add and subtract within 20', indicators: [
          { id: 'lp-m-o1-i1', code: 'B1.1.3.1.1', description: 'Add single-digit numbers' },
          { id: 'lp-m-o1-i2', code: 'B1.1.3.1.2', description: 'Subtract single-digit numbers' }
        ]},
        { id: 'lp-m-o2', code: 'B2.1.3.1', description: 'Add and subtract within 100', indicators: [
          { id: 'lp-m-o2-i1', code: 'B2.1.3.1.1', description: 'Add two-digit numbers' },
          { id: 'lp-m-o2-i2', code: 'B2.1.3.1.2', description: 'Subtract with regrouping' }
        ]}
      ]}
    ]},
    { id: 'lp-measurement', name: 'Measurement', subStrands: [
      { id: 'lp-length', name: 'Length', contentStandards: [
        { id: 'lp-m-l1', code: 'B1.2.1.1', description: 'Compare and measure lengths', indicators: [
          { id: 'lp-m-l1-i1', code: 'B1.2.1.1.1', description: 'Compare objects by length' }
        ]}
      ]},
      { id: 'lp-time', name: 'Time', contentStandards: [
        { id: 'lp-m-t1', code: 'B1.2.2.1', description: 'Tell time to the hour', indicators: [
          { id: 'lp-m-t1-i1', code: 'B1.2.2.1.1', description: 'Read analog clock to the hour' }
        ]},
        { id: 'lp-m-t2', code: 'B2.2.2.1', description: 'Tell time to half hour', indicators: [
          { id: 'lp-m-t2-i1', code: 'B2.2.2.1.1', description: 'Read time to 30 minutes' }
        ]}
      ]}
    ]},
    { id: 'lp-geometry', name: 'Geometry', subStrands: [
      { id: 'lp-shapes', name: 'Shapes', contentStandards: [
        { id: 'lp-m-sh1', code: 'B1.3.1.1', description: 'Identify 2D shapes', indicators: [
          { id: 'lp-m-sh1-i1', code: 'B1.3.1.1.1', description: 'Name circles, squares, triangles, rectangles' }
        ]},
        { id: 'lp-m-sh2', code: 'B2.3.1.1', description: 'Describe shape properties', indicators: [
          { id: 'lp-m-sh2-i1', code: 'B2.3.1.1.1', description: 'Count sides and corners' }
        ]}
      ]}
    ]}
  ]
};
