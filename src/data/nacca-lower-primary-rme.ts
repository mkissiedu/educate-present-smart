import { LowerPrimarySubjectCurriculum } from './nacca-lower-primary-types';

export const lowerPrimaryRMECurriculum: LowerPrimarySubjectCurriculum = {
  subject: 'Religious & Moral Education',
  strands: [
    { id: 'lp-rme-god', name: 'God and His Creation', subStrands: [
      { id: 'lp-rme-creation', name: 'Creation', contentStandards: [
        { id: 'lp-rme-c1', code: 'B1.1.1.1', description: 'Know God as creator', indicators: [
          { id: 'lp-rme-c1-i1', code: 'B1.1.1.1.1', description: 'Identify things God created' },
          { id: 'lp-rme-c1-i2', code: 'B1.1.1.1.2', description: 'Thank God for creation' }
        ]},
        { id: 'lp-rme-c2', code: 'B2.1.1.1', description: 'Appreciate God\'s creation', indicators: [
          { id: 'lp-rme-c2-i1', code: 'B2.1.1.1.1', description: 'Care for God\'s creation' }
        ]}
      ]},
      { id: 'lp-rme-worship', name: 'Worship', contentStandards: [
        { id: 'lp-rme-w1', code: 'B1.1.2.1', description: 'Know ways of worshipping God', indicators: [
          { id: 'lp-rme-w1-i1', code: 'B1.1.2.1.1', description: 'Say simple prayers' }
        ]},
        { id: 'lp-rme-w2', code: 'B2.1.2.1', description: 'Practice worship', indicators: [
          { id: 'lp-rme-w2-i1', code: 'B2.1.2.1.1', description: 'Sing worship songs' }
        ]}
      ]}
    ]},
    { id: 'lp-rme-morals', name: 'Moral Teachings', subStrands: [
      { id: 'lp-rme-values', name: 'Values', contentStandards: [
        { id: 'lp-rme-v1', code: 'B1.2.1.1', description: 'Know moral values', indicators: [
          { id: 'lp-rme-v1-i1', code: 'B1.2.1.1.1', description: 'Show respect to elders' },
          { id: 'lp-rme-v1-i2', code: 'B1.2.1.1.2', description: 'Tell the truth' }
        ]},
        { id: 'lp-rme-v2', code: 'B2.2.1.1', description: 'Practice moral values', indicators: [
          { id: 'lp-rme-v2-i1', code: 'B2.2.1.1.1', description: 'Show kindness to others' }
        ]}
      ]},
      { id: 'lp-rme-behavior', name: 'Good Behavior', contentStandards: [
        { id: 'lp-rme-b1', code: 'B1.2.2.1', description: 'Demonstrate good behavior', indicators: [
          { id: 'lp-rme-b1-i1', code: 'B1.2.2.1.1', description: 'Obey parents and teachers' }
        ]},
        { id: 'lp-rme-b2', code: 'B2.2.2.1', description: 'Show responsibility', indicators: [
          { id: 'lp-rme-b2-i1', code: 'B2.2.2.1.1', description: 'Take care of belongings' }
        ]}
      ]}
    ]},
    { id: 'lp-rme-religious', name: 'Religious Practices', subStrands: [
      { id: 'lp-rme-festivals', name: 'Religious Festivals', contentStandards: [
        { id: 'lp-rme-f1', code: 'B1.3.1.1', description: 'Know religious festivals', indicators: [
          { id: 'lp-rme-f1-i1', code: 'B1.3.1.1.1', description: 'Name religious festivals' }
        ]},
        { id: 'lp-rme-f2', code: 'B2.3.1.1', description: 'Understand festival significance', indicators: [
          { id: 'lp-rme-f2-i1', code: 'B2.3.1.1.1', description: 'Explain why festivals are celebrated' }
        ]}
      ]}
    ]}
  ]
};
