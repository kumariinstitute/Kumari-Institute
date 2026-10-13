import { Program, StatItem, WhyChooseItem, Testimonial, ResultHighlight, TopperStudent } from '../types';

export const instituteInfo = {
  name: 'Kumari Institute',
  tagline: 'in Indira Nagar',
  logoUrl: '/Logo/kumarilogo.png',
  slogan: 'From Basics to Brilliance We Guide Every Step!',
  leadParagraph: 'Trusted by parents. Loved by students. Building strong concepts, confidence, and character from Class 1 to competitive success in Indira Nagar, Rayagada.',
  email: 'info@kumariinstitute.in',
  phone: '+91 94372 81920',
  phoneClean: '+919437281920',
  whatsappNumber: '919437281920',
  hours: 'Mon - Sat: 7:00 AM - 8:00 PM',
  address: 'Indira Nagar, Rayagada, Odisha',
};

export const heroBadges = [
  { id: 'faculty', label: 'Expert Faculty', icon: 'GraduationCap' },
  { id: 'attention', label: 'Personalized Attention', icon: 'UserCheck' },
  { id: 'results', label: 'Proven Results', icon: 'TrendingUp' },
  { id: 'safety', label: 'Safe & Supportive Environment', icon: 'ShieldCheck' },
];

export const programsData: Program[] = [
  {
    id: 'home-tutors',
    title: 'Home Tutors',
    subtitle: '1st to 5th Standard',
    cardPill: '1st to 5th Standard',
    tag: 'Primary Foundation',
    iconName: 'Home',
    image: '/Logo/HomeTutors.png',
    features: [
      'Personalized 1-on-1 home tuition',
      'Experienced and caring verified tutors',
      'All school subjects covered (Math, English, EVS, Hindi)',
      'Homework, project & daily study support',
      'Regular activity-based learning sessions',
      'Weekly progress tracking for parents',
    ],
    themeColor: 'amber',
    btnColor: 'bg-[#f59e0b] hover:bg-[#d97706] text-white',
    badgeColor: 'bg-[#fef3c7] text-[#92400e] border-[#fde68a]',
    bgGradient: 'from-amber-50/80 to-orange-50/40',
    description:
      'Personalized home tuition for 1st to 5th standard students with experienced and caring tutors. Focused on conceptual understanding, joyful learning, and building solid study habits from the foundation years.',
    curriculum: [
      'Foundational Math & Mental Arithmetic',
      'Reading Comprehension, Phonics & Vocabulary',
      'General Science & Environmental Studies (EVS)',
      'Neat Handwriting & Creative Expression',
      'Daily School Homework & Periodic Exam Guidance',
    ],
    timingOptions: ['4:00 PM - 5:30 PM', '5:30 PM - 7:00 PM', 'Flexible Weekend Batches'],
    feeEstimate: 'Starting ₹3,500 / month',
  },
  {
    id: 'navodaya-entrance',
    title: 'Navodaya & Adarsh Vidhyalay Entrance Exam',
    subtitle: 'Online Preparation',
    cardPill: 'Online Preparation',
    tag: 'Competitive Entrance Exam',
    iconName: 'BookOpen',
    image: '/Logo/Online.png',
    features: [
      'Special coaching for Navodaya & Adarsh Vidhyalay',
      'Expert exam guidance & shortcut techniques',
      'Complete chapter-wise study plan & notes',
      'Weekly mock tests & previous years papers (PYQs)',
      'Mental Ability, Arithmetic & Language mastery',
      'In-depth performance analytics & doubt sessions',
    ],
    themeColor: 'blue',
    btnColor: 'bg-[#0284c7] hover:bg-[#0369a1] text-white',
    badgeColor: 'bg-[#e0f2fe] text-[#0369a1] border-[#bae6fd]',
    bgGradient: 'from-sky-50/80 to-blue-50/40',
    description:
      'Special coaching for Navodaya and Adarsh Vidhyalay entrance exams with expert guidance, mock tests and complete study plan. Designed to help students crack competitive entrance tests with top ranks.',
    curriculum: [
      'Mental Ability Test (Figure Series, Analogies, Pattern Completion)',
      'Arithmetic Section (Fractions, Percentages, Decimals, Speed Math)',
      'Language Comprehension & Reading Passages',
      'Speed & Accuracy Drills with OMR Practice',
      'All-India Level Mock Test Series',
    ],
    timingOptions: ['5:00 PM - 6:30 PM', '6:30 PM - 8:00 PM', 'Sunday Special Mock Drills'],
    feeEstimate: 'Starting ₹4,000 / month',
  },
  {
    id: 'offline-classes',
    title: 'Offline Classes',
    subtitle: '6th to 12th Standard',
    cardPill: '6th to 12th Standard',
    tag: 'Secondary & Senior Secondary',
    iconName: 'Users',
    image: '/Logo/offline.png',
    features: [
      'Comprehensive offline coaching for 6th to 12th standard',
      'Dedicated middle school foundation (6th to 10th Maths & Science)',
      '11th & 12th Board excellence: Science (PCM/PCB) & Commerce streams',
      'Small interactive batches (12-15 students) with individual attention',
      'Chapter-wise tests, NCERT Exemplar & past 10-year board paper solutions',
      'Dedicated doubt clearing counters and regular parent-teacher reviews',
    ],
    themeColor: 'emerald',
    btnColor: 'bg-[#059669] hover:bg-[#047857] text-white',
    badgeColor: 'bg-[#dcfce7] text-[#15803d] border-[#bbf7d0]',
    bgGradient: 'from-emerald-50/80 to-teal-50/40',
    description:
      'Regular offline classes for 6th to 12th standard students with focused learning and concept clarity. We bridge textbook theory with analytical problem-solving skills needed for school and board examinations.',
    curriculum: [
      '6th - 10th: Foundation Maths, Science, Social Studies & English',
      '11th - 12th Science: Physics, Chemistry, Mathematics & Biology',
      '11th - 12th Commerce: Accountancy, Business Studies & Economics',
      'NCERT problem solving & board exam pattern answer writing drills',
      'Full-length Pre-Board Simulators with step-by-step marking evaluation',
    ],
    timingOptions: ['3:30 PM - 5:30 PM', '5:30 PM - 7:30 PM', 'Morning & Weekend Batches'],
    feeEstimate: 'Starting ₹4,500 / month',
  },
  {
    id: 'offline-classes-middle',
    title: 'Offline Classes',
    subtitle: '6th to 10th Standard',
    cardPill: '6th to 10th Standard',
    tag: 'Secondary Foundation & Boards',
    iconName: 'Users',
    image: '/Logo/offline.png',
    features: [
      'Regular offline classes for 6th to 10th standard',
      'Focused classroom learning & concept clarity',
      'Maths, Science, Social Studies & English',
      'Small interactive batches (12-15 students)',
      'Chapter-wise tests & NCERT problem solving',
      'Board exam pattern preparation & answer writing skills',
    ],
    themeColor: 'emerald',
    btnColor: 'bg-[#10b981] hover:bg-[#059669] text-white',
    badgeColor: 'bg-[#dcfce7] text-[#15803d] border-[#bbf7d0]',
    bgGradient: 'from-emerald-50/80 to-teal-50/40',
    description:
      'Regular offline classes for 6th to 10th standard students with focused learning and concept clarity. We bridge textbook theory with analytical problem-solving skills needed for school and board examinations.',
    curriculum: [
      'Science: Physics, Chemistry & Biology with practical experiments',
      'Mathematics: Concept clarity, NCERT Exemplar & RD Sharma solving',
      'Social Science: History, Civics, Geography & Map work',
      'English & Second Language Grammar & Writing',
      'Pre-Board Mock Test Series with detailed examiner feedback',
    ],
    timingOptions: ['3:30 PM - 5:30 PM', '5:30 PM - 7:30 PM', 'Weekend Doubts & Revision'],
    feeEstimate: 'Starting ₹4,500 / month',
  },
  {
    id: 'offline-classes-senior',
    title: 'Offline Classes',
    subtitle: '11th to 12th Standard',
    cardPill: '11th to 12th Standard',
    tag: 'Senior Secondary Board Excellence',
    iconName: 'GraduationCap',
    image: '/Logo/offline.png',
    features: [
      'Board exam preparation for 11th & 12th standard',
      'Experienced faculty & result-oriented teaching',
      'Science (PCM / PCB) & Commerce streams',
      'Previous 10 years board paper solutions',
      'Strict syllabus completion with ample revision',
      'Individual attention & dedicated doubt clearing counters',
    ],
    themeColor: 'purple',
    btnColor: 'bg-[#8b5cf6] hover:bg-[#7c3aed] text-white',
    badgeColor: 'bg-[#f3e8ff] text-[#6b21a8] border-[#e9d5ff]',
    bgGradient: 'from-purple-50/80 to-indigo-50/40',
    description:
      'Board exam preparation for 11th and 12th standard with experienced faculty and result-oriented teaching. Specialized streams in Science and Commerce with targeted coaching for 95%+ board scores.',
    curriculum: [
      'Physics: Mechanics, Optics, Electromagnetism & Modern Physics',
      'Chemistry: Organic Chemistry mechanisms, Physical calculations & Inorganic',
      'Mathematics: Calculus, Vectors, 3D Geometry & Probability',
      'Biology / Commerce: Accountancy, Business Studies & Economics',
      'Full-length Pre-Board Simulators with step-by-step marking schemes',
    ],
    timingOptions: ['4:00 PM - 6:30 PM', '6:30 PM - 9:00 PM', 'Morning Revision Sessions'],
    feeEstimate: 'Starting ₹5,500 / month',
  },
];

