import { SubjectCurriculum } from './nacca-curriculum-types';

export const jhsComputingCurriculum: SubjectCurriculum = {
  subject: 'Computing',
  strands: [
    { id: 'intro-comp', name: 'Introduction to Computing', subStrands: [
      { id: 'hardware', name: 'Computer Hardware', contentStandards: [
        { id: 'co-h1', code: 'B7.1.1.1', description: 'Understand computer components', indicators: [
          { id: 'co-h1-i1', code: 'B7.1.1.1.1', description: 'Identify input and output devices' },
          { id: 'co-h1-i2', code: 'B7.1.1.1.2', description: 'Describe CPU functions' }
        ]}
      ]},
      { id: 'software', name: 'Computer Software', contentStandards: [
        { id: 'co-s1', code: 'B7.1.2.1', description: 'Understand software types', indicators: [
          { id: 'co-s1-i1', code: 'B7.1.2.1.1', description: 'Distinguish system and application software' }
        ]}
      ]}
    ]},
    { id: 'productivity', name: 'Productivity Software', subStrands: [
      { id: 'word', name: 'Word Processing', contentStandards: [
        { id: 'co-w1', code: 'B7.2.1.1', description: 'Create and format documents', indicators: [
          { id: 'co-w1-i1', code: 'B7.2.1.1.1', description: 'Format text and paragraphs' },
          { id: 'co-w1-i2', code: 'B7.2.1.1.2', description: 'Insert tables and images' }
        ]}
      ]},
      { id: 'spreadsheet', name: 'Spreadsheets', contentStandards: [
        { id: 'co-sp1', code: 'B7.2.2.1', description: 'Use spreadsheet applications', indicators: [
          { id: 'co-sp1-i1', code: 'B7.2.2.1.1', description: 'Enter and format data' },
          { id: 'co-sp1-i2', code: 'B7.2.2.1.2', description: 'Use basic formulas' }
        ]}
      ]}
    ]},
    { id: 'programming', name: 'Programming', subStrands: [
      { id: 'basics', name: 'Programming Basics', contentStandards: [
        { id: 'co-p1', code: 'B7.3.1.1', description: 'Understand programming concepts', indicators: [
          { id: 'co-p1-i1', code: 'B7.3.1.1.1', description: 'Write simple algorithms' },
          { id: 'co-p1-i2', code: 'B7.3.1.1.2', description: 'Use variables and data types' }
        ]}
      ]}
    ]},
    { id: 'internet', name: 'Internet and Safety', subStrands: [
      { id: 'safety', name: 'Online Safety', contentStandards: [
        { id: 'co-i1', code: 'B7.4.1.1', description: 'Practice safe internet use', indicators: [
          { id: 'co-i1-i1', code: 'B7.4.1.1.1', description: 'Identify online threats' },
          { id: 'co-i1-i2', code: 'B7.4.1.1.2', description: 'Protect personal information' }
        ]}
      ]}
    ]}
  ]
};
