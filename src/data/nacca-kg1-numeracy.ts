import { KGSubjectCurriculum } from './nacca-kg-curriculum-types';

export const kg1Numeracy: KGSubjectCurriculum = {
  subject: 'Numeracy',
  level: 'KG1',
  strands: [
    {
      id: 'kg1-num-number',
      name: 'Number',
      subStrands: [
        {
          id: 'kg1-num-counting',
          name: 'Counting',
          contentStandards: [
            {
              id: 'kg1-num-c1',
              code: 'KG1.1.1.1',
              description: 'Count whole numbers up to 20',
              indicators: [
                { id: 'kg1-num-c1-i1', code: 'KG1.1.1.1.1', description: 'Rote count from 1 to 20' },
                { id: 'kg1-num-c1-i2', code: 'KG1.1.1.1.2', description: 'Count objects up to 10' },
                { id: 'kg1-num-c1-i3', code: 'KG1.1.1.1.3', description: 'Match number names to numerals 1-10' },
                { id: 'kg1-num-c1-i4', code: 'KG1.1.1.1.4', description: 'Identify "more" and "less"' }
              ]
            }
          ]
        },
        {
          id: 'kg1-num-numeral',
          name: 'Numeral Recognition',
          contentStandards: [
            {
              id: 'kg1-num-n1',
              code: 'KG1.1.2.1',
              description: 'Recognize and write numerals 0-10',
              indicators: [
                { id: 'kg1-num-n1-i1', code: 'KG1.1.2.1.1', description: 'Identify numerals 0-10' },
                { id: 'kg1-num-n1-i2', code: 'KG1.1.2.1.2', description: 'Trace and write numerals 0-5' },
                { id: 'kg1-num-n1-i3', code: 'KG1.1.2.1.3', description: 'Match numerals to quantities' }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'kg1-num-geometry',
      name: 'Geometry',
      subStrands: [
        {
          id: 'kg1-num-shapes',
          name: 'Shapes',
          contentStandards: [
            {
              id: 'kg1-num-sh1',
              code: 'KG1.3.1.1',
              description: 'Identify and describe basic 2D shapes',
              indicators: [
                { id: 'kg1-num-sh1-i1', code: 'KG1.3.1.1.1', description: 'Identify circle, square, triangle' },
                { id: 'kg1-num-sh1-i2', code: 'KG1.3.1.1.2', description: 'Sort objects by shape' },
                { id: 'kg1-num-sh1-i3', code: 'KG1.3.1.1.3', description: 'Find shapes in the environment' }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'kg1-num-patterns',
      name: 'Patterns',
      subStrands: [
        {
          id: 'kg1-num-pat',
          name: 'Pattern Recognition',
          contentStandards: [
            {
              id: 'kg1-num-pat1',
              code: 'KG1.4.1.1',
              description: 'Recognize and create simple patterns',
              indicators: [
                { id: 'kg1-num-pat1-i1', code: 'KG1.4.1.1.1', description: 'Identify AB patterns' },
                { id: 'kg1-num-pat1-i2', code: 'KG1.4.1.1.2', description: 'Continue simple patterns' },
                { id: 'kg1-num-pat1-i3', code: 'KG1.4.1.1.3', description: 'Create own AB patterns' }
              ]
            }
          ]
        }
      ]
    }
  ]
};