export const statsData: StatItem[] = [
  { id: '1', value: '500+', label: 'Happy Students', icon: 'Smile' },
  { id: '2', value: '50+', label: 'Expert Faculty', icon: 'Users' },
  { id: '3', value: '95%', label: 'Success Rate', icon: 'ShieldCheck' },
  { id: '4', value: '10+', label: 'Years of Excellence', icon: 'Award' },
];

export const whyChooseData: WhyChooseItem[] = [
  {
    id: 'faculty',
    title: 'Experienced & Verified Faculty',
    description: 'Well qualified, trained and passionate educators.',
    icon: 'GraduationCap',
    colorClass: 'text-emerald-600',
    bgClass: 'bg-emerald-100 border-emerald-200',
  },
  {
    id: 'batch',
    title: 'Small Batch Sizes',
    description: 'Ensuring individual attention and better learning.',
    icon: 'Users2',
    colorClass: 'text-purple-600',
    bgClass: 'bg-purple-100 border-purple-200',
  },
  {
    id: 'assessment',
    title: 'Regular Assessment',
    description: 'Tests, quizzes & assignments for continuous improvement.',
    icon: 'FileSpreadsheet',
    colorClass: 'text-blue-600',
    bgClass: 'bg-blue-100 border-blue-200',
  },
  {
    id: 'updates',
    title: 'Parent Updates',
    description: 'Regular progress reports and parent-teacher meetings.',
    icon: 'FileText',
    colorClass: 'text-rose-600',
    bgClass: 'bg-rose-100 border-rose-200',
  },
  {
    id: 'environment',
    title: 'Safe & Friendly Environment',
    description: 'A positive and motivating atmosphere for all.',
    icon: 'ShieldCheck',
    colorClass: 'text-teal-600',
    bgClass: 'bg-teal-100 border-teal-200',
  },
];

export const resultHighlights: ResultHighlight[] = [
  { id: '10th', percentageOrCount: '98%', label: 'Class 10th Results', accentColor: 'text-amber-600' },
  { id: '12th', percentageOrCount: '96%', label: 'Class 12th Results', accentColor: 'text-amber-500' },
  { id: 'jee', percentageOrCount: '120+', label: 'JEE Qualifiers', accentColor: 'text-yellow-600' },
];

export const testimonialsData: Testimonial[] = [];

export const toppersList: TopperStudent[] = [];


export const commitmentPillars = [
  {
    title: 'Concept Clarity',
    description: 'Strong foundation for lifelong learning',
    icon: 'Lightbulb',
  },
  {
    title: 'Confidence Building',
    description: 'Encouraging students to dream and achieve',
    icon: 'Sparkles',
  },
  {
    title: 'Future Ready',
    description: 'Preparing for boards, competitive exams & beyond',
    icon: 'Rocket',
  },
  {
    title: 'Holistic Growth',
    description: 'Focusing on academics + overall development',
    icon: 'HeartHandshake',
  },
];
