import { SubjectCurriculum } from './nacca-curriculum-types';

export const upperPrimaryComputingCurriculum: SubjectCurriculum = {
  subject: 'Computing',
  strands: [
    { id: 'intro-tech', name: 'Introduction to Technology', subStrands: [
      { id: 'hardware', name: 'Computer Hardware', contentStandards: [
        { id: 'up-cp-hw1', code: 'B3.1.1.1', description: 'Identify computer components', indicators: [
          { id: 'up-cp-hw1-i1', code: 'B3.1.1.1.1', description: 'Name input devices' },
          { id: 'up-cp-hw1-i2', code: 'B3.1.1.1.2', description: 'Name output devices' }
        ]},
        { id: 'up-cp-hw2', code: 'B5.1.1.1', description: 'Understand hardware functions', indicators: [
          { id: 'up-cp-hw2-i1', code: 'B5.1.1.1.1', description: 'Explain CPU functions' }
        ]}
      ]},
      { id: 'software', name: 'Computer Software', contentStandards: [
        { id: 'up-cp-sw1', code: 'B3.1.2.1', description: 'Understand software types', indicators: [
          { id: 'up-cp-sw1-i1', code: 'B3.1.2.1.1', description: 'Identify system software' },
          { id: 'up-cp-sw1-i2', code: 'B3.1.2.1.2', description: 'Identify application software' }
        ]}
      ]}
    ]},
    { id: 'productivity', name: 'Productivity Tools', subStrands: [
      { id: 'word', name: 'Word Processing', contentStandards: [
        { id: 'up-cp-wp1', code: 'B3.2.1.1', description: 'Use word processing software', indicators: [
          { id: 'up-cp-wp1-i1', code: 'B3.2.1.1.1', description: 'Type and format text' },
          { id: 'up-cp-wp1-i2', code: 'B3.2.1.1.2', description: 'Save and print documents' }
        ]},
        { id: 'up-cp-wp2', code: 'B5.2.1.1', description: 'Create formatted documents', indicators: [
          { id: 'up-cp-wp2-i1', code: 'B5.2.1.1.1', description: 'Insert images and tables' }
        ]}
      ]},
      { id: 'spreadsheet', name: 'Spreadsheets', contentStandards: [
        { id: 'up-cp-ss1', code: 'B4.2.2.1', description: 'Use spreadsheet software', indicators: [
          { id: 'up-cp-ss1-i1', code: 'B4.2.2.1.1', description: 'Enter data in cells' },
          { id: 'up-cp-ss1-i2', code: 'B4.2.2.1.2', description: 'Perform basic calculations' }
        ]}
      ]},
      { id: 'presentation', name: 'Presentations', contentStandards: [
        { id: 'up-cp-pr1', code: 'B5.2.3.1', description: 'Create presentations', indicators: [
          { id: 'up-cp-pr1-i1', code: 'B5.2.3.1.1', description: 'Design slides' },
          { id: 'up-cp-pr1-i2', code: 'B5.2.3.1.2', description: 'Add transitions and animations' }
        ]}
      ]}
    ]},
    { id: 'programming', name: 'Programming', subStrands: [
      { id: 'intro-prog', name: 'Introduction to Programming', contentStandards: [
        { id: 'up-cp-ip1', code: 'B4.3.1.1', description: 'Understand programming concepts', indicators: [
          { id: 'up-cp-ip1-i1', code: 'B4.3.1.1.1', description: 'Use block-based programming' },
          { id: 'up-cp-ip1-i2', code: 'B4.3.1.1.2', description: 'Create simple algorithms' }
        ]},
        { id: 'up-cp-ip2', code: 'B6.3.1.1', description: 'Write simple programs', indicators: [
          { id: 'up-cp-ip2-i1', code: 'B6.3.1.1.1', description: 'Use loops and conditions' }
        ]}
      ]}
    ]},
    { id: 'safety', name: 'Digital Citizenship', subStrands: [
      { id: 'internet', name: 'Internet Safety', contentStandards: [
        { id: 'up-cp-is1', code: 'B3.4.1.1', description: 'Practice safe internet use', indicators: [
          { id: 'up-cp-is1-i1', code: 'B3.4.1.1.1', description: 'Identify online risks' },
          { id: 'up-cp-is1-i2', code: 'B3.4.1.1.2', description: 'Protect personal information' }
        ]}
      ]}
    ]}
  ]
};
