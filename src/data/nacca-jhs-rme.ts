import { SubjectCurriculum } from './nacca-curriculum-types';

export const jhsRMECurriculum: SubjectCurriculum = {
  subject: 'Religious & Moral Education',
  strands: [
    { id: 'god-creation', name: 'God and His Creation', subStrands: [
      { id: 'nature-god', name: 'Nature of God', contentStandards: [
        { id: 'rm-g1', code: 'B7.1.1.1', description: 'Understand attributes of God', indicators: [
          { id: 'rm-g1-i1', code: 'B7.1.1.1.1', description: 'Describe attributes of God' },
          { id: 'rm-g1-i2', code: 'B7.1.1.1.2', description: 'Explain God\'s role in creation' }
        ]}
      ]},
      { id: 'creation', name: 'Creation Stories', contentStandards: [
        { id: 'rm-c1', code: 'B7.1.2.1', description: 'Know creation accounts', indicators: [
          { id: 'rm-c1-i1', code: 'B7.1.2.1.1', description: 'Narrate religious creation stories' }
        ]}
      ]}
    ]},
    { id: 'morality', name: 'Moral Teachings', subStrands: [
      { id: 'values', name: 'Moral Values', contentStandards: [
        { id: 'rm-v1', code: 'B7.2.1.1', description: 'Understand moral values', indicators: [
          { id: 'rm-v1-i1', code: 'B7.2.1.1.1', description: 'Explain honesty and integrity' },
          { id: 'rm-v1-i2', code: 'B7.2.1.1.2', description: 'Demonstrate respect for others' }
        ]}
      ]},
      { id: 'ethics', name: 'Ethical Behavior', contentStandards: [
        { id: 'rm-e1', code: 'B7.2.2.1', description: 'Practice ethical behavior', indicators: [
          { id: 'rm-e1-i1', code: 'B7.2.2.1.1', description: 'Make responsible decisions' }
        ]}
      ]}
    ]},
    { id: 'religious-practices', name: 'Religious Practices', subStrands: [
      { id: 'worship', name: 'Worship and Prayer', contentStandards: [
        { id: 'rm-w1', code: 'B7.3.1.1', description: 'Understand forms of worship', indicators: [
          { id: 'rm-w1-i1', code: 'B7.3.1.1.1', description: 'Describe prayer practices' },
          { id: 'rm-w1-i2', code: 'B7.3.1.1.2', description: 'Explain religious festivals' }
        ]}
      ]}
    ]},
    { id: 'family-community', name: 'Family and Community', subStrands: [
      { id: 'relationships', name: 'Relationships', contentStandards: [
        { id: 'rm-f1', code: 'B7.4.1.1', description: 'Build healthy relationships', indicators: [
          { id: 'rm-f1-i1', code: 'B7.4.1.1.1', description: 'Show respect for elders' },
          { id: 'rm-f1-i2', code: 'B7.4.1.1.2', description: 'Contribute to community welfare' }
        ]}
      ]}
    ]}
  ]
};
