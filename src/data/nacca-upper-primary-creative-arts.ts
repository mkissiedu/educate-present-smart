import { SubjectCurriculum } from './nacca-curriculum-types';

export const upperPrimaryCreativeArtsCurriculum: SubjectCurriculum = {
  subject: 'Creative Arts',
  strands: [
    { id: 'visual-arts', name: 'Visual Arts', subStrands: [
      { id: 'drawing', name: 'Drawing and Painting', contentStandards: [
        { id: 'up-ca-dp1', code: 'B3.1.1.1', description: 'Create drawings using various techniques', indicators: [
          { id: 'up-ca-dp1-i1', code: 'B3.1.1.1.1', description: 'Use shading techniques' },
          { id: 'up-ca-dp1-i2', code: 'B3.1.1.1.2', description: 'Apply color theory' }
        ]},
        { id: 'up-ca-dp2', code: 'B5.1.1.1', description: 'Create expressive artworks', indicators: [
          { id: 'up-ca-dp2-i1', code: 'B5.1.1.1.1', description: 'Use perspective in drawings' }
        ]}
      ]},
      { id: 'craft', name: 'Craft and Design', contentStandards: [
        { id: 'up-ca-cd1', code: 'B3.1.2.1', description: 'Create crafts using local materials', indicators: [
          { id: 'up-ca-cd1-i1', code: 'B3.1.2.1.1', description: 'Make traditional crafts' },
          { id: 'up-ca-cd1-i2', code: 'B3.1.2.1.2', description: 'Design functional objects' }
        ]},
        { id: 'up-ca-cd2', code: 'B5.1.2.1', description: 'Apply design principles', indicators: [
          { id: 'up-ca-cd2-i1', code: 'B5.1.2.1.1', description: 'Create balanced compositions' }
        ]}
      ]}
    ]},
    { id: 'performing', name: 'Performing Arts', subStrands: [
      { id: 'music', name: 'Music', contentStandards: [
        { id: 'up-ca-mu1', code: 'B3.2.1.1', description: 'Perform songs and rhythms', indicators: [
          { id: 'up-ca-mu1-i1', code: 'B3.2.1.1.1', description: 'Sing in harmony' },
          { id: 'up-ca-mu1-i2', code: 'B3.2.1.1.2', description: 'Play percussion instruments' }
        ]},
        { id: 'up-ca-mu2', code: 'B5.2.1.1', description: 'Compose simple melodies', indicators: [
          { id: 'up-ca-mu2-i1', code: 'B5.2.1.1.1', description: 'Create rhythmic patterns' }
        ]}
      ]},
      { id: 'dance', name: 'Dance and Movement', contentStandards: [
        { id: 'up-ca-da1', code: 'B3.2.2.1', description: 'Perform traditional dances', indicators: [
          { id: 'up-ca-da1-i1', code: 'B3.2.2.1.1', description: 'Execute dance movements' },
          { id: 'up-ca-da1-i2', code: 'B3.2.2.1.2', description: 'Perform cultural dances' }
        ]}
      ]},
      { id: 'drama', name: 'Drama', contentStandards: [
        { id: 'up-ca-dr1', code: 'B3.2.3.1', description: 'Perform dramatic pieces', indicators: [
          { id: 'up-ca-dr1-i1', code: 'B3.2.3.1.1', description: 'Act out stories' },
          { id: 'up-ca-dr1-i2', code: 'B3.2.3.1.2', description: 'Use voice and gesture' }
        ]},
        { id: 'up-ca-dr2', code: 'B5.2.3.1', description: 'Create and perform plays', indicators: [
          { id: 'up-ca-dr2-i1', code: 'B5.2.3.1.1', description: 'Write short scripts' }
        ]}
      ]}
    ]},
    { id: 'appreciation', name: 'Art Appreciation', subStrands: [
      { id: 'critique', name: 'Art Criticism', contentStandards: [
        { id: 'up-ca-ac1', code: 'B4.3.1.1', description: 'Appreciate and critique artworks', indicators: [
          { id: 'up-ca-ac1-i1', code: 'B4.3.1.1.1', description: 'Describe artworks' },
          { id: 'up-ca-ac1-i2', code: 'B4.3.1.1.2', description: 'Express opinions about art' }
        ]}
      ]}
    ]}
  ]
};
