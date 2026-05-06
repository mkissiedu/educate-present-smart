import { SubjectCurriculum } from './nacca-curriculum-types';

export const upperPrimaryRmeCurriculum: SubjectCurriculum = {
  subject: 'Religious & Moral Education',
  strands: [
    { id: 'god', name: 'God and His Creation', subStrands: [
      { id: 'nature', name: 'Nature of God', contentStandards: [
        { id: 'up-rm-ng1', code: 'B3.1.1.1', description: 'Understand the nature of God', indicators: [
          { id: 'up-rm-ng1-i1', code: 'B3.1.1.1.1', description: 'Describe attributes of God' },
          { id: 'up-rm-ng1-i2', code: 'B3.1.1.1.2', description: 'Explain God as Creator' }
        ]},
        { id: 'up-rm-ng2', code: 'B5.1.1.1', description: 'Appreciate God in different religions', indicators: [
          { id: 'up-rm-ng2-i1', code: 'B5.1.1.1.1', description: 'Compare religious beliefs about God' }
        ]}
      ]},
      { id: 'creation', name: 'Creation', contentStandards: [
        { id: 'up-rm-cr1', code: 'B3.1.2.1', description: 'Understand creation stories', indicators: [
          { id: 'up-rm-cr1-i1', code: 'B3.1.2.1.1', description: 'Retell creation stories' },
          { id: 'up-rm-cr1-i2', code: 'B3.1.2.1.2', description: 'Care for creation' }
        ]}
      ]}
    ]},
    { id: 'morality', name: 'Moral Teachings', subStrands: [
      { id: 'values', name: 'Moral Values', contentStandards: [
        { id: 'up-rm-mv1', code: 'B3.2.1.1', description: 'Practice moral values', indicators: [
          { id: 'up-rm-mv1-i1', code: 'B3.2.1.1.1', description: 'Demonstrate honesty' },
          { id: 'up-rm-mv1-i2', code: 'B3.2.1.1.2', description: 'Show respect for others' }
        ]},
        { id: 'up-rm-mv2', code: 'B5.2.1.1', description: 'Apply moral reasoning', indicators: [
          { id: 'up-rm-mv2-i1', code: 'B5.2.1.1.1', description: 'Make ethical decisions' }
        ]}
      ]},
      { id: 'behavior', name: 'Responsible Behavior', contentStandards: [
        { id: 'up-rm-rb1', code: 'B3.2.2.1', description: 'Exhibit responsible behavior', indicators: [
          { id: 'up-rm-rb1-i1', code: 'B3.2.2.1.1', description: 'Take responsibility for actions' },
          { id: 'up-rm-rb1-i2', code: 'B3.2.2.1.2', description: 'Help others in need' }
        ]}
      ]}
    ]},
    { id: 'practices', name: 'Religious Practices', subStrands: [
      { id: 'worship', name: 'Worship', contentStandards: [
        { id: 'up-rm-wo1', code: 'B3.3.1.1', description: 'Understand forms of worship', indicators: [
          { id: 'up-rm-wo1-i1', code: 'B3.3.1.1.1', description: 'Identify worship practices' },
          { id: 'up-rm-wo1-i2', code: 'B3.3.1.1.2', description: 'Participate in worship' }
        ]}
      ]},
      { id: 'festivals', name: 'Religious Festivals', contentStandards: [
        { id: 'up-rm-rf1', code: 'B4.3.2.1', description: 'Know religious festivals', indicators: [
          { id: 'up-rm-rf1-i1', code: 'B4.3.2.1.1', description: 'Describe major festivals' },
          { id: 'up-rm-rf1-i2', code: 'B4.3.2.1.2', description: 'Explain festival significance' }
        ]}
      ]}
    ]},
    { id: 'family', name: 'Family and Community', subStrands: [
      { id: 'relationships', name: 'Relationships', contentStandards: [
        { id: 'up-rm-re1', code: 'B3.4.1.1', description: 'Build healthy relationships', indicators: [
          { id: 'up-rm-re1-i1', code: 'B3.4.1.1.1', description: 'Respect family members' },
          { id: 'up-rm-re1-i2', code: 'B3.4.1.1.2', description: 'Show love to neighbors' }
        ]},
        { id: 'up-rm-re2', code: 'B5.4.1.1', description: 'Contribute to community', indicators: [
          { id: 'up-rm-re2-i1', code: 'B5.4.1.1.1', description: 'Participate in community service' }
        ]}
      ]}
    ]}
  ]
};
