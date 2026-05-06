import { SubjectCurriculum } from './nacca-curriculum-types';

export const numeracyCurriculum: SubjectCurriculum = {
  subject: 'Numeracy',
  strands: [
    {
      id: 'number',
      name: 'Number',
      subStrands: [
        {
          id: 'counting',
          name: 'Counting',
          contentStandards: [
            {
              id: 'n-c1',
              code: 'B1.1.1.1',
              description: 'Count whole numbers up to 100',
              indicators: [
                { id: 'n-c1-i1', code: 'B1.1.1.1.1', description: 'Count objects up to 100' },
                { id: 'n-c1-i2', code: 'B1.1.1.1.2', description: 'Count forwards and backwards' },
                { id: 'n-c1-i3', code: 'B1.1.1.1.3', description: 'Skip count by 2s, 5s, 10s' }
              ]
            }
          ]
        },
        {
          id: 'place-value',
          name: 'Place Value',
          contentStandards: [
            {
              id: 'n-pv1',
              code: 'B1.1.2.1',
              description: 'Understand place value of two-digit numbers',
              indicators: [
                { id: 'n-pv1-i1', code: 'B1.1.2.1.1', description: 'Identify tens and ones' },
                { id: 'n-pv1-i2', code: 'B1.1.2.1.2', description: 'Compare two-digit numbers' }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'algebra',
      name: 'Algebra',
      subStrands: [
        {
          id: 'patterns',
          name: 'Patterns',
          contentStandards: [
            {
              id: 'a-p1',
              code: 'B1.2.1.1',
              description: 'Recognize and extend patterns',
              indicators: [
                { id: 'a-p1-i1', code: 'B1.2.1.1.1', description: 'Identify repeating patterns' },
                { id: 'a-p1-i2', code: 'B1.2.1.1.2', description: 'Create simple patterns' }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'geometry',
      name: 'Geometry and Measurement',
      subStrands: [
        {
          id: 'shapes',
          name: 'Shapes and Space',
          contentStandards: [
            {
              id: 'g-s1',
              code: 'B1.3.1.1',
              description: 'Identify and describe 2D shapes',
              indicators: [
                { id: 'g-s1-i1', code: 'B1.3.1.1.1', description: 'Name basic 2D shapes' },
                { id: 'g-s1-i2', code: 'B1.3.1.1.2', description: 'Describe shape properties' }
              ]
            }
          ]
        },
        {
          id: 'measurement',
          name: 'Measurement',
          contentStandards: [
            {
              id: 'g-m1',
              code: 'B1.3.2.1',
              description: 'Measure using non-standard units',
              indicators: [
                { id: 'g-m1-i1', code: 'B1.3.2.1.1', description: 'Compare lengths' },
                { id: 'g-m1-i2', code: 'B1.3.2.1.2', description: 'Measure with objects' }
              ]
            }
          ]
        }
      ]
    }
  ]
};
