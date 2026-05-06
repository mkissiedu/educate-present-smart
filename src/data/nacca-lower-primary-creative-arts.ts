import { LowerPrimarySubjectCurriculum } from './nacca-lower-primary-types';

export const lowerPrimaryCreativeArtsCurriculum: LowerPrimarySubjectCurriculum = {
  subject: 'Creative Arts',
  strands: [
    { id: 'lp-ca-visual', name: 'Visual Arts', subStrands: [
      { id: 'lp-ca-drawing', name: 'Drawing and Painting', contentStandards: [
        { id: 'lp-ca-d1', code: 'B1.1.1.1', description: 'Create simple drawings', indicators: [
          { id: 'lp-ca-d1-i1', code: 'B1.1.1.1.1', description: 'Draw basic shapes and objects' },
          { id: 'lp-ca-d1-i2', code: 'B1.1.1.1.2', description: 'Use primary colors' },
          { id: 'lp-ca-d1-i3', code: 'B1.1.1.1.3', description: 'Draw self-portraits' }
        ]},
        { id: 'lp-ca-d2', code: 'B2.1.1.1', description: 'Create detailed drawings', indicators: [
          { id: 'lp-ca-d2-i1', code: 'B2.1.1.1.1', description: 'Mix colors to create new ones' },
          { id: 'lp-ca-d2-i2', code: 'B2.1.1.1.2', description: 'Draw scenes from stories' }
        ]}
      ]},
      { id: 'lp-ca-craft', name: 'Craft and Design', contentStandards: [
        { id: 'lp-ca-c1', code: 'B1.1.2.1', description: 'Create simple crafts', indicators: [
          { id: 'lp-ca-c1-i1', code: 'B1.1.2.1.1', description: 'Fold paper to make shapes' },
          { id: 'lp-ca-c1-i2', code: 'B1.1.2.1.2', description: 'Create collages' }
        ]},
        { id: 'lp-ca-c2', code: 'B2.1.2.1', description: 'Design and construct', indicators: [
          { id: 'lp-ca-c2-i1', code: 'B2.1.2.1.1', description: 'Create 3D models' }
        ]}
      ]}
    ]},
    { id: 'lp-ca-music', name: 'Performing Arts - Music', subStrands: [
      { id: 'lp-ca-singing', name: 'Singing', contentStandards: [
        { id: 'lp-ca-s1', code: 'B1.2.1.1', description: 'Sing simple songs', indicators: [
          { id: 'lp-ca-s1-i1', code: 'B1.2.1.1.1', description: 'Sing nursery rhymes' },
          { id: 'lp-ca-s1-i2', code: 'B1.2.1.1.2', description: 'Sing action songs' }
        ]},
        { id: 'lp-ca-s2', code: 'B2.2.1.1', description: 'Sing with expression', indicators: [
          { id: 'lp-ca-s2-i1', code: 'B2.2.1.1.1', description: 'Sing in groups' }
        ]}
      ]},
      { id: 'lp-ca-rhythm', name: 'Rhythm and Movement', contentStandards: [
        { id: 'lp-ca-r1', code: 'B1.2.2.1', description: 'Respond to rhythm', indicators: [
          { id: 'lp-ca-r1-i1', code: 'B1.2.2.1.1', description: 'Clap to rhythmic patterns' }
        ]}
      ]}
    ]},
    { id: 'lp-ca-drama', name: 'Performing Arts - Drama', subStrands: [
      { id: 'lp-ca-roleplay', name: 'Role Play', contentStandards: [
        { id: 'lp-ca-rp1', code: 'B1.3.1.1', description: 'Participate in role play', indicators: [
          { id: 'lp-ca-rp1-i1', code: 'B1.3.1.1.1', description: 'Act out simple stories' }
        ]},
        { id: 'lp-ca-rp2', code: 'B2.3.1.1', description: 'Create dramatic scenes', indicators: [
          { id: 'lp-ca-rp2-i1', code: 'B2.3.1.1.1', description: 'Perform short skits' }
        ]}
      ]}
    ]}
  ]
};
