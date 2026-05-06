import { KGSubjectCurriculum } from './nacca-kg-curriculum-types';

export const kg2Numeracy: KGSubjectCurriculum = {
  subject: 'Numeracy',
  level: 'KG2',
  strands: [
    {
      id: 'kg2-num-number',
      name: 'Number',
      subStrands: [
        {
          id: 'kg2-num-counting',
          name: 'Counting',
          contentStandards: [
            {
              id: 'kg2-num-c1',
              code: 'KG2.1.1.1',
              description: 'Count whole numbers up to 50',
              indicators: [
                { id: 'kg2-num-c1-i1', code: 'KG2.1.1.1.1', description: 'Rote count from 1 to 50' },
                { id: 'kg2-num-c1-i2', code: 'KG2.1.1.1.2', description: 'Count objects up to 20' },
                { id: 'kg2-num-c1-i3', code: 'KG2.1.1.1.3', description: 'Count backwards from 20' },
                { id: 'kg2-num-c1-i4', code: 'KG2.1.1.1.4', description: 'Skip count by 2s to 20' }
              ]
            }
          ]
        },
        {
          id: 'kg2-num-operations',
          name: 'Basic Operations',
          contentStandards: [
            {
              id: 'kg2-num-op1',
              code: 'KG2.1.2.1',
              description: 'Perform simple addition and subtraction',
              indicators: [
                { id: 'kg2-num-op1-i1', code: 'KG2.1.2.1.1', description: 'Add numbers up to 10' },
                { id: 'kg2-num-op1-i2', code: 'KG2.1.2.1.2', description: 'Subtract numbers up to 10' },
                { id: 'kg2-num-op1-i3', code: 'KG2.1.2.1.3', description: 'Solve simple word problems' }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'kg2-num-geometry',
      name: 'Geometry',
      subStrands: [
        {
          id: 'kg2-num-shapes',
          name: 'Shapes and Space',
          contentStandards: [
            {
              id: 'kg2-num-sh1',
              code: 'KG2.3.1.1',
              description: 'Identify and describe 2D and 3D shapes',
              indicators: [
                { id: 'kg2-num-sh1-i1', code: 'KG2.3.1.1.1', description: 'Identify rectangle and oval' },
                { id: 'kg2-num-sh1-i2', code: 'KG2.3.1.1.2', description: 'Identify cube, sphere, cylinder' },
                { id: 'kg2-num-sh1-i3', code: 'KG2.3.1.1.3', description: 'Describe shape properties' }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'kg2-num-measurement',
      name: 'Measurement',
      subStrands: [
        {
          id: 'kg2-num-meas',
          name: 'Length and Weight',
          contentStandards: [
            {
              id: 'kg2-num-m1',
              code: 'KG2.4.1.1',
              description: 'Compare and measure using non-standard units',
              indicators: [
                { id: 'kg2-num-m1-i1', code: 'KG2.4.1.1.1', description: 'Compare lengths (longer/shorter)' },
                { id: 'kg2-num-m1-i2', code: 'KG2.4.1.1.2', description: 'Compare weights (heavier/lighter)' },
                { id: 'kg2-num-m1-i3', code: 'KG2.4.1.1.3', description: 'Measure using body parts' }
              ]
            }
          ]
        }
      ]
    }
  ]
};
