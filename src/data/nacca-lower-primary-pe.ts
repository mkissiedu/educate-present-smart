import { LowerPrimarySubjectCurriculum } from './nacca-lower-primary-types';

export const lowerPrimaryPECurriculum: LowerPrimarySubjectCurriculum = {
  subject: 'Physical Education',
  strands: [
    { id: 'lp-pe-motor', name: 'Motor Skills', subStrands: [
      { id: 'lp-pe-locomotor', name: 'Locomotor Skills', contentStandards: [
        { id: 'lp-pe-l1', code: 'B1.1.1.1', description: 'Perform basic locomotor movements', indicators: [
          { id: 'lp-pe-l1-i1', code: 'B1.1.1.1.1', description: 'Walk, run, hop, skip' },
          { id: 'lp-pe-l1-i2', code: 'B1.1.1.1.2', description: 'Jump with two feet' },
          { id: 'lp-pe-l1-i3', code: 'B1.1.1.1.3', description: 'Gallop and slide' }
        ]},
        { id: 'lp-pe-l2', code: 'B2.1.1.1', description: 'Combine locomotor movements', indicators: [
          { id: 'lp-pe-l2-i1', code: 'B2.1.1.1.1', description: 'Run and jump in sequence' },
          { id: 'lp-pe-l2-i2', code: 'B2.1.1.1.2', description: 'Skip with rhythm' }
        ]}
      ]},
      { id: 'lp-pe-manipulative', name: 'Manipulative Skills', contentStandards: [
        { id: 'lp-pe-m1', code: 'B1.1.2.1', description: 'Handle objects with control', indicators: [
          { id: 'lp-pe-m1-i1', code: 'B1.1.2.1.1', description: 'Throw underhand' },
          { id: 'lp-pe-m1-i2', code: 'B1.1.2.1.2', description: 'Catch with two hands' }
        ]},
        { id: 'lp-pe-m2', code: 'B2.1.2.1', description: 'Demonstrate ball skills', indicators: [
          { id: 'lp-pe-m2-i1', code: 'B2.1.2.1.1', description: 'Kick a stationary ball' },
          { id: 'lp-pe-m2-i2', code: 'B2.1.2.1.2', description: 'Bounce and catch' }
        ]}
      ]}
    ]},
    { id: 'lp-pe-fitness', name: 'Physical Fitness', subStrands: [
      { id: 'lp-pe-health', name: 'Health-Related Fitness', contentStandards: [
        { id: 'lp-pe-h1', code: 'B1.2.1.1', description: 'Engage in physical activities', indicators: [
          { id: 'lp-pe-h1-i1', code: 'B1.2.1.1.1', description: 'Participate in active play' }
        ]},
        { id: 'lp-pe-h2', code: 'B2.2.1.1', description: 'Develop endurance', indicators: [
          { id: 'lp-pe-h2-i1', code: 'B2.2.1.1.1', description: 'Sustain activity for 5 minutes' }
        ]}
      ]}
    ]},
    { id: 'lp-pe-games', name: 'Games and Sports', subStrands: [
      { id: 'lp-pe-traditional', name: 'Traditional Games', contentStandards: [
        { id: 'lp-pe-t1', code: 'B1.3.1.1', description: 'Play traditional games', indicators: [
          { id: 'lp-pe-t1-i1', code: 'B1.3.1.1.1', description: 'Play ampe and other local games' }
        ]},
        { id: 'lp-pe-t2', code: 'B2.3.1.1', description: 'Follow game rules', indicators: [
          { id: 'lp-pe-t2-i1', code: 'B2.3.1.1.1', description: 'Play cooperatively with others' }
        ]}
      ]}
    ]}
  ]
};
