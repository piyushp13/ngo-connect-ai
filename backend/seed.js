const bcrypt = require('bcryptjs');
const { faker } = require('@faker-js/faker/locale/en');
const User = require('./src/models/User');
const NGO = require('./src/models/NGO');
const Campaign = require('./src/models/Campaign');
const VolunteerOpportunity = require('./src/models/VolunteerOpportunity');
const Category = require('./src/models/Category');
const connectDB = require('./src/config/db');

faker.seed(2026);

const imageUrl = (seed, width = 1200, height = 800) => `https://picsum.photos/seed/${seed}/${width}/${height}`;

const buildFinancials = ({ baseIncome, baseExpense }) => {
  const years = [2021, 2022, 2023, 2024, 2025];
  const income = years.map((_, index) => Math.round(baseIncome * (1 + index * 0.08)));
  const expenses = years.map((_, index) => Math.round(baseExpense * (1 + index * 0.075)));
  const latestExpense = expenses[expenses.length - 1];
  const nonProgram = Math.round(latestExpense * 0.19);
  const program = Math.max(latestExpense - nonProgram, 0);
  return { years, income, expenses, nonProgram, program };
};

const ngoSeeds = [
  {
    slug: 'akshaya-patra',
    name: 'The Akshaya Patra Foundation',
    email: 'akshayapatra@ngo.org',
    categories: ['Hunger', 'Children', 'Education'],
    mission: 'To eliminate classroom hunger in Karnataka and improve learning outcomes for children through nutritious mid-day meals.',
    vision: 'No child in Karnataka should miss school because of hunger.',
    description: 'Akshaya Patra runs centralised community kitchens and school nutrition programs across Bengaluru and nearby districts.',
    about: 'The organisation partners with schools, local governments, and volunteers to serve fresh meals daily. It also runs nutrition awareness sessions for families and school management committees.',
    impact: 'Meals are delivered every school day with strict food safety standards and measurable impact tracking at school level.',
    helplineNumber: '080-3012-4000',
    registrationId: 'NGO-KA-AP-2000',
    address: 'ISKCON Temple Road, Rajajinagar, Bengaluru, Karnataka 560010',
    addressDetails: {
      houseNumber: '72',
      landmark: 'Near ISKCON Temple',
      district: 'Bengaluru Urban',
      state: 'Karnataka',
      pincode: '560010'
    },
    location: { type: 'Point', coordinates: [77.55106, 13.010086] },
    geographies: ['Rajajinagar', 'Bengaluru', 'Karnataka'],
    offices: ['Bengaluru', 'Mangaluru'],
    website: 'https://www.akshayapatra.org',
    logo: imageUrl('akshaya-logo', 300, 300),
    coverImage: imageUrl('akshaya-cover'),
    gallery: [imageUrl('akshaya-gallery-1'), imageUrl('akshaya-gallery-2'), imageUrl('akshaya-gallery-3')],
    videos: ['https://www.youtube.com/watch?v=8jPQjjsBbIc'],
    badges: ['FCRA', '80G', '12A', 'CSR-1'],
    certifications: ['ISO 22000 Food Safety'],
    awards: ['Karnataka CSR Excellence Award 2024'],
    testimonials: [
      {
        name: 'Meenakshi R',
        role: 'School Principal, Rajajinagar',
        quote: 'Attendance improved consistently after meal service became regular and predictable.'
      }
    ],
    transparency: 'Gold Certified 2025',
    primarySectors: ['Hunger', 'Education', 'Child Welfare'],
    secondarySectors: ['School Nutrition', 'Community Kitchens'],
    financials: buildFinancials({ baseIncome: 48000000, baseExpense: 42000000 }),
    programs: [
      {
        name: 'Mid-Day Meal Program',
        img: imageUrl('akshaya-program-1', 640, 420),
        desc: 'Daily nutritious meals for government and aided schools.'
      },
      {
        name: 'School Nutrition Monitoring',
        img: imageUrl('akshaya-program-2', 640, 420),
        desc: 'Meal quality checks and nutrition outcome tracking for partner schools.'
      }
    ],
    impactMetrics: [
      '2.4 million meals served in Karnataka in the last 12 months',
      '450+ schools reached in Bengaluru and nearby districts',
      'Average school attendance improved by 11% in partner clusters'
    ],
    leadership: [
      { name: 'Raghavendra P', role: 'State Program Director', linkedin: 'https://www.linkedin.com' },
      { name: 'Lakshmi N', role: 'Head of Nutrition Operations', linkedin: 'https://www.linkedin.com' }
    ],
    orgStrength: 210,
    orgStructure: 'Trust',
    registration: {
      pan: 'AAATA1111A',
      regNo: 'BLR-TRUST-2000-1189',
      csr: 'CSR00001001',
      g80: 'AAATA1111AF20241',
      a12: 'AAATA1111AE20241',
      fcra: '094421301'
    },
    type: 'Non-profit',
    subType: 'Trust',
    socials: {
      youtube: 'https://www.youtube.com',
      linkedin: 'https://www.linkedin.com',
      facebook: 'https://www.facebook.com',
      instagram: 'https://www.instagram.com',
      twitter: 'https://twitter.com'
    },
    tech: {
      soc2: false,
      financial: true,
      beneficiary: true
    }
  },
  {
    slug: 'samarthanam',
    name: 'Samarthanam Trust for the Disabled',
    email: 'samarthanam@ngo.org',
    categories: ['Disability Inclusion', 'Education', 'Skilling'],
    mission: 'To empower visually impaired and differently abled communities with education, skilling, and livelihood opportunities.',
    vision: 'An inclusive Karnataka where disability is never a barrier to dignity or employment.',
    description: 'Samarthanam provides accessible education, assistive technology support, and livelihood training in Bengaluru and tier-2 Karnataka cities.',
    about: 'The NGO works with schools, colleges, and companies to create inclusive pathways for youth and adults with disabilities.',
    impact: 'Its programs combine assistive devices, digital learning, and placement support with measurable inclusion outcomes.',
    helplineNumber: '080-2552-3001',
    registrationId: 'NGO-KA-SM-1997',
    address: '15th Cross, Sector 4, HSR Layout, Bengaluru, Karnataka 560102',
    addressDetails: {
      houseNumber: 'CA-39',
      landmark: 'Near HSR BDA Complex',
      district: 'Bengaluru Urban',
      state: 'Karnataka',
      pincode: '560102'
    },
    location: { type: 'Point', coordinates: [77.641583, 12.914108] },
    geographies: ['HSR Layout', 'Bengaluru', 'Mysuru', 'Karnataka'],
    offices: ['Bengaluru', 'Mysuru'],
    website: 'https://www.samarthanam.org',
    logo: imageUrl('samarthanam-logo', 300, 300),
    coverImage: imageUrl('samarthanam-cover'),
    gallery: [imageUrl('samarthanam-gallery-1'), imageUrl('samarthanam-gallery-2'), imageUrl('samarthanam-gallery-3')],
    videos: ['https://www.youtube.com/watch?v=Jf6Wb8nJ4mQ'],
    badges: ['FCRA', '80G', '12A'],
    certifications: ['Accessible Learning Standard 2024'],
    awards: ['NCPEDP Inclusion Award 2023'],
    testimonials: [
      {
        name: 'Shreya M',
        role: 'Program Alumna',
        quote: 'The digital skilling program helped me secure my first job in Bengaluru.'
      }
    ],
    transparency: 'Gold Certified 2025',
    primarySectors: ['Disability Inclusion', 'Education'],
    secondarySectors: ['Assistive Devices', 'Livelihoods'],
    financials: buildFinancials({ baseIncome: 26000000, baseExpense: 22000000 }),
    programs: [
      {
        name: 'Accessible Learning Labs',
        img: imageUrl('samarthanam-program-1', 640, 420),
        desc: 'Screen-reader enabled learning and exam support for students.'
      },
      {
        name: 'Skill-to-Employment Bridge',
        img: imageUrl('samarthanam-program-2', 640, 420),
        desc: 'Industry-aligned training and placement support for youth with disabilities.'
      }
    ],
    impactMetrics: [
      '4,300 learners with disabilities supported in FY 2024-25',
      '1,280 assistive devices distributed in Karnataka',
      '68% placement rate in completed skilling batches'
    ],
    leadership: [
      { name: 'Mahantesh G', role: 'Founder Trustee', linkedin: 'https://www.linkedin.com' },
      { name: 'Nandita S', role: 'Director - Inclusion Programs', linkedin: 'https://www.linkedin.com' }
    ],
    orgStrength: 145,
    orgStructure: 'Trust',
    registration: {
      pan: 'AAATS2222B',
      regNo: 'BLR-TRUST-1997-782',
      csr: 'CSR00002012',
      g80: 'AAATS2222BF20241',
      a12: 'AAATS2222BE20241',
      fcra: '094421302'
    },
    type: 'Non-profit',
    subType: 'Trust',
    socials: {
      youtube: 'https://www.youtube.com',
      linkedin: 'https://www.linkedin.com',
      facebook: 'https://www.facebook.com',
      instagram: 'https://www.instagram.com',
      twitter: 'https://twitter.com'
    },
    tech: {
      soc2: false,
      financial: true,
      beneficiary: true
    }
  },
  {
    slug: 'parikrma',
    name: 'Parikrma Humanity Foundation',
    email: 'parikrma@ngo.org',
    categories: ['Education', 'Children'],
    mission: 'To provide quality English-medium education and holistic support to underserved children in Bengaluru.',
    vision: 'Every child should have equal access to high-quality learning and life opportunities.',
    description: 'Parikrma operates integrated learning centres with academics, nutrition, counselling, and community engagement.',
    about: 'The foundation serves children from vulnerable communities and supports long-term pathways to higher education and careers.',
    impact: 'Its model combines classroom learning with social support for sustained student growth.',
    helplineNumber: '080-2653-9100',
    registrationId: 'NGO-KA-PH-2003',
    address: 'Ashoka Pillar Road, Jayanagar, Bengaluru, Karnataka 560011',
    addressDetails: {
      houseNumber: '35',
      landmark: 'Near Ashoka Pillar',
      district: 'Bengaluru Urban',
      state: 'Karnataka',
      pincode: '560011'
    },
    location: { type: 'Point', coordinates: [77.584989, 12.943033] },
    geographies: ['Jayanagar', 'Koramangala', 'Bengaluru'],
    offices: ['Bengaluru'],
    website: 'https://www.parikrmafoundation.org',
    logo: imageUrl('parikrma-logo', 300, 300),
    coverImage: imageUrl('parikrma-cover'),
    gallery: [imageUrl('parikrma-gallery-1'), imageUrl('parikrma-gallery-2'), imageUrl('parikrma-gallery-3')],
    videos: ['https://www.youtube.com/watch?v=x0sqY9RPG2A'],
    badges: ['80G', '12A', 'CSR-1'],
    certifications: ['Child Safeguarding Compliance 2025'],
    awards: ['Bengaluru Education Impact Award 2024'],
    testimonials: [
      {
        name: 'Priyanka T',
        role: 'Parent',
        quote: 'My daughter now reads confidently and wants to become a teacher.'
      }
    ],
    transparency: 'Silver Certified 2025',
    primarySectors: ['Education', 'Child Welfare'],
    secondarySectors: ['After-school Learning', 'Teacher Development'],
    financials: buildFinancials({ baseIncome: 32000000, baseExpense: 28500000 }),
    programs: [
      {
        name: 'After-School Learning Labs',
        img: imageUrl('parikrma-program-1', 640, 420),
        desc: 'Academic reinforcement and foundational literacy support.'
      },
      {
        name: 'Career Readiness Program',
        img: imageUrl('parikrma-program-2', 640, 420),
        desc: 'Higher education counselling and soft-skills development for senior students.'
      }
    ],
    impactMetrics: [
      '3,100 students actively enrolled in Bengaluru centres',
      '87% of Grade 5 students reached proficiency benchmarks',
      '420 alumni in higher education pathways'
    ],
    leadership: [
      { name: 'Shukla Bose', role: 'Founder', linkedin: 'https://www.linkedin.com' },
      { name: 'Harish K', role: 'Head - Academic Programs', linkedin: 'https://www.linkedin.com' }
    ],
    orgStrength: 124,
    orgStructure: 'Society',
    registration: {
      pan: 'AAATP3333C',
      regNo: 'BLR-SOC-2003-1152',
      csr: 'CSR00003010',
      g80: 'AAATP3333CF20241',
      a12: 'AAATP3333CE20241',
      fcra: '094421303'
    },
    type: 'Non-profit',
    subType: 'Society',
    socials: {
      youtube: 'https://www.youtube.com',
      linkedin: 'https://www.linkedin.com',
      facebook: 'https://www.facebook.com',
      instagram: 'https://www.instagram.com',
      twitter: 'https://twitter.com'
    },
    tech: {
      soc2: false,
      financial: true,
      beneficiary: true
    }
  },
  {
    slug: 'hasiru-dala',
    name: 'Hasiru Dala Innovations',
    email: 'hasirudala@ngo.org',
    categories: ['Environment', 'Livelihood', 'Urban Sanitation'],
    mission: 'To strengthen dignified livelihoods for waste workers while improving urban waste management in Bengaluru.',
    vision: 'Inclusive and circular cities where every worker and every resource is valued.',
    description: 'Hasiru Dala works on dry waste collection systems, waste worker welfare, and citizen behaviour change campaigns.',
    about: 'The NGO builds partnerships with apartment associations, municipal wards, and recycling ecosystems to improve segregation outcomes.',
    impact: 'Programs reduce landfill waste while creating safer and better-paid work opportunities.',
    helplineNumber: '080-4098-2200',
    registrationId: 'NGO-KA-HD-2011',
    address: 'Yeshwanthpur Industrial Area, Bengaluru, Karnataka 560022',
    addressDetails: {
      houseNumber: '12',
      landmark: 'Near Yeshwanthpur Metro',
      district: 'Bengaluru Urban',
      state: 'Karnataka',
      pincode: '560022'
    },
    location: { type: 'Point', coordinates: [77.557143, 13.028744] },
    geographies: ['Yeshwanthpur', 'Malleshwaram', 'Bengaluru'],
    offices: ['Bengaluru'],
    website: 'https://www.hasirudala.in',
    logo: imageUrl('hasiru-logo', 300, 300),
    coverImage: imageUrl('hasiru-cover'),
    gallery: [imageUrl('hasiru-gallery-1'), imageUrl('hasiru-gallery-2'), imageUrl('hasiru-gallery-3')],
    videos: ['https://www.youtube.com/watch?v=8VumjI7xY1g'],
    badges: ['CSR-1', '80G'],
    certifications: ['Urban Waste Audit Certified 2024'],
    awards: ['Bengaluru Sustainability Award 2024'],
    testimonials: [
      {
        name: 'Uma V',
        role: 'Waste Worker Leader',
        quote: 'Formal collection partnerships gave our teams stable monthly income.'
      }
    ],
    transparency: 'Silver Certified 2025',
    primarySectors: ['Environment', 'Livelihood'],
    secondarySectors: ['Waste Segregation', 'Urban Governance'],
    financials: buildFinancials({ baseIncome: 18000000, baseExpense: 15000000 }),
    programs: [
      {
        name: 'Dry Waste Collection Centres',
        img: imageUrl('hasiru-program-1', 640, 420),
        desc: 'Ward-level centres for safer sorting and better recycling recovery.'
      },
      {
        name: 'Citizen Segregation Campaign',
        img: imageUrl('hasiru-program-2', 640, 420),
        desc: 'Community education to improve household waste segregation rates.'
      }
    ],
    impactMetrics: [
      '19,000+ tonnes of dry waste diverted from landfills in 12 months',
      '2,200 waste workers supported with social protection linkages',
      'Segregation compliance improved by 24% in intervention wards'
    ],
    leadership: [
      { name: 'Nirmala S', role: 'Executive Director', linkedin: 'https://www.linkedin.com' },
      { name: 'Praveen M', role: 'Head - Urban Programs', linkedin: 'https://www.linkedin.com' }
    ],
    orgStrength: 96,
    orgStructure: 'Section 8 Company',
    registration: {
      pan: 'AAATH4444D',
      regNo: 'BLR-S8-2011-450',
      csr: 'CSR00004009',
      g80: 'AAATH4444DF20241',
      a12: 'AAATH4444DE20241',
      fcra: 'NA'
    },
    type: 'Non-profit',
    subType: 'Section 8',
    socials: {
      youtube: 'https://www.youtube.com',
      linkedin: 'https://www.linkedin.com',
      facebook: 'https://www.facebook.com',
      instagram: 'https://www.instagram.com',
      twitter: 'https://twitter.com'
    },
    tech: {
      soc2: false,
      financial: true,
      beneficiary: true
    }
  },
  {
    slug: 'swasthya-karnataka',
    name: 'Swasthya Karnataka Network',
    email: 'swasthyakarnataka@ngo.org',
    categories: ['Health', 'Medical Support', 'Rural Development'],
    mission: 'To improve access to primary healthcare in underserved communities across Karnataka.',
    vision: 'Affordable and reliable community healthcare for every family in the state.',
    description: 'The network runs mobile clinics, telemedicine support, and referral services in Mysuru and neighbouring districts.',
    about: 'Swasthya Karnataka works with PHCs, ASHA workers, and local volunteers to deliver preventive and primary care services.',
    impact: 'Its integrated field + telehealth model reduces delayed diagnosis and improves follow-up adherence.',
    helplineNumber: '0821-410-2400',
    registrationId: 'NGO-KA-SK-2014',
    address: 'Nazarbad Main Road, Mysuru, Karnataka 570010',
    addressDetails: {
      houseNumber: '24',
      landmark: 'Near Mysuru Zoo Gate',
      district: 'Mysuru',
      state: 'Karnataka',
      pincode: '570010'
    },
    location: { type: 'Point', coordinates: [76.6552, 12.3076] },
    geographies: ['Mysuru', 'Mandya', 'Chamarajanagar'],
    offices: ['Mysuru', 'Mandya'],
    website: 'https://www.swasthyakarnataka.org',
    logo: imageUrl('swasthya-logo', 300, 300),
    coverImage: imageUrl('swasthya-cover'),
    gallery: [imageUrl('swasthya-gallery-1'), imageUrl('swasthya-gallery-2'), imageUrl('swasthya-gallery-3')],
    videos: ['https://www.youtube.com/watch?v=Q4XdqgXJYjE'],
    badges: ['80G', '12A'],
    certifications: ['State Clinical Outreach Quality Mark 2025'],
    awards: ['Karnataka Public Health Partnership Award 2024'],
    testimonials: [
      {
        name: 'Dr. Kavitha R',
        role: 'PHC Medical Officer, Mandya',
        quote: 'Mobile camp referrals helped us identify high-risk patients much earlier.'
      }
    ],
    transparency: 'Gold Certified 2025',
    primarySectors: ['Health', 'Primary Care'],
    secondarySectors: ['Mobile Clinics', 'Telemedicine'],
    financials: buildFinancials({ baseIncome: 21000000, baseExpense: 18500000 }),
    programs: [
      {
        name: 'Mobile Health Clinics',
        img: imageUrl('swasthya-program-1', 640, 420),
        desc: 'Weekly outreach camps for screenings, follow-up, and medicine support.'
      },
      {
        name: 'Village Telemedicine Access',
        img: imageUrl('swasthya-program-2', 640, 420),
        desc: 'Remote consultation support for villages with limited specialist access.'
      }
    ],
    impactMetrics: [
      '76,000 outpatient consultations in FY 2024-25',
      '11,400 chronic disease screenings conducted',
      '89% follow-up adherence in telemedicine cohort'
    ],
    leadership: [
      { name: 'Dr. Vikram H', role: 'Chief Medical Director', linkedin: 'https://www.linkedin.com' },
      { name: 'Asha M', role: 'Program Lead - Field Operations', linkedin: 'https://www.linkedin.com' }
    ],
    orgStrength: 82,
    orgStructure: 'Society',
    registration: {
      pan: 'AAATS5555E',
      regNo: 'MYS-SOC-2014-982',
      csr: 'CSR00005014',
      g80: 'AAATS5555EF20241',
      a12: 'AAATS5555EE20241',
      fcra: 'NA'
    },
    type: 'Non-profit',
    subType: 'Society',
    socials: {
      youtube: 'https://www.youtube.com',
      linkedin: 'https://www.linkedin.com',
      facebook: 'https://www.facebook.com',
      instagram: 'https://www.instagram.com',
      twitter: 'https://twitter.com'
    },
    tech: {
      soc2: false,
      financial: true,
      beneficiary: true
    }
  },
  {
    slug: 'namma-mahila-shakti',
    name: 'Namma Mahila Shakti Trust',
    email: 'mahilashakti@ngo.org',
    categories: ['Women', 'Livelihood', 'Human Rights'],
    mission: 'To support women in low-income communities through entrepreneurship, legal literacy, and safety programs.',
    vision: 'Safe, economically independent, and confident women-led communities across Karnataka.',
    description: 'Namma Mahila Shakti runs skill-building cohorts, mentorship circles, and women safety awareness initiatives.',
    about: 'The trust collaborates with local corporates and community groups to improve women’s livelihoods and local support systems.',
    impact: 'It provides integrated support including training, market linkage, peer learning, and referral services.',
    helplineNumber: '080-4510-1188',
    registrationId: 'NGO-KA-NM-2016',
    address: 'Neeladri Road, Electronic City Phase 1, Bengaluru, Karnataka 560100',
    addressDetails: {
      houseNumber: '77',
      landmark: 'Near Electronic City Wipro Gate',
      district: 'Bengaluru Urban',
      state: 'Karnataka',
      pincode: '560100'
    },
    location: { type: 'Point', coordinates: [77.6603, 12.8456] },
    geographies: ['Electronic City', 'Bommanahalli', 'Bengaluru'],
    offices: ['Bengaluru'],
    website: 'https://www.nammamahila.org',
    logo: imageUrl('mahila-logo', 300, 300),
    coverImage: imageUrl('mahila-cover'),
    gallery: [imageUrl('mahila-gallery-1'), imageUrl('mahila-gallery-2'), imageUrl('mahila-gallery-3')],
    videos: ['https://www.youtube.com/watch?v=qth5q5wR8mc'],
    badges: ['80G', '12A', 'CSR-1'],
    certifications: ['Women Safety Facilitation Accreditation 2025'],
    awards: ['Karnataka Women Leadership Award 2024'],
    testimonials: [
      {
        name: 'Shilpa G',
        role: 'Entrepreneur Cohort Participant',
        quote: 'The market linkage support helped me double my monthly business income.'
      }
    ],
    transparency: 'Silver Certified 2025',
    primarySectors: ['Women', 'Livelihood'],
    secondarySectors: ['Entrepreneurship', 'Safety and Legal Literacy'],
    financials: buildFinancials({ baseIncome: 16000000, baseExpense: 13800000 }),
    programs: [
      {
        name: 'Women Entrepreneurship Cohorts',
        img: imageUrl('mahila-program-1', 640, 420),
        desc: 'Skill development, basic finance, and market linkage support for women-led micro-businesses.'
      },
      {
        name: 'Community Safety Sessions',
        img: imageUrl('mahila-program-2', 640, 420),
        desc: 'Neighbourhood-level sessions on safety, rights, and legal referral pathways.'
      }
    ],
    impactMetrics: [
      '2,850 women completed livelihood cohorts in the last year',
      '1,100 women linked to micro-enterprise market channels',
      '210 community safety circles operational in Bengaluru'
    ],
    leadership: [
      { name: 'Farah N', role: 'Managing Trustee', linkedin: 'https://www.linkedin.com' },
      { name: 'Jyoti M', role: 'Lead - Community Programs', linkedin: 'https://www.linkedin.com' }
    ],
    orgStrength: 68,
    orgStructure: 'Trust',
    registration: {
      pan: 'AAATN6666F',
      regNo: 'BLR-TRUST-2016-611',
      csr: 'CSR00006021',
      g80: 'AAATN6666FF20241',
      a12: 'AAATN6666FE20241',
      fcra: 'NA'
    },
    type: 'Non-profit',
    subType: 'Trust',
    socials: {
      youtube: 'https://www.youtube.com',
      linkedin: 'https://www.linkedin.com',
      facebook: 'https://www.facebook.com',
      instagram: 'https://www.instagram.com',
      twitter: 'https://twitter.com'
    },
    tech: {
      soc2: false,
      financial: true,
      beneficiary: true
    }
  },
  {
    slug: 'kodagu-flood-resilience',
    name: 'Kodagu Flood Resilience Collective',
    email: 'kodaguresilience@ngo.org',
    categories: ['Disaster Relief', 'Environment', 'Rural Development'],
    mission: 'To build disaster readiness, resilient infrastructure, and rapid response capacity in Kodagu communities.',
    vision: 'Resilient hill communities prepared for monsoons and climate-linked emergencies.',
    description: 'The collective supports preparedness kits, community response teams, and watershed restoration activities.',
    about: 'It combines local volunteer networks with technical planning to reduce flood vulnerability and response delays.',
    impact: 'Preparedness drills and local supply pre-positioning have improved response times in high-risk panchayats.',
    helplineNumber: '08272-245-110',
    registrationId: 'NGO-KA-KF-2018',
    address: 'College Road, Madikeri, Kodagu, Karnataka 571201',
    addressDetails: {
      houseNumber: '9',
      landmark: 'Near District Office',
      district: 'Kodagu',
      state: 'Karnataka',
      pincode: '571201'
    },
    location: { type: 'Point', coordinates: [75.7382, 12.4244] },
    geographies: ['Madikeri', 'Somwarpet', 'Kodagu'],
    offices: ['Madikeri'],
    website: 'https://www.kodaguresilience.org',
    logo: imageUrl('kodagu-logo', 300, 300),
    coverImage: imageUrl('kodagu-cover'),
    gallery: [imageUrl('kodagu-gallery-1'), imageUrl('kodagu-gallery-2'), imageUrl('kodagu-gallery-3')],
    videos: ['https://www.youtube.com/watch?v=ayKg2LFy0i4'],
    badges: ['80G', 'CSR-1'],
    certifications: ['District Disaster Collaboration Registry 2025'],
    awards: ['Kodagu Climate Action Recognition 2024'],
    testimonials: [
      {
        name: 'Ramesh C',
        role: 'Panchayat Leader, Somwarpet',
        quote: 'Preparedness trainings helped our village respond safely during heavy rain alerts.'
      }
    ],
    transparency: 'Silver Certified 2025',
    primarySectors: ['Disaster Relief', 'Climate Adaptation'],
    secondarySectors: ['Preparedness Training', 'Local Response Teams'],
    financials: buildFinancials({ baseIncome: 14000000, baseExpense: 12000000 }),
    programs: [
      {
        name: 'Monsoon Preparedness Kits',
        img: imageUrl('kodagu-program-1', 640, 420),
        desc: 'Pre-positioned essential kits for vulnerable households before heavy rainfall windows.'
      },
      {
        name: 'Community Response Team Training',
        img: imageUrl('kodagu-program-2', 640, 420),
        desc: 'Village volunteer training for first response and safe evacuation coordination.'
      }
    ],
    impactMetrics: [
      '8,900 households covered by preparedness planning',
      '74 trained village response teams active in Kodagu',
      'Average emergency response time reduced by 31%'
    ],
    leadership: [
      { name: 'Anita P', role: 'Program Director', linkedin: 'https://www.linkedin.com' },
      { name: 'Sudarshan K', role: 'Lead - Disaster Readiness', linkedin: 'https://www.linkedin.com' }
    ],
    orgStrength: 52,
    orgStructure: 'Society',
    registration: {
      pan: 'AAATK7777G',
      regNo: 'KDG-SOC-2018-255',
      csr: 'CSR00007009',
      g80: 'AAATK7777GF20241',
      a12: 'AAATK7777GE20241',
      fcra: 'NA'
    },
    type: 'Non-profit',
    subType: 'Society',
    socials: {
      youtube: 'https://www.youtube.com',
      linkedin: 'https://www.linkedin.com',
      facebook: 'https://www.facebook.com',
      instagram: 'https://www.instagram.com',
      twitter: 'https://twitter.com'
    },
    tech: {
      soc2: false,
      financial: true,
      beneficiary: true
    }
  },
  {
    slug: 'north-karnataka-water',
    name: 'North Karnataka Water Collective',
    email: 'northkawater@ngo.org',
    categories: ['Environment', 'Health', 'Rural Development'],
    mission: 'To improve safe water access and local water quality monitoring in North Karnataka.',
    vision: 'Reliable, safe, and community-managed water systems for every village household.',
    description: 'The collective supports water quality testing, rejuvenation drives, and local water governance committees.',
    about: 'Programs are delivered with local schools, gram panchayats, and youth volunteers in Hubballi-Dharwad and nearby taluks.',
    impact: 'Household-level awareness and frequent testing have improved safe water practices in partner villages.',
    helplineNumber: '0836-226-8800',
    registrationId: 'NGO-KA-NW-2019',
    address: 'Vidyanagar Main Road, Hubballi, Karnataka 580021',
    addressDetails: {
      houseNumber: '101',
      landmark: 'Near Unkal Lake Junction',
      district: 'Dharwad',
      state: 'Karnataka',
      pincode: '580021'
    },
    location: { type: 'Point', coordinates: [75.1221, 15.3647] },
    geographies: ['Hubballi', 'Dharwad', 'Gadag'],
    offices: ['Hubballi'],
    website: 'https://www.nkwc.org',
    logo: imageUrl('nkwc-logo', 300, 300),
    coverImage: imageUrl('nkwc-cover'),
    gallery: [imageUrl('nkwc-gallery-1'), imageUrl('nkwc-gallery-2'), imageUrl('nkwc-gallery-3')],
    videos: ['https://www.youtube.com/watch?v=uyDGfueQ49w'],
    badges: ['80G', '12A'],
    certifications: ['Water Testing Lab Partner Accreditation 2025'],
    awards: ['North Karnataka Sustainability Award 2024'],
    testimonials: [
      {
        name: 'Ravi B',
        role: 'Village Water Committee Member',
        quote: 'Regular testing reports helped us fix contamination issues before monsoon.'
      }
    ],
    transparency: 'Silver Certified 2025',
    primarySectors: ['Environment', 'Public Health'],
    secondarySectors: ['Water Quality', 'Community Governance'],
    financials: buildFinancials({ baseIncome: 13000000, baseExpense: 11200000 }),
    programs: [
      {
        name: 'Village Water Testing',
        img: imageUrl('nkwc-program-1', 640, 420),
        desc: 'Routine water testing and public dashboards for village-level water quality alerts.'
      },
      {
        name: 'Waterbody Restoration Drives',
        img: imageUrl('nkwc-program-2', 640, 420),
        desc: 'Community restoration and desilting support for local lakes and tanks.'
      }
    ],
    impactMetrics: [
      '1,520 water samples tested across 14 blocks',
      '96 village committees trained on water safety protocols',
      '42 local waterbodies supported through restoration drives'
    ],
    leadership: [
      { name: 'Megha H', role: 'Executive Director', linkedin: 'https://www.linkedin.com' },
      { name: 'Prakash B', role: 'Head - Field Monitoring', linkedin: 'https://www.linkedin.com' }
    ],
    orgStrength: 47,
    orgStructure: 'Section 8 Company',
    registration: {
      pan: 'AAATN8888H',
      regNo: 'HBL-S8-2019-177',
      csr: 'CSR00008017',
      g80: 'AAATN8888HF20241',
      a12: 'AAATN8888HE20241',
      fcra: 'NA'
    },
    type: 'Non-profit',
    subType: 'Section 8',
    socials: {
      youtube: 'https://www.youtube.com',
      linkedin: 'https://www.linkedin.com',
      facebook: 'https://www.facebook.com',
      instagram: 'https://www.instagram.com',
      twitter: 'https://twitter.com'
    },
    tech: {
      soc2: false,
      financial: true,
      beneficiary: true
    }
  },
  {
    slug: 'namma-lake-guardians',
    name: 'Namma Lake Guardians',
    email: 'lakeguardians@ngo.org',
    categories: ['Environment', 'Urban Sanitation'],
    mission: 'To restore Bengaluru lakes through citizen science, clean-up drives, and long-term lake stewardship programs.',
    vision: 'Every neighbourhood in Bengaluru has a healthy, accessible, and thriving lake ecosystem.',
    description: 'Namma Lake Guardians works with local communities and civic partners to rehabilitate lakes, improve biodiversity, and reduce waste inflow.',
    about: 'The collective runs monthly lake clean-ups, water quality sampling, and community workshops with lake committees. It maintains public dashboards for water quality, waste hotspots, and volunteer engagement.',
    impact: 'Volunteer stewardship combined with data-driven lake monitoring helps sustain long-term improvements beyond one-off cleanups.',
    helplineNumber: '080-4200-3311',
    registrationId: 'NGO-KA-NLG-2021',
    address: 'Outer Ring Road, Bellandur, Bengaluru, Karnataka 560103',
    addressDetails: {
      houseNumber: '18',
      landmark: 'Near Bellandur Lake Gate',
      district: 'Bengaluru Urban',
      state: 'Karnataka',
      pincode: '560103'
    },
    location: { type: 'Point', coordinates: [77.6764, 12.9306] },
    geographies: ['Bellandur', 'HSR Layout', 'Koramangala', 'Bengaluru'],
    offices: ['Bengaluru'],
    website: 'https://www.nammalakeguardians.org',
    logo: imageUrl('nlg-logo', 300, 300),
    coverImage: imageUrl('nlg-cover'),
    gallery: [imageUrl('nlg-gallery-1'), imageUrl('nlg-gallery-2'), imageUrl('nlg-gallery-3')],
    videos: ['https://www.youtube.com/watch?v=uyDGfueQ49w'],
    badges: ['80G', '12A', 'CSR-1'],
    certifications: ['Lake Stewardship Partner 2025'],
    awards: ['Bengaluru Urban Ecology Award 2025'],
    testimonials: [
      {
        name: 'Rashmi S',
        role: 'Lake Committee Member, Bellandur',
        quote: 'Public monitoring dashboards helped our committee act quickly on new waste inflow points.'
      }
    ],
    transparency: 'Silver Certified 2025',
    primarySectors: ['Environment', 'Urban Sanitation'],
    secondarySectors: ['Waterbodies', 'Citizen Science', 'Waste Management'],
    financials: buildFinancials({ baseIncome: 16500000, baseExpense: 14100000 }),
    programs: [
      {
        name: 'Lake Clean-up Drives',
        img: imageUrl('nlg-program-1', 640, 420),
        desc: 'Monthly clean-up events and shoreline restoration tasks with volunteer crews.'
      },
      {
        name: 'Water Quality Citizen Lab',
        img: imageUrl('nlg-program-2', 640, 420),
        desc: 'Community-led sampling and reporting of key water quality indicators.'
      }
    ],
    impactMetrics: [
      '18 lake clean-ups delivered across Bengaluru in the last 12 months',
      '8 lake committees supported with monitoring dashboards',
      '62 waste hotspots identified and mapped for civic action'
    ],
    leadership: [
      { name: 'Anirudh N', role: 'Program Lead - Lakes', linkedin: 'https://www.linkedin.com' },
      { name: 'Shreya K', role: 'Community Partnerships', linkedin: 'https://www.linkedin.com' }
    ],
    orgStrength: 26,
    orgStructure: 'Trust',
    registration: {
      pan: 'AAATN7711K',
      regNo: 'BLR-TRUST-2021-512',
      csr: 'CSR00009011',
      g80: 'AAATN7711KF20241',
      a12: 'AAATN7711KE20241',
      fcra: 'NA'
    },
    type: 'Non-profit',
    subType: 'Trust',
    socials: {
      youtube: 'https://www.youtube.com',
      linkedin: 'https://www.linkedin.com',
      facebook: 'https://www.facebook.com',
      instagram: 'https://www.instagram.com',
      twitter: 'https://twitter.com'
    },
    tech: {
      soc2: false,
      financial: true,
      beneficiary: true
    }
  },
  {
    slug: 'bengaluru-digital-literacy',
    name: 'Bengaluru Digital Literacy Mission',
    email: 'digitalliteracy@ngo.org',
    categories: ['Education', 'Skilling'],
    mission: 'To bridge the digital divide in Bengaluru by enabling practical computer and job-readiness skills for youth and women.',
    vision: 'Digital skills for every household in Bengaluru, regardless of income or access.',
    description: 'The mission runs community labs, mobile training units, and employability bootcamps across Bengaluru.',
    about: 'Programs include foundational digital literacy, resume and interview preparation, and guided pathways to apprenticeships. The mission collaborates with colleges, community centres, and CSR partners.',
    impact: 'Participants gain confidence using essential digital services and can access better employment opportunities.',
    helplineNumber: '080-4211-7744',
    registrationId: 'NGO-KA-BDLM-2020',
    address: '17th Cross, Sector 6, HSR Layout, Bengaluru, Karnataka 560102',
    addressDetails: {
      houseNumber: '44',
      landmark: 'Near HSR BDA Complex',
      district: 'Bengaluru Urban',
      state: 'Karnataka',
      pincode: '560102'
    },
    location: { type: 'Point', coordinates: [77.6413, 12.9116] },
    geographies: ['HSR Layout', 'KR Puram', 'Marathahalli', 'Bengaluru'],
    offices: ['Bengaluru', 'Tumakuru'],
    website: 'https://www.bdmission.org',
    logo: imageUrl('bdlm-logo', 300, 300),
    coverImage: imageUrl('bdlm-cover'),
    gallery: [imageUrl('bdlm-gallery-1'), imageUrl('bdlm-gallery-2'), imageUrl('bdlm-gallery-3')],
    videos: ['https://www.youtube.com/watch?v=8jPQjjsBbIc'],
    badges: ['80G', '12A', 'CSR-1'],
    certifications: ['NSDC Partner 2025'],
    awards: ['Karnataka Digital Inclusion Award 2024'],
    testimonials: [
      {
        name: 'Suma J',
        role: 'Alumna, KR Puram Bootcamp',
        quote: 'The lab sessions helped me apply for jobs online and prepare for interviews.'
      }
    ],
    transparency: 'Gold Certified 2025',
    primarySectors: ['Education', 'Skilling'],
    secondarySectors: ['Employability', 'Digital Inclusion'],
    financials: buildFinancials({ baseIncome: 22000000, baseExpense: 19700000 }),
    programs: [
      {
        name: 'Neighbourhood Digital Labs',
        img: imageUrl('bdlm-program-1', 640, 420),
        desc: 'Local computer labs with trainers, practice tracks, and curated learning plans.'
      },
      {
        name: 'Job Readiness Bootcamps',
        img: imageUrl('bdlm-program-2', 640, 420),
        desc: 'Short-term training with placement support and interview preparation.'
      }
    ],
    impactMetrics: [
      '3,100 learners trained in Bengaluru in the last year',
      '68% participants progressed to internships or jobs within 90 days',
      '19 community labs operated with local partner institutions'
    ],
    leadership: [
      { name: 'Ravi S', role: 'Director - Programs', linkedin: 'https://www.linkedin.com' },
      { name: 'Nandini P', role: 'Head - Partnerships', linkedin: 'https://www.linkedin.com' }
    ],
    orgStrength: 62,
    orgStructure: 'Section 8 Company',
    registration: {
      pan: 'AAATB2222R',
      regNo: 'BLR-S8-2020-821',
      csr: 'CSR00009122',
      g80: 'AAATB2222RF20241',
      a12: 'AAATB2222RE20241',
      fcra: 'NA'
    },
    type: 'Non-profit',
    subType: 'Section 8',
    socials: {
      youtube: 'https://www.youtube.com',
      linkedin: 'https://www.linkedin.com',
      facebook: 'https://www.facebook.com',
      instagram: 'https://www.instagram.com',
      twitter: 'https://twitter.com'
    },
    tech: {
      soc2: false,
      financial: true,
      beneficiary: true
    }
  },
  {
    slug: 'womenworks-bengaluru',
    name: 'WomenWorks Bengaluru Collective',
    email: 'womenworks@ngo.org',
    categories: ['Women', 'Livelihood', 'Skilling'],
    mission: 'To enable dignified livelihoods for women in Bengaluru through skills training, entrepreneurship support, and market linkages.',
    vision: 'Every woman in Bengaluru has access to economic opportunity and safe workplaces.',
    description: 'WomenWorks runs micro-enterprise accelerators, job placement partnerships, and financial literacy programs for women.',
    about: 'The collective partners with SHGs, local businesses, and training institutes. Programs include tailoring and food processing units, digital commerce onboarding, and mentorship networks.',
    impact: 'Participants build stable incomes, improve savings habits, and access supportive peer networks.',
    helplineNumber: '080-4142-9090',
    registrationId: 'NGO-KA-WWB-2018',
    address: '4th Block, Jayanagar, Bengaluru, Karnataka 560011',
    addressDetails: {
      houseNumber: '55',
      landmark: 'Near Jayanagar 4th Block Market',
      district: 'Bengaluru Urban',
      state: 'Karnataka',
      pincode: '560011'
    },
    location: { type: 'Point', coordinates: [77.5838, 12.9279] },
    geographies: ['Jayanagar', 'JP Nagar', 'Banashankari', 'Bengaluru'],
    offices: ['Bengaluru'],
    website: 'https://www.womenworksblr.org',
    logo: imageUrl('wwb-logo', 300, 300),
    coverImage: imageUrl('wwb-cover'),
    gallery: [imageUrl('wwb-gallery-1'), imageUrl('wwb-gallery-2'), imageUrl('wwb-gallery-3')],
    videos: ['https://www.youtube.com/watch?v=8jPQjjsBbIc'],
    badges: ['80G', '12A'],
    certifications: ['Skill India Partner 2025'],
    awards: ['Women Entrepreneurship Catalyst Award 2024'],
    testimonials: [
      {
        name: 'Farzana A',
        role: 'Entrepreneur, Jayanagar',
        quote: 'The mentoring and market linkage support helped me scale my home bakery orders.'
      }
    ],
    transparency: 'Silver Certified 2025',
    primarySectors: ['Women', 'Livelihood'],
    secondarySectors: ['Entrepreneurship', 'Financial Literacy', 'Skilling'],
    financials: buildFinancials({ baseIncome: 14500000, baseExpense: 12700000 }),
    programs: [
      {
        name: 'Micro-Enterprise Accelerator',
        img: imageUrl('wwb-program-1', 640, 420),
        desc: 'Mentorship and business support for women-led enterprises.'
      },
      {
        name: 'Workplace Readiness',
        img: imageUrl('wwb-program-2', 640, 420),
        desc: 'Job readiness and placement support with partner employers.'
      }
    ],
    impactMetrics: [
      '740 women completed skilling tracks in the last year',
      '210 micro-enterprises supported through market linkage partnerships',
      'Average household income increased by 18% in partner clusters'
    ],
    leadership: [
      { name: 'Madhuri R', role: 'Executive Director', linkedin: 'https://www.linkedin.com' },
      { name: 'Sneha V', role: 'Head - Livelihoods', linkedin: 'https://www.linkedin.com' }
    ],
    orgStrength: 34,
    orgStructure: 'Trust',
    registration: {
      pan: 'AAATW3333M',
      regNo: 'BLR-TRUST-2018-332',
      csr: 'CSR00009133',
      g80: 'AAATW3333MF20241',
      a12: 'AAATW3333ME20241',
      fcra: 'NA'
    },
    type: 'Non-profit',
    subType: 'Trust',
    socials: {
      youtube: 'https://www.youtube.com',
      linkedin: 'https://www.linkedin.com',
      facebook: 'https://www.facebook.com',
      instagram: 'https://www.instagram.com',
      twitter: 'https://twitter.com'
    },
    tech: {
      soc2: false,
      financial: true,
      beneficiary: true
    }
  },
  {
    slug: 'swasthya-seva-bengaluru',
    name: 'Swasthya Seva Health Foundation',
    email: 'swasthyaseva@ngo.org',
    categories: ['Health', 'Medical Support'],
    mission: 'To strengthen community health access in Bengaluru through preventive screenings, referral networks, and health education.',
    vision: 'Quality preventive healthcare is accessible and affordable for every Bengaluru neighbourhood.',
    description: 'Swasthya Seva conducts health camps, runs patient navigation support, and coordinates with partner hospitals for referrals.',
    about: 'The foundation focuses on preventive screenings for diabetes, hypertension, and anaemia. It also trains local health volunteers to guide families on follow-up care and nutrition awareness.',
    impact: 'Early detection and structured follow-ups reduce complications and improve overall health outcomes for vulnerable families.',
    helplineNumber: '080-4100-8088',
    registrationId: 'NGO-KA-SSH-2017',
    address: 'ITPL Main Road, Whitefield, Bengaluru, Karnataka 560066',
    addressDetails: {
      houseNumber: '12',
      landmark: 'Near ITPL Gate 2',
      district: 'Bengaluru Urban',
      state: 'Karnataka',
      pincode: '560066'
    },
    location: { type: 'Point', coordinates: [77.7509, 12.9698] },
    geographies: ['Whitefield', 'KR Puram', 'Mahadevapura', 'Bengaluru'],
    offices: ['Bengaluru'],
    website: 'https://www.swasthyaseva.org',
    logo: imageUrl('ssh-logo', 300, 300),
    coverImage: imageUrl('ssh-cover'),
    gallery: [imageUrl('ssh-gallery-1'), imageUrl('ssh-gallery-2'), imageUrl('ssh-gallery-3')],
    videos: ['https://www.youtube.com/watch?v=8jPQjjsBbIc'],
    badges: ['80G', '12A'],
    certifications: ['Community Health Partner 2025'],
    awards: ['Bengaluru Preventive Care Award 2024'],
    testimonials: [
      {
        name: 'Dr. Sunil K',
        role: 'Partner Hospital Coordinator',
        quote: 'Referral coordination improved follow-up adherence in our outreach patients.'
      }
    ],
    transparency: 'Silver Certified 2025',
    primarySectors: ['Health', 'Medical Support'],
    secondarySectors: ['Preventive Care', 'Patient Navigation'],
    financials: buildFinancials({ baseIncome: 17800000, baseExpense: 16200000 }),
    programs: [
      {
        name: 'Neighbourhood Health Camps',
        img: imageUrl('ssh-program-1', 640, 420),
        desc: 'Preventive screening camps with referral and follow-up support.'
      },
      {
        name: 'Community Health Volunteers',
        img: imageUrl('ssh-program-2', 640, 420),
        desc: 'Volunteer training for health awareness and patient follow-up assistance.'
      }
    ],
    impactMetrics: [
      '9,200 screenings delivered across Bengaluru in the last year',
      '1,140 referrals coordinated for follow-up treatment',
      '72 community health volunteers trained and active'
    ],
    leadership: [
      { name: 'Dr. Kavya N', role: 'Medical Director', linkedin: 'https://www.linkedin.com' },
      { name: 'Harish P', role: 'Operations Lead', linkedin: 'https://www.linkedin.com' }
    ],
    orgStrength: 41,
    orgStructure: 'Society',
    registration: {
      pan: 'AAATS4444Q',
      regNo: 'BLR-SOC-2017-901',
      csr: 'CSR00009144',
      g80: 'AAATS4444QF20241',
      a12: 'AAATS4444QE20241',
      fcra: 'NA'
    },
    type: 'Non-profit',
    subType: 'Society',
    socials: {
      youtube: 'https://www.youtube.com',
      linkedin: 'https://www.linkedin.com',
      facebook: 'https://www.facebook.com',
      instagram: 'https://www.instagram.com',
      twitter: 'https://twitter.com'
    },
    tech: {
      soc2: false,
      financial: true,
      beneficiary: true
    }
  },
  {
    slug: 'accessible-bengaluru',
    name: 'Accessible Bengaluru Initiative',
    email: 'accessibleblr@ngo.org',
    categories: ['Disability Inclusion', 'Human Rights'],
    mission: 'To advance accessibility in Bengaluru through audits, advocacy, and inclusive community design.',
    vision: 'A barrier-free Bengaluru where public spaces and services are accessible to everyone.',
    description: 'The initiative conducts accessibility audits and works with civic stakeholders to improve public infrastructure inclusivity.',
    about: 'Programs include mobility audits of bus stops and metro stations, assistive tech awareness sessions, and disability inclusion workshops for institutions and employers.',
    impact: 'Evidence-based audits and structured follow-ups enable measurable improvements in public infrastructure accessibility.',
    helplineNumber: '080-4133-2112',
    registrationId: 'NGO-KA-ABI-2022',
    address: '100 Feet Road, Indiranagar, Bengaluru, Karnataka 560038',
    addressDetails: {
      houseNumber: '9',
      landmark: 'Near Indiranagar Metro Station',
      district: 'Bengaluru Urban',
      state: 'Karnataka',
      pincode: '560038'
    },
    location: { type: 'Point', coordinates: [77.6403, 12.9784] },
    geographies: ['Indiranagar', 'MG Road', 'Bengaluru'],
    offices: ['Bengaluru'],
    website: 'https://www.accessiblebengaluru.org',
    logo: imageUrl('abi-logo', 300, 300),
    coverImage: imageUrl('abi-cover'),
    gallery: [imageUrl('abi-gallery-1'), imageUrl('abi-gallery-2'), imageUrl('abi-gallery-3')],
    videos: ['https://www.youtube.com/watch?v=uyDGfueQ49w'],
    badges: ['80G', '12A'],
    certifications: ['Accessibility Audit Partner 2025'],
    awards: ['Inclusive City Award 2024'],
    testimonials: [
      {
        name: 'Suresh L',
        role: 'Wheelchair User, Indiranagar',
        quote: 'The audit reports helped prioritize ramps and signage fixes at key stations.'
      }
    ],
    transparency: 'Gold Certified 2025',
    primarySectors: ['Disability Inclusion', 'Human Rights'],
    secondarySectors: ['Accessibility Audits', 'Advocacy'],
    financials: buildFinancials({ baseIncome: 9800000, baseExpense: 8600000 }),
    programs: [
      {
        name: 'Public Transport Accessibility Audits',
        img: imageUrl('abi-program-1', 640, 420),
        desc: 'Evidence-based audits and issue tracking for metro stations and bus stops.'
      },
      {
        name: 'Inclusion Workshops',
        img: imageUrl('abi-program-2', 640, 420),
        desc: 'Workshops for institutions and employers on disability inclusion practices.'
      }
    ],
    impactMetrics: [
      '64 public transport hubs audited with issue trackers',
      '18 access improvements delivered via civic partner follow-ups',
      '560+ participants reached through inclusion workshops'
    ],
    leadership: [
      { name: 'Neelima S', role: 'Founder', linkedin: 'https://www.linkedin.com' },
      { name: 'Prashanth J', role: 'Research Lead', linkedin: 'https://www.linkedin.com' }
    ],
    orgStrength: 19,
    orgStructure: 'Trust',
    registration: {
      pan: 'AAATA5555P',
      regNo: 'BLR-TRUST-2022-115',
      csr: 'CSR00009155',
      g80: 'AAATA5555PF20241',
      a12: 'AAATA5555PE20241',
      fcra: 'NA'
    },
    type: 'Non-profit',
    subType: 'Trust',
    socials: {
      youtube: 'https://www.youtube.com',
      linkedin: 'https://www.linkedin.com',
      facebook: 'https://www.facebook.com',
      instagram: 'https://www.instagram.com',
      twitter: 'https://twitter.com'
    },
    tech: {
      soc2: false,
      financial: true,
      beneficiary: true
    }
  },
  {
    slug: 'namma-street-care',
    name: 'Namma Street Care Trust',
    email: 'streetcare@ngo.org',
    categories: ['Urban Sanitation', 'Environment'],
    mission: 'To improve cleanliness and waste segregation practices in dense Bengaluru neighbourhoods through community-led action.',
    vision: 'Cleaner streets and better waste outcomes for every Bengaluru ward.',
    description: 'Namma Street Care runs door-to-door awareness drives, waste segregation demos, and ward-level cleanup events.',
    about: 'The trust works with resident groups, market associations, and civic partners to reduce littering hotspots and improve segregation compliance.',
    impact: 'Consistent community outreach and ward action plans lead to sustained sanitation improvements.',
    helplineNumber: '080-4099-7701',
    registrationId: 'NGO-KA-NSC-2019',
    address: 'Russell Market Road, Shivajinagar, Bengaluru, Karnataka 560001',
    addressDetails: {
      houseNumber: '77',
      landmark: 'Near Russell Market',
      district: 'Bengaluru Urban',
      state: 'Karnataka',
      pincode: '560001'
    },
    location: { type: 'Point', coordinates: [77.6046, 12.9836] },
    geographies: ['Shivajinagar', 'Commercial Street', 'Bengaluru'],
    offices: ['Bengaluru'],
    website: 'https://www.nammastreetcare.org',
    logo: imageUrl('nsc-logo', 300, 300),
    coverImage: imageUrl('nsc-cover'),
    gallery: [imageUrl('nsc-gallery-1'), imageUrl('nsc-gallery-2'), imageUrl('nsc-gallery-3')],
    videos: ['https://www.youtube.com/watch?v=uyDGfueQ49w'],
    badges: ['80G', '12A'],
    certifications: ['Ward Sanitation Partner 2025'],
    awards: ['BBMP Clean Ward Collaboration 2024'],
    testimonials: [
      {
        name: 'Imran K',
        role: 'Market Association Member',
        quote: 'Segregation demos made it easier for vendors to follow daily collection rules.'
      }
    ],
    transparency: 'Silver Certified 2025',
    primarySectors: ['Urban Sanitation', 'Environment'],
    secondarySectors: ['Waste Segregation', 'Community Outreach'],
    financials: buildFinancials({ baseIncome: 8400000, baseExpense: 7200000 }),
    programs: [
      {
        name: 'Segregation Champions',
        img: imageUrl('nsc-program-1', 640, 420),
        desc: 'Ward-level volunteer champions driving waste segregation awareness.'
      },
      {
        name: 'Clean Market Initiative',
        img: imageUrl('nsc-program-2', 640, 420),
        desc: 'Waste management support for markets and vendor clusters.'
      }
    ],
    impactMetrics: [
      '12 wards supported with segregation awareness programs',
      '5 market clusters onboarded with daily compliance checklists',
      '28 cleanup events delivered with community partners'
    ],
    leadership: [
      { name: 'Shabnam M', role: 'Program Director', linkedin: 'https://www.linkedin.com' },
      { name: 'Kiran B', role: 'Field Operations Lead', linkedin: 'https://www.linkedin.com' }
    ],
    orgStrength: 22,
    orgStructure: 'Society',
    registration: {
      pan: 'AAATN6666S',
      regNo: 'BLR-SOC-2019-441',
      csr: 'CSR00009166',
      g80: 'AAATN6666SF20241',
      a12: 'AAATN6666SE20241',
      fcra: 'NA'
    },
    type: 'Non-profit',
    subType: 'Society',
    socials: {
      youtube: 'https://www.youtube.com',
      linkedin: 'https://www.linkedin.com',
      facebook: 'https://www.facebook.com',
      instagram: 'https://www.instagram.com',
      twitter: 'https://twitter.com'
    },
    tech: {
      soc2: false,
      financial: true,
      beneficiary: true
    }
  },
  {
    slug: 'bengaluru-food-rescue',
    name: 'Bengaluru Food Rescue Alliance',
    email: 'foodrescue@ngo.org',
    categories: ['Hunger', 'Children'],
    mission: 'To reduce food waste in Bengaluru by rescuing surplus food and delivering it safely to communities in need.',
    vision: 'No edible food wasted in Bengaluru while families remain hungry.',
    description: 'The alliance operates a surplus-food pickup network and coordinates distribution partners across Bengaluru.',
    about: 'The team works with restaurants, corporate cafeterias, and event venues to collect surplus food. It follows safety SOPs and uses a hub-and-spoke distribution model with partner shelters.',
    impact: 'Surplus redistribution reduces food waste and improves meal access for vulnerable families.',
    helplineNumber: '080-4044-1122',
    registrationId: 'NGO-KA-BFRA-2021',
    address: '80 Feet Road, Koramangala, Bengaluru, Karnataka 560034',
    addressDetails: {
      houseNumber: '21',
      landmark: 'Near Koramangala 4th Block',
      district: 'Bengaluru Urban',
      state: 'Karnataka',
      pincode: '560034'
    },
    location: { type: 'Point', coordinates: [77.6245, 12.9352] },
    geographies: ['Koramangala', 'HSR Layout', 'BTM Layout', 'Bengaluru'],
    offices: ['Bengaluru'],
    website: 'https://www.bengalurufoodrescue.org',
    logo: imageUrl('bfra-logo', 300, 300),
    coverImage: imageUrl('bfra-cover'),
    gallery: [imageUrl('bfra-gallery-1'), imageUrl('bfra-gallery-2'), imageUrl('bfra-gallery-3')],
    videos: ['https://www.youtube.com/watch?v=8jPQjjsBbIc'],
    badges: ['80G', '12A'],
    certifications: ['Food Safety SOP Partner 2025'],
    awards: ['Bengaluru Food Waste Reduction Award 2024'],
    testimonials: [
      {
        name: 'Joseph M',
        role: 'Shelter Coordinator',
        quote: 'Daily surplus pickups made our evening meal service reliable throughout the month.'
      }
    ],
    transparency: 'Gold Certified 2025',
    primarySectors: ['Hunger', 'Child Welfare'],
    secondarySectors: ['Food Waste', 'Community Kitchens'],
    financials: buildFinancials({ baseIncome: 12000000, baseExpense: 10400000 }),
    programs: [
      {
        name: 'Surplus Pickup Network',
        img: imageUrl('bfra-program-1', 640, 420),
        desc: 'Daily surplus pickup coordination and safe storage handoffs.'
      },
      {
        name: 'Community Meal Distribution',
        img: imageUrl('bfra-program-2', 640, 420),
        desc: 'Distribution partnerships with shelters and community kitchens.'
      }
    ],
    impactMetrics: [
      '1.1 million meals rescued and redistributed in the last 12 months',
      '240+ food donors onboarded across Bengaluru',
      'Average daily distribution reach: 3,400 beneficiaries'
    ],
    leadership: [
      { name: 'Arvind J', role: 'Operations Head', linkedin: 'https://www.linkedin.com' },
      { name: 'Anusha R', role: 'Partnerships Lead', linkedin: 'https://www.linkedin.com' }
    ],
    orgStrength: 29,
    orgStructure: 'Section 8 Company',
    registration: {
      pan: 'AAATB7777D',
      regNo: 'BLR-S8-2021-215',
      csr: 'CSR00009177',
      g80: 'AAATB7777DF20241',
      a12: 'AAATB7777DE20241',
      fcra: 'NA'
    },
    type: 'Non-profit',
    subType: 'Section 8',
    socials: {
      youtube: 'https://www.youtube.com',
      linkedin: 'https://www.linkedin.com',
      facebook: 'https://www.facebook.com',
      instagram: 'https://www.instagram.com',
      twitter: 'https://twitter.com'
    },
    tech: {
      soc2: false,
      financial: true,
      beneficiary: true
    }
  }
];

const campaignSeeds = [
  {
    ngoSlug: 'akshaya-patra',
    title: 'School Nutrition Drive - Rajajinagar Cluster',
    description: 'Support one academic year of nutritious meal support for children in Rajajinagar and neighbouring wards in Bengaluru.',
    category: 'Hunger',
    location: 'Rajajinagar, Bengaluru, Karnataka',
    area: 'Rajajinagar',
    coordinates: { lat: 13.0101, lng: 77.5511 },
    goalAmount: 2400000,
    currentAmount: 1185000,
    volunteersNeeded: ['Meal Packing', 'Route Coordination'],
    image: imageUrl('camp-akshaya-1', 1200, 760),
    gallery: [imageUrl('camp-akshaya-1a', 900, 600), imageUrl('camp-akshaya-1b', 900, 600), imageUrl('camp-akshaya-1c', 900, 600)],
    videoUrl: 'https://www.youtube.com/watch?v=8jPQjjsBbIc',
    highlights: ['Daily hot meals for government schools', 'Nutritional quality checks every week', 'Parent nutrition awareness sessions'],
    timeline: { startDate: '2026-01-15', endDate: '2026-12-15' },
    beneficiaryStats: { target: 9500, reached: 4700, householdsSupported: 3200, volunteersEngaged: 138 },
    testimonials: [
      { name: 'Deepa K', role: 'Teacher', quote: 'Children are more attentive in afternoon classes after meal support.' }
    ],
    coordinator: { name: 'Vivek R', phone: '9886001122', email: 'vivek@akshayapatra.org' },
    recognitions: ['Partnered with BBMP school nutrition cells'],
    updates: ['Q1 delivery coverage reached 52 schools', 'Two new distribution routes added in West Bengaluru']
  },
  {
    ngoSlug: 'akshaya-patra',
    title: 'Community Kitchen Volunteers - Bengaluru West',
    description: 'Join weekly volunteer shifts in central kitchens to improve pre-school meal readiness and distribution efficiency.',
    category: 'Children',
    location: 'Rajajinagar, Bengaluru, Karnataka',
    area: 'Bengaluru West',
    coordinates: { lat: 13.015, lng: 77.547 },
    goalAmount: 0,
    currentAmount: 0,
    volunteersNeeded: ['Kitchen Prep', 'Inventory Support', 'Nutrition Desk'],
    image: imageUrl('camp-akshaya-2', 1200, 760),
    gallery: [imageUrl('camp-akshaya-2a', 900, 600), imageUrl('camp-akshaya-2b', 900, 600)],
    videoUrl: 'https://www.youtube.com/watch?v=8jPQjjsBbIc',
    highlights: ['Weekend kitchen operations support', 'Volunteer orientation provided', 'Flexible half-day shifts'],
    timeline: { startDate: '2026-02-01', endDate: '2026-10-30' },
    beneficiaryStats: { target: 120, reached: 45, householdsSupported: 0, volunteersEngaged: 45 },
    testimonials: [
      { name: 'Arjun S', role: 'Volunteer', quote: 'The workflow is well organised and impactful even in short shifts.' }
    ],
    coordinator: { name: 'Madhavi N', phone: '9886001133', email: 'madhavi@akshayapatra.org' },
    recognitions: ['Volunteer service partner - Bengaluru City Civil Society Forum'],
    updates: ['New Saturday evening batch opened for working professionals']
  },
  {
    ngoSlug: 'samarthanam',
    title: 'Assistive Devices for Rural Students - Karnataka',
    description: 'Fund assistive kits, accessible study materials, and digital learning support for students with disabilities in Karnataka.',
    category: 'Disability Inclusion',
    location: 'HSR Layout, Bengaluru, Karnataka',
    area: 'HSR Layout',
    coordinates: { lat: 12.9141, lng: 77.6416 },
    goalAmount: 1800000,
    currentAmount: 865000,
    volunteersNeeded: ['Device Setup', 'Classroom Support'],
    image: imageUrl('camp-samarthanam-1', 1200, 760),
    gallery: [imageUrl('camp-samarthanam-1a', 900, 600), imageUrl('camp-samarthanam-1b', 900, 600)],
    videoUrl: 'https://www.youtube.com/watch?v=Jf6Wb8nJ4mQ',
    highlights: ['Accessible learning kits with orientation', 'District-level distribution planning', 'Parent guidance sessions'],
    timeline: { startDate: '2026-01-10', endDate: '2026-11-15' },
    beneficiaryStats: { target: 1800, reached: 760, householdsSupported: 760, volunteersEngaged: 64 },
    testimonials: [
      { name: 'Nikhil P', role: 'Parent', quote: 'My son could resume school classes after receiving assistive support.' }
    ],
    coordinator: { name: 'Apeksha T', phone: '9886002211', email: 'apeksha@samarthanam.org' },
    recognitions: ['Supported by Karnataka disability welfare network'],
    updates: ['First distribution cohort completed in Mysuru and Ramanagara']
  },
  {
    ngoSlug: 'samarthanam',
    title: 'Inclusive Sports Coaching Support - HSR Layout',
    description: 'Volunteer coaches and coordinators are needed for inclusive weekend sports sessions for youth with disabilities.',
    category: 'Skilling',
    location: 'HSR Layout, Bengaluru, Karnataka',
    area: 'HSR Layout',
    coordinates: { lat: 12.9135, lng: 77.6461 },
    goalAmount: 300000,
    currentAmount: 104000,
    volunteersNeeded: ['Sports Coaching', 'Event Coordination', 'Participant Safety'],
    image: imageUrl('camp-samarthanam-2', 1200, 760),
    gallery: [imageUrl('camp-samarthanam-2a', 900, 600), imageUrl('camp-samarthanam-2b', 900, 600)],
    videoUrl: 'https://www.youtube.com/watch?v=Jf6Wb8nJ4mQ',
    highlights: ['Inclusive football and athletics sessions', 'Coach training module included', 'Monthly inter-community meets'],
    timeline: { startDate: '2026-02-12', endDate: '2026-09-22' },
    beneficiaryStats: { target: 240, reached: 89, householdsSupported: 89, volunteersEngaged: 31 },
    testimonials: [
      { name: 'Keerthi V', role: 'Volunteer Coach', quote: 'The training toolkit made it easy to run inclusive sessions confidently.' }
    ],
    coordinator: { name: 'Rohit A', phone: '9886002222', email: 'rohit@samarthanam.org' },
    recognitions: ['Inclusion in Bengaluru adaptive sports consortium'],
    updates: ['Coaching batch-2 starts next month with expanded accessibility support']
  },
  {
    ngoSlug: 'parikrma',
    title: 'After-School Learning Labs - Jayanagar',
    description: 'Help set up structured after-school learning labs for children needing literacy and numeracy support.',
    category: 'Education',
    location: 'Jayanagar, Bengaluru, Karnataka',
    area: 'Jayanagar',
    coordinates: { lat: 12.943, lng: 77.585 },
    goalAmount: 1250000,
    currentAmount: 512000,
    volunteersNeeded: ['Math Mentoring', 'Reading Support'],
    image: imageUrl('camp-parikrma-1', 1200, 760),
    gallery: [imageUrl('camp-parikrma-1a', 900, 600), imageUrl('camp-parikrma-1b', 900, 600)],
    videoUrl: 'https://www.youtube.com/watch?v=x0sqY9RPG2A',
    highlights: ['Small group tutoring model', 'Monthly baseline and progress checks', 'Parent feedback meetings'],
    timeline: { startDate: '2026-01-20', endDate: '2026-12-05' },
    beneficiaryStats: { target: 1200, reached: 530, householdsSupported: 530, volunteersEngaged: 42 },
    testimonials: [
      { name: 'Neha S', role: 'Volunteer Mentor', quote: 'Children showed visible confidence in reading within a few weeks.' }
    ],
    coordinator: { name: 'Sonal B', phone: '9886003311', email: 'sonal@parikrmafoundation.org' },
    recognitions: ['Featured in Bengaluru School Partnership Summit 2025'],
    updates: ['Added two new evening lab batches in South Bengaluru']
  },
  {
    ngoSlug: 'parikrma',
    title: 'Reading Mentors for Grade 3 to 5 - South Bengaluru',
    description: 'Volunteer as a reading mentor and help children build fluency through structured weekly sessions.',
    category: 'Children',
    location: 'Jayanagar, Bengaluru, Karnataka',
    area: 'South Bengaluru',
    coordinates: { lat: 12.9298, lng: 77.5932 },
    goalAmount: 0,
    currentAmount: 0,
    volunteersNeeded: ['Reading Mentor', 'Library Desk'],
    image: imageUrl('camp-parikrma-2', 1200, 760),
    gallery: [imageUrl('camp-parikrma-2a', 900, 600), imageUrl('camp-parikrma-2b', 900, 600)],
    videoUrl: 'https://www.youtube.com/watch?v=x0sqY9RPG2A',
    highlights: ['Weekly guided reading circles', 'Bilingual story resources', 'Mentor handbook and onboarding'],
    timeline: { startDate: '2026-03-01', endDate: '2026-11-30' },
    beneficiaryStats: { target: 220, reached: 67, householdsSupported: 67, volunteersEngaged: 26 },
    testimonials: [
      { name: 'Aarav J', role: 'Student', quote: 'I now enjoy reading aloud in class.' }
    ],
    coordinator: { name: 'Pooja D', phone: '9886003322', email: 'pooja@parikrmafoundation.org' },
    recognitions: ['Aligned with Karnataka foundational literacy mission'],
    updates: ['Volunteer orientation now available on weekday evenings']
  },
  {
    ngoSlug: 'hasiru-dala',
    title: 'Dry Waste Collection Network - Bengaluru North',
    description: 'Expand ward-level dry waste collection points and improve material recovery capacity in Bengaluru North.',
    category: 'Environment',
    location: 'Yeshwanthpur, Bengaluru, Karnataka',
    area: 'Bengaluru North',
    coordinates: { lat: 13.0292, lng: 77.5579 },
    goalAmount: 980000,
    currentAmount: 401000,
    volunteersNeeded: ['Ward Outreach', 'Segregation Audits'],
    image: imageUrl('camp-hasiru-1', 1200, 760),
    gallery: [imageUrl('camp-hasiru-1a', 900, 600), imageUrl('camp-hasiru-1b', 900, 600)],
    videoUrl: 'https://www.youtube.com/watch?v=8VumjI7xY1g',
    highlights: ['Doorstep awareness sessions', 'Ward-level segregation audits', 'Worker safety and PPE support'],
    timeline: { startDate: '2026-01-05', endDate: '2026-10-25' },
    beneficiaryStats: { target: 18000, reached: 8100, householdsSupported: 8100, volunteersEngaged: 73 },
    testimonials: [
      { name: 'Kiran M', role: 'Resident Welfare Member', quote: 'Our apartment waste quality score improved within two months.' }
    ],
    coordinator: { name: 'Sanjana K', phone: '9886004411', email: 'sanjana@hasirudala.in' },
    recognitions: ['Partner program with BWSSB citizen networks'],
    updates: ['Three additional wards onboarded in Q2']
  },
  {
    ngoSlug: 'hasiru-dala',
    title: 'Ward-level Waste Segregation Champions - Yeshwanthpur',
    description: 'Volunteer to lead neighbourhood-level awareness and support accurate dry/wet waste segregation.',
    category: 'Urban Sanitation',
    location: 'Yeshwanthpur, Bengaluru, Karnataka',
    area: 'Yeshwanthpur',
    coordinates: { lat: 13.0257, lng: 77.5541 },
    goalAmount: 0,
    currentAmount: 0,
    volunteersNeeded: ['Community Mobilisation', 'Data Logging', 'Resident Training'],
    image: imageUrl('camp-hasiru-2', 1200, 760),
    gallery: [imageUrl('camp-hasiru-2a', 900, 600), imageUrl('camp-hasiru-2b', 900, 600)],
    videoUrl: 'https://www.youtube.com/watch?v=8VumjI7xY1g',
    highlights: ['Micro-ward volunteer squads', 'Monthly waste quality dashboards', 'Resident engagement toolkits'],
    timeline: { startDate: '2026-02-18', endDate: '2026-09-15' },
    beneficiaryStats: { target: 140, reached: 54, householdsSupported: 0, volunteersEngaged: 54 },
    testimonials: [
      { name: 'Chinmayi R', role: 'Volunteer Champion', quote: 'The program made citizen engagement structured and measurable.' }
    ],
    coordinator: { name: 'Pavan H', phone: '9886004422', email: 'pavan@hasirudala.in' },
    recognitions: ['Recognised by ward committees for civic engagement'],
    updates: ['Volunteer leaderboard introduced for ward participation']
  },
  {
    ngoSlug: 'swasthya-karnataka',
    title: 'Mobile Health Camps - Mysuru & Mandya',
    description: 'Fund recurring mobile health camps for preventive screenings and essential medicine support in rural clusters.',
    category: 'Health',
    location: 'Nazarbad, Mysuru, Karnataka',
    area: 'Mysuru-Mandya Corridor',
    coordinates: { lat: 12.3076, lng: 76.6552 },
    goalAmount: 1600000,
    currentAmount: 705000,
    volunteersNeeded: ['Camp Registration', 'Patient Navigation'],
    image: imageUrl('camp-swasthya-1', 1200, 760),
    gallery: [imageUrl('camp-swasthya-1a', 900, 600), imageUrl('camp-swasthya-1b', 900, 600)],
    videoUrl: 'https://www.youtube.com/watch?v=Q4XdqgXJYjE',
    highlights: ['High blood pressure and diabetes screenings', 'Referral pathways to district hospitals', 'Follow-up through telehealth'],
    timeline: { startDate: '2026-01-25', endDate: '2026-12-20' },
    beneficiaryStats: { target: 24000, reached: 10300, householdsSupported: 6400, volunteersEngaged: 57 },
    testimonials: [
      { name: 'Shankar L', role: 'Camp Beneficiary', quote: 'I got diagnosed early and started treatment immediately.' }
    ],
    coordinator: { name: 'Dr. Ritu S', phone: '9886005511', email: 'ritu@swasthyakarnataka.org' },
    recognitions: ['District health outreach collaboration partner'],
    updates: ['Expanded camp routes to two additional PHC catchments']
  },
  {
    ngoSlug: 'swasthya-karnataka',
    title: 'Rural Telemedicine Volunteers - Mysuru',
    description: 'Volunteer to assist elderly patients and families with teleconsultation workflows and follow-up planning.',
    category: 'Medical Support',
    location: 'Mysuru, Karnataka',
    area: 'Mysuru',
    coordinates: { lat: 12.3134, lng: 76.6578 },
    goalAmount: 0,
    currentAmount: 0,
    volunteersNeeded: ['Telemedicine Desk', 'Follow-up Coordination'],
    image: imageUrl('camp-swasthya-2', 1200, 760),
    gallery: [imageUrl('camp-swasthya-2a', 900, 600), imageUrl('camp-swasthya-2b', 900, 600)],
    videoUrl: 'https://www.youtube.com/watch?v=Q4XdqgXJYjE',
    highlights: ['Senior citizen-friendly telehealth support', 'Language-assisted patient triage', 'Referral tracking and reminders'],
    timeline: { startDate: '2026-02-05', endDate: '2026-10-15' },
    beneficiaryStats: { target: 260, reached: 92, householdsSupported: 92, volunteersEngaged: 37 },
    testimonials: [
      { name: 'Anusha P', role: 'Volunteer', quote: 'Guiding first-time teleconsultation users has been very meaningful.' }
    ],
    coordinator: { name: 'Sathish M', phone: '9886005522', email: 'sathish@swasthyakarnataka.org' },
    recognitions: ['Community digital health pilot partner'],
    updates: ['Weekend volunteer shift added for students']
  },
  {
    ngoSlug: 'namma-mahila-shakti',
    title: 'Women Entrepreneurship Kits - Electronic City',
    description: 'Provide starter kits, business mentoring, and digital payments onboarding for women-led home enterprises.',
    category: 'Women',
    location: 'Electronic City, Bengaluru, Karnataka',
    area: 'Electronic City Phase 1',
    coordinates: { lat: 12.8456, lng: 77.6603 },
    goalAmount: 1250000,
    currentAmount: 630000,
    volunteersNeeded: ['Market Linkage', 'Business Mentoring'],
    image: imageUrl('camp-mahila-1', 1200, 760),
    gallery: [imageUrl('camp-mahila-1a', 900, 600), imageUrl('camp-mahila-1b', 900, 600)],
    videoUrl: 'https://www.youtube.com/watch?v=qth5q5wR8mc',
    highlights: ['Starter kit plus micro-business training', 'Weekly mentorship circles', 'Local market demo events'],
    timeline: { startDate: '2026-01-12', endDate: '2026-11-28' },
    beneficiaryStats: { target: 950, reached: 418, householdsSupported: 418, volunteersEngaged: 51 },
    testimonials: [
      { name: 'Rekha N', role: 'Business Cohort Member', quote: 'I started taking digital orders after the program training.' }
    ],
    coordinator: { name: 'Farah N', phone: '9886006611', email: 'farah@nammamahila.org' },
    recognitions: ['Women entrepreneurship support from local industry cluster'],
    updates: ['Q2 cohort opened in Bommanahalli and HSR fringe areas']
  },
  {
    ngoSlug: 'namma-mahila-shakti',
    title: 'Self-Defense Weekend Sessions - Bommanahalli',
    description: 'Volunteer trainers and coordinators needed for neighbourhood self-defense and safety rights workshops.',
    category: 'Human Rights',
    location: 'Bommanahalli, Bengaluru, Karnataka',
    area: 'Bommanahalli',
    coordinates: { lat: 12.8915, lng: 77.6243 },
    goalAmount: 260000,
    currentAmount: 101000,
    volunteersNeeded: ['Self-Defense Trainer', 'Session Coordination', 'Legal Awareness Support'],
    image: imageUrl('camp-mahila-2', 1200, 760),
    gallery: [imageUrl('camp-mahila-2a', 900, 600), imageUrl('camp-mahila-2b', 900, 600)],
    videoUrl: 'https://www.youtube.com/watch?v=qth5q5wR8mc',
    highlights: ['Weekend community sessions', 'Emergency contact literacy', 'Local response network mapping'],
    timeline: { startDate: '2026-03-03', endDate: '2026-10-12' },
    beneficiaryStats: { target: 380, reached: 144, householdsSupported: 144, volunteersEngaged: 33 },
    testimonials: [
      { name: 'Pavithra R', role: 'Participant', quote: 'These sessions made me more confident about personal safety.' }
    ],
    coordinator: { name: 'Jyoti M', phone: '9886006622', email: 'jyoti@nammamahila.org' },
    recognitions: ['Supported by Bengaluru women safety forum'],
    updates: ['Two new partner schools onboarded for youth sessions']
  },
  {
    ngoSlug: 'kodagu-flood-resilience',
    title: 'Monsoon Preparedness Kits - Madikeri',
    description: 'Fund pre-monsoon family preparedness kits and local storage points in vulnerable Kodagu settlements.',
    category: 'Disaster Relief',
    location: 'Madikeri, Kodagu, Karnataka',
    area: 'Madikeri',
    coordinates: { lat: 12.4244, lng: 75.7382 },
    goalAmount: 980000,
    currentAmount: 482000,
    volunteersNeeded: ['Kit Assembly', 'Village Distribution Support'],
    image: imageUrl('camp-kodagu-1', 1200, 760),
    gallery: [imageUrl('camp-kodagu-1a', 900, 600), imageUrl('camp-kodagu-1b', 900, 600)],
    videoUrl: 'https://www.youtube.com/watch?v=ayKg2LFy0i4',
    highlights: ['Preparedness kits mapped by risk category', 'Village-level storage and replenishment plan', 'Monsoon drill support'],
    timeline: { startDate: '2026-01-30', endDate: '2026-08-30' },
    beneficiaryStats: { target: 5400, reached: 2200, householdsSupported: 2200, volunteersEngaged: 76 },
    testimonials: [
      { name: 'Girish N', role: 'Village Volunteer', quote: 'Pre-positioning supplies made a huge difference during heavy rainfall.' }
    ],
    coordinator: { name: 'Anita P', phone: '9886007711', email: 'anita@kodaguresilience.org' },
    recognitions: ['Recognised in district disaster preparedness review'],
    updates: ['Completed first drill cycle across 12 panchayats']
  },
  {
    ngoSlug: 'kodagu-flood-resilience',
    title: 'Community Emergency Response Team - Kodagu',
    description: 'Volunteer for emergency response training, communication support, and panchayat-level coordination.',
    category: 'Rural Development',
    location: 'Somwarpet, Kodagu, Karnataka',
    area: 'Kodagu Highlands',
    coordinates: { lat: 12.5938, lng: 75.849 },
    goalAmount: 180000,
    currentAmount: 73000,
    volunteersNeeded: ['Emergency Response Training', 'Field Communications', 'Relief Logistics'],
    image: imageUrl('camp-kodagu-2', 1200, 760),
    gallery: [imageUrl('camp-kodagu-2a', 900, 600), imageUrl('camp-kodagu-2b', 900, 600)],
    videoUrl: 'https://www.youtube.com/watch?v=ayKg2LFy0i4',
    highlights: ['Village response team simulations', 'Early warning communication drills', 'Relief logistics route planning'],
    timeline: { startDate: '2026-02-10', endDate: '2026-09-10' },
    beneficiaryStats: { target: 300, reached: 117, householdsSupported: 0, volunteersEngaged: 117 },
    testimonials: [
      { name: 'Divya K', role: 'Response Team Volunteer', quote: 'Team drills helped us coordinate faster and more safely.' }
    ],
    coordinator: { name: 'Sudarshan K', phone: '9886007722', email: 'sudarshan@kodaguresilience.org' },
    recognitions: ['District-level resilience volunteer partner'],
    updates: ['New radio communication module rolled out in pilot villages']
  },
  {
    ngoSlug: 'north-karnataka-water',
    title: 'Village Water Quality Testing - Hubballi Dharwad',
    description: 'Support monthly water quality testing and community dashboards in villages around Hubballi and Dharwad.',
    category: 'Environment',
    location: 'Hubballi, Dharwad, Karnataka',
    area: 'Hubballi-Dharwad',
    coordinates: { lat: 15.3647, lng: 75.1221 },
    goalAmount: 720000,
    currentAmount: 314000,
    volunteersNeeded: ['Water Sample Collection', 'Data Entry Support'],
    image: imageUrl('camp-water-1', 1200, 760),
    gallery: [imageUrl('camp-water-1a', 900, 600), imageUrl('camp-water-1b', 900, 600)],
    videoUrl: 'https://www.youtube.com/watch?v=uyDGfueQ49w',
    highlights: ['Monthly sample testing protocol', 'Public water quality scoreboards', 'Village safety awareness sessions'],
    timeline: { startDate: '2026-01-18', endDate: '2026-11-18' },
    beneficiaryStats: { target: 19000, reached: 7900, householdsSupported: 7900, volunteersEngaged: 49 },
    testimonials: [
      { name: 'Hanumant P', role: 'Panchayat Secretary', quote: 'Water reports are now discussed in monthly village meetings.' }
    ],
    coordinator: { name: 'Megha H', phone: '9886008811', email: 'megha@nkwc.org' },
    recognitions: ['District environmental monitoring partner'],
    updates: ['Testing expanded to 24 new borewell clusters']
  },
  {
    ngoSlug: 'north-karnataka-water',
    title: 'River Clean-up Drives - Unkal Lake',
    description: 'Join volunteer clean-up drives and awareness events around Unkal Lake and connected streams.',
    category: 'Health',
    location: 'Unkal Lake, Hubballi, Karnataka',
    area: 'Unkal Lake',
    coordinates: { lat: 15.3574, lng: 75.1152 },
    goalAmount: 0,
    currentAmount: 0,
    volunteersNeeded: ['Clean-up Drive', 'Community Outreach', 'Waste Segregation Desk'],
    image: imageUrl('camp-water-2', 1200, 760),
    gallery: [imageUrl('camp-water-2a', 900, 600), imageUrl('camp-water-2b', 900, 600)],
    videoUrl: 'https://www.youtube.com/watch?v=uyDGfueQ49w',
    highlights: ['Monthly citizen clean-up drives', 'School awareness participation', 'Waste segregation demos near waterbodies'],
    timeline: { startDate: '2026-02-20', endDate: '2026-10-20' },
    beneficiaryStats: { target: 360, reached: 129, householdsSupported: 0, volunteersEngaged: 129 },
    testimonials: [
      { name: 'Sharada M', role: 'Volunteer', quote: 'The drives helped bring schools and residents together for local action.' }
    ],
    coordinator: { name: 'Prakash B', phone: '9886008822', email: 'prakash@nkwc.org' },
    recognitions: ['Featured in Hubballi civic participation bulletin'],
    updates: ['New student volunteer chapters launched in 4 colleges']
  },
  {
    ngoSlug: 'namma-lake-guardians',
    title: 'Bellandur Lake Restoration Sprint 2026',
    description: 'Support shoreline clean-up, invasive plant removal, and citizen water-quality tracking around Bellandur Lake.',
    category: 'Environment',
    location: 'Bellandur, Bengaluru, Karnataka',
    area: 'Bellandur Lake',
    coordinates: { lat: 12.9306, lng: 77.6764 },
    goalAmount: 900000,
    currentAmount: 210000,
    volunteersNeeded: ['Lake Clean-up Drive', 'Water Testing', 'Community Outreach'],
    image: imageUrl('camp-nlg-1', 1200, 760),
    gallery: [imageUrl('camp-nlg-1a', 900, 600), imageUrl('camp-nlg-1b', 900, 600)],
    videoUrl: 'https://www.youtube.com/watch?v=uyDGfueQ49w',
    highlights: ['Monthly cleanups with SOPs', 'Citizen water sampling kits', 'Waste hotspot mapping'],
    timeline: { startDate: '2026-02-05', endDate: '2026-11-30' },
    beneficiaryStats: { target: 2500, reached: 820, householdsSupported: 0, volunteersEngaged: 190 },
    testimonials: [
      { name: 'Karthika N', role: 'Volunteer Lead', quote: 'Data + action keeps the community engaged beyond one cleanup.' }
    ],
    coordinator: { name: 'Shreya K', phone: '9886009333', email: 'shreya@nammalakeguardians.org' },
    recognitions: ['Supported by local lake committees'],
    updates: ['Two new waste inflow points mapped and escalated', 'Sampling expanded to 6 shoreline stations']
  },
  {
    ngoSlug: 'bengaluru-digital-literacy',
    title: 'Digital Literacy Bootcamp - KR Puram',
    description: 'Fund and volunteer for a 6-week digital literacy bootcamp for job seekers and women learners in KR Puram.',
    category: 'Education',
    location: 'KR Puram, Bengaluru, Karnataka',
    area: 'KR Puram',
    coordinates: { lat: 13.0076, lng: 77.6954 },
    goalAmount: 450000,
    currentAmount: 98000,
    volunteersNeeded: ['Mentorship', 'Laptop Refurbishment', 'Training Coordinator'],
    image: imageUrl('camp-bdlm-1', 1200, 760),
    gallery: [imageUrl('camp-bdlm-1a', 900, 600), imageUrl('camp-bdlm-1b', 900, 600)],
    videoUrl: 'https://www.youtube.com/watch?v=8jPQjjsBbIc',
    highlights: ['Hands-on lab sessions', 'Resume + interview prep', 'Placement partner referrals'],
    timeline: { startDate: '2026-02-12', endDate: '2026-08-12' },
    beneficiaryStats: { target: 420, reached: 110, householdsSupported: 90, volunteersEngaged: 62 },
    testimonials: [
      { name: 'Suma J', role: 'Bootcamp Participant', quote: 'I learned to apply online and prepare for interviews with confidence.' }
    ],
    coordinator: { name: 'Ravi S', phone: '9886009444', email: 'ravi@bdmission.org' },
    recognitions: ['NSDC-aligned curriculum partner'],
    updates: ['New placement MoU signed with 3 local employers', 'Refurbished device pool expanded to 120 laptops']
  },
  {
    ngoSlug: 'womenworks-bengaluru',
    title: 'Women Micro-Enterprise Accelerator - Jayanagar',
    description: 'Support micro-enterprises with mentoring, bookkeeping help, and market linkage support for women-led businesses.',
    category: 'Livelihood',
    location: 'Jayanagar, Bengaluru, Karnataka',
    area: 'Jayanagar',
    coordinates: { lat: 12.9279, lng: 77.5838 },
    goalAmount: 650000,
    currentAmount: 187000,
    volunteersNeeded: ['Business Mentoring', 'Design', 'Market Linkage Support'],
    image: imageUrl('camp-wwb-1', 1200, 760),
    gallery: [imageUrl('camp-wwb-1a', 900, 600), imageUrl('camp-wwb-1b', 900, 600)],
    videoUrl: 'https://www.youtube.com/watch?v=8jPQjjsBbIc',
    highlights: ['Mentorship circles every fortnight', 'Digital commerce onboarding', 'Financial literacy support'],
    timeline: { startDate: '2026-01-28', endDate: '2026-10-28' },
    beneficiaryStats: { target: 260, reached: 92, householdsSupported: 92, volunteersEngaged: 44 },
    testimonials: [
      { name: 'Farzana A', role: 'Entrepreneur', quote: 'Market linkages helped me reach new customers consistently.' }
    ],
    coordinator: { name: 'Sneha V', phone: '9886009555', email: 'sneha@womenworksblr.org' },
    recognitions: ['Recognised by local SHG federations'],
    updates: ['New e-commerce onboarding batch started', 'Mentor network expanded with 12 volunteers']
  },
  {
    ngoSlug: 'swasthya-seva-bengaluru',
    title: 'Community Health Camps - Whitefield',
    description: 'Run preventive screening camps and follow-up support for families in Whitefield and Mahadevapura.',
    category: 'Health',
    location: 'Whitefield, Bengaluru, Karnataka',
    area: 'Whitefield',
    coordinates: { lat: 12.9698, lng: 77.7509 },
    goalAmount: 380000,
    currentAmount: 124000,
    volunteersNeeded: ['Patient Registration Desk', 'Pharmacy Support', 'Health Awareness'],
    image: imageUrl('camp-ssh-1', 1200, 760),
    gallery: [imageUrl('camp-ssh-1a', 900, 600), imageUrl('camp-ssh-1b', 900, 600)],
    videoUrl: 'https://www.youtube.com/watch?v=8jPQjjsBbIc',
    highlights: ['Diabetes + BP screening', 'Referral support', 'Nutrition guidance sessions'],
    timeline: { startDate: '2026-02-01', endDate: '2026-09-01' },
    beneficiaryStats: { target: 2400, reached: 680, householdsSupported: 520, volunteersEngaged: 78 },
    testimonials: [
      { name: 'Dr. Sunil K', role: 'Partner Doctor', quote: 'Structured follow-ups significantly improved adherence to referrals.' }
    ],
    coordinator: { name: 'Harish P', phone: '9886009666', email: 'harish@swasthyaseva.org' },
    recognitions: ['Partnered with local clinics for referrals'],
    updates: ['Two new screening sites onboarded in Mahadevapura', 'Follow-up helpline expanded to evening hours']
  },
  {
    ngoSlug: 'accessible-bengaluru',
    title: 'Accessible Transport Audits - Metro & Bus Stops',
    description: 'Volunteer to audit transport hubs and build a public issue tracker for accessibility improvements.',
    category: 'Human Rights',
    location: 'Indiranagar, Bengaluru, Karnataka',
    area: 'Indiranagar',
    coordinates: { lat: 12.9784, lng: 77.6403 },
    goalAmount: 0,
    currentAmount: 0,
    volunteersNeeded: ['Accessibility Audit', 'Data Entry Support', 'Photography & Documentation'],
    image: imageUrl('camp-abi-1', 1200, 760),
    gallery: [imageUrl('camp-abi-1a', 900, 600), imageUrl('camp-abi-1b', 900, 600)],
    videoUrl: 'https://www.youtube.com/watch?v=uyDGfueQ49w',
    highlights: ['Standardized audit checklist', 'Public issue tracker dashboards', 'Civic follow-up support'],
    timeline: { startDate: '2026-02-08', endDate: '2026-12-08' },
    beneficiaryStats: { target: 140, reached: 28, householdsSupported: 0, volunteersEngaged: 28 },
    testimonials: [
      { name: 'Neelima S', role: 'Founder', quote: 'Good audits create a clear backlog for improvement and follow-up.' }
    ],
    coordinator: { name: 'Prashanth J', phone: '9886009777', email: 'prashanth@accessiblebengaluru.org' },
    recognitions: ['Shared with civic stakeholders as a baseline report'],
    updates: ['Checklist updated for signage and tactile path gaps', 'First audit wave started in 3 metro corridors']
  },
  {
    ngoSlug: 'namma-street-care',
    title: 'Segregation Champions - Shivajinagar Ward',
    description: 'Support waste segregation awareness and clean-market interventions with ward-level volunteer champions.',
    category: 'Urban Sanitation',
    location: 'Shivajinagar, Bengaluru, Karnataka',
    area: 'Shivajinagar',
    coordinates: { lat: 12.9836, lng: 77.6046 },
    goalAmount: 250000,
    currentAmount: 64000,
    volunteersNeeded: ['Door-to-door Outreach', 'Waste Segregation Desk', 'Event Volunteering'],
    image: imageUrl('camp-nsc-1', 1200, 760),
    gallery: [imageUrl('camp-nsc-1a', 900, 600), imageUrl('camp-nsc-1b', 900, 600)],
    videoUrl: 'https://www.youtube.com/watch?v=uyDGfueQ49w',
    highlights: ['Vendor cluster onboarding', 'Ward-level cleanup events', 'Segregation SOP demos'],
    timeline: { startDate: '2026-01-25', endDate: '2026-07-25' },
    beneficiaryStats: { target: 1200, reached: 310, householdsSupported: 240, volunteersEngaged: 52 },
    testimonials: [
      { name: 'Imran K', role: 'Market Association', quote: 'Compliance improved after we started daily checklist-based collection.' }
    ],
    coordinator: { name: 'Kiran B', phone: '9886009888', email: 'kiran@nammastreetcare.org' },
    recognitions: ['BBMP clean ward collaboration'],
    updates: ['New vendor onboarding kits distributed', 'Pilot ward scorecard launched with partners']
  },
  {
    ngoSlug: 'bengaluru-food-rescue',
    title: 'Surplus Food Redistribution - Koramangala',
    description: 'Fund safe logistics and volunteer shifts to rescue surplus meals and deliver to partner shelters in Bengaluru.',
    category: 'Hunger',
    location: 'Koramangala, Bengaluru, Karnataka',
    area: 'Koramangala',
    coordinates: { lat: 12.9352, lng: 77.6245 },
    goalAmount: 520000,
    currentAmount: 156000,
    volunteersNeeded: ['Pickup Logistics', 'Kitchen Sorting', 'Recipient Coordination'],
    image: imageUrl('camp-bfra-1', 1200, 760),
    gallery: [imageUrl('camp-bfra-1a', 900, 600), imageUrl('camp-bfra-1b', 900, 600)],
    videoUrl: 'https://www.youtube.com/watch?v=8jPQjjsBbIc',
    highlights: ['Daily pickup routes', 'Food safety SOP', 'Partner shelter distribution'],
    timeline: { startDate: '2026-02-03', endDate: '2026-12-03' },
    beneficiaryStats: { target: 56000, reached: 18200, householdsSupported: 7800, volunteersEngaged: 96 },
    testimonials: [
      { name: 'Joseph M', role: 'Shelter Coordinator', quote: 'Daily deliveries improved meal consistency for our residents.' }
    ],
    coordinator: { name: 'Anusha R', phone: '9886010123', email: 'anusha@bengalurufoodrescue.org' },
    recognitions: ['Featured in Bengaluru food waste reduction bulletin'],
    updates: ['New pickup partner onboarded in Koramangala', 'Cold storage pilot launched for weekend routes']
  }
];

const sampleUsers = [
  { name: 'Rahul Kumar', email: 'rahul@example.com', mobileNumber: '9999999999', location: 'Koramangala, Bengaluru, Karnataka' },
  { name: 'Ananya Reddy', email: 'ananya.reddy@example.com', mobileNumber: '9886512345', location: 'Indiranagar, Bengaluru, Karnataka' },
  { name: 'Karthik Bhat', email: 'karthik.bhat@example.com', mobileNumber: '9886523456', location: 'Rajajinagar, Bengaluru, Karnataka' },
  { name: 'Priya Shetty', email: 'priya.shetty@example.com', mobileNumber: '9886534567', location: 'Jayanagar, Bengaluru, Karnataka' },
  { name: 'Naveen Gowda', email: 'naveen.gowda@example.com', mobileNumber: '9886545678', location: 'Whitefield, Bengaluru, Karnataka' },
  { name: 'Divya Nair', email: 'divya.nair@example.com', mobileNumber: '9886556789', location: 'HSR Layout, Bengaluru, Karnataka' },
  { name: 'Sandeep Rao', email: 'sandeep.rao@example.com', mobileNumber: '9886567890', location: 'Marathahalli, Bengaluru, Karnataka' },
  { name: 'Aishwarya Pai', email: 'aishwarya.pai@example.com', mobileNumber: '9886578901', location: 'Malleshwaram, Bengaluru, Karnataka' },
  { name: 'Rohan Kulkarni', email: 'rohan.kulkarni@example.com', mobileNumber: '9886589012', location: 'BTM Layout, Bengaluru, Karnataka' },
  { name: 'Meera Hegde', email: 'meera.hegde@example.com', mobileNumber: '9886590123', location: 'Bellandur, Bengaluru, Karnataka' },
  { name: 'Sahana Iyer', email: 'sahana.iyer@example.com', mobileNumber: '9886600001', location: 'Indiranagar, Bengaluru, Karnataka' },
  { name: 'Aditya Narayan', email: 'aditya.narayan@example.com', mobileNumber: '9886600002', location: 'Koramangala, Bengaluru, Karnataka' },
  { name: 'Nisha Kulkarni', email: 'nisha.kulkarni@example.com', mobileNumber: '9886600003', location: 'Whitefield, Bengaluru, Karnataka' },
  { name: 'Mohammed Faiz', email: 'mohammed.faiz@example.com', mobileNumber: '9886600004', location: 'Shivajinagar, Bengaluru, Karnataka' },
  { name: 'Harini Rao', email: 'harini.rao@example.com', mobileNumber: '9886600005', location: 'Jayanagar, Bengaluru, Karnataka' },
  { name: 'Siddharth Menon', email: 'siddharth.menon@example.com', mobileNumber: '9886600006', location: 'HSR Layout, Bengaluru, Karnataka' },
  { name: 'Pooja Desai', email: 'pooja.desai@example.com', mobileNumber: '9886600007', location: 'Marathahalli, Bengaluru, Karnataka' },
  { name: 'Vikram Shetty', email: 'vikram.shetty@example.com', mobileNumber: '9886600008', location: 'Malleshwaram, Bengaluru, Karnataka' },
  { name: 'Keerthana Prasad', email: 'keerthana.prasad@example.com', mobileNumber: '9886600009', location: 'Basavanagudi, Bengaluru, Karnataka' },
  { name: 'Arjun Kulkarni', email: 'arjun.kulkarni@example.com', mobileNumber: '9886600010', location: 'JP Nagar, Bengaluru, Karnataka' },
  { name: 'Aditi Shenoy', email: 'aditi.shenoy@example.com', mobileNumber: '9886600011', location: 'Banashankari, Bengaluru, Karnataka' },
  { name: 'Ritesh Gupta', email: 'ritesh.gupta@example.com', mobileNumber: '9886600012', location: 'Electronic City, Bengaluru, Karnataka' },
  { name: 'Shalini N', email: 'shalini.n@example.com', mobileNumber: '9886600013', location: 'Yelahanka, Bengaluru, Karnataka' },
  { name: 'Ganesh Hegde', email: 'ganesh.hegde@example.com', mobileNumber: '9886600014', location: 'RT Nagar, Bengaluru, Karnataka' },
  { name: 'Neha Joshi', email: 'neha.joshi@example.com', mobileNumber: '9886600015', location: 'Kengeri, Bengaluru, Karnataka' },
  { name: 'Srikant R', email: 'srikant.r@example.com', mobileNumber: '9886600016', location: 'Vijayanagar, Bengaluru, Karnataka' },
  { name: 'Deepika S', email: 'deepika.s@example.com', mobileNumber: '9886600017', location: 'Hebbal, Bengaluru, Karnataka' },
  { name: 'Ajay Rao', email: 'ajay.rao@example.com', mobileNumber: '9886600018', location: 'Rajajinagar, Bengaluru, Karnataka' },
  { name: 'Swathi Pai', email: 'swathi.pai@example.com', mobileNumber: '9886600019', location: 'MG Road, Bengaluru, Karnataka' },
  { name: 'Ishaan Bhat', email: 'ishaan.bhat@example.com', mobileNumber: '9886600020', location: 'BTM Layout, Bengaluru, Karnataka' },
  { name: 'Meghana S', email: 'meghana.s@example.com', mobileNumber: '9886600021', location: 'Sarjapur Road, Bengaluru, Karnataka' },
  { name: 'Pranav Jain', email: 'pranav.jain@example.com', mobileNumber: '9886600022', location: 'Bellandur, Bengaluru, Karnataka' },
  { name: 'Lavanya K', email: 'lavanya.k@example.com', mobileNumber: '9886600023', location: 'Ulsoor, Bengaluru, Karnataka' },
  { name: 'Rohit S', email: 'rohit.s@example.com', mobileNumber: '9886600024', location: 'KR Puram, Bengaluru, Karnataka' },
  { name: 'Sneha Iyer', email: 'sneha.iyer@example.com', mobileNumber: '9886600025', location: 'Hoodi, Bengaluru, Karnataka' },
  { name: 'Manoj Kumar', email: 'manoj.kumar2@example.com', mobileNumber: '9886600026', location: 'Arekere, Bengaluru, Karnataka' },
  { name: 'Sowmya R', email: 'sowmya.r@example.com', mobileNumber: '9886600027', location: 'Sanjaynagar, Bengaluru, Karnataka' },
  { name: 'Ankit Verma', email: 'ankit.verma@example.com', mobileNumber: '9886600028', location: 'Peenya, Bengaluru, Karnataka' },
  { name: 'Fathima S', email: 'fathima.s@example.com', mobileNumber: '9886600029', location: 'Frazer Town, Bengaluru, Karnataka' },
  { name: 'Chinmay Shekhar', email: 'chinmay.shekhar@example.com', mobileNumber: '9886600030', location: 'Kadugodi, Bengaluru, Karnataka' },
  { name: 'Tanvi Kulkarni', email: 'tanvi.kulkarni@example.com', mobileNumber: '9886600031', location: 'Domlur, Bengaluru, Karnataka' },
  { name: 'Kavya R', email: 'kavya.r@example.com', mobileNumber: '9886600032', location: 'Kalyan Nagar, Bengaluru, Karnataka' },
  { name: 'Sanjana M', email: 'sanjana.m@example.com', mobileNumber: '9886600033', location: 'Nagarbhavi, Bengaluru, Karnataka' },
  { name: 'Abhishek Rao', email: 'abhishek.rao@example.com', mobileNumber: '9886600034', location: 'Hennur, Bengaluru, Karnataka' },
  { name: 'Prisha Nair', email: 'prisha.nair@example.com', mobileNumber: '9886600035', location: 'Cooke Town, Bengaluru, Karnataka' }
];

const categoryNames = [
  'Education',
  'Health',
  'Environment',
  'Hunger',
  'Women',
  'Children',
  'Disaster Relief',
  'Rural Development',
  'Livelihood',
  'Disability Inclusion',
  'Skilling',
  'Medical Support',
  'Urban Sanitation',
  'Human Rights'
];

const buildVolunteerApplicants = (users, includeRahul = false) => {
  const selected = faker.helpers.arrayElements(users, faker.number.int({ min: 0, max: 4 }));
  const ids = selected.map((u) => u.id.toString());
  if (includeRahul) {
    const rahul = users.find((u) => u.email === 'rahul@example.com');
    if (rahul) ids.push(rahul.id.toString());
  }
  return [...new Set(ids)];
};

const seedDatabase = async () => {
  try {
    await connectDB(process.env.POSTGRES_URL || process.env.DATABASE_URL);

    await Promise.all([
      User.deleteMany({}),
      NGO.deleteMany({}),
      Campaign.deleteMany({}),
      VolunteerOpportunity.deleteMany({}),
      Category.deleteMany({})
    ]);

    console.log('🧹 Cleared existing data');

    const hashedPassword = await bcrypt.hash('password123', 10);

    const users = sampleUsers.map((user, index) => ({
      ...user,
      password: hashedPassword,
      role: 'user',
      interests: faker.helpers.arrayElements(['Education', 'Health', 'Environment', 'Women', 'Children', 'Rural Development'], 2),
      skills: faker.helpers.arrayElements(['Teaching', 'Fundraising', 'Design', 'Operations', 'Healthcare Support', 'Mentoring'], 2),
      location: user.location || (index % 2 === 0 ? 'Bengaluru, Karnataka' : 'Karnataka')
    }));

    const createdUsers = await User.insertMany(users);
    const rahulUser = createdUsers.find((user) => user.email === 'rahul@example.com');
    console.log(`✅ Created ${createdUsers.length} sample users`);

    await Category.insertMany(categoryNames.map((name) => ({ name })));
    console.log(`✅ Created ${categoryNames.length} categories`);

    const ngoPayload = ngoSeeds.map((seed) => ({
      ...seed,
      password: hashedPassword,
      role: 'ngo',
      category: seed.categories[0],
      verified: true,
      isActive: true
    }));

    const createdNgos = await NGO.insertMany(ngoPayload);
    console.log(`✅ Created ${createdNgos.length} Karnataka-focused NGOs`);

    const ngoBySlug = Object.fromEntries(
      createdNgos.map((ngo) => {
        const match = ngoSeeds.find((seed) => seed.email === ngo.email);
        return [match?.slug, ngo];
      })
    );

    const campaignPayload = campaignSeeds.map((seed) => {
      const ngo = ngoBySlug[seed.ngoSlug];
      // Keep seed campaigns free of user-joined state so local dev flows are predictable.
      const volunteerIds = [];

      return {
        ngo: ngo?.id,
        title: seed.title,
        description: seed.description,
        image: seed.image,
        gallery: seed.gallery,
        videoUrl: seed.videoUrl,
        category: seed.category,
        location: seed.location,
        area: seed.area,
        coordinates: seed.coordinates,
        goalAmount: seed.goalAmount,
        currentAmount: seed.currentAmount,
        volunteersNeeded: seed.volunteersNeeded,
        volunteers: volunteerIds,
        highlights: seed.highlights,
        timeline: {
          startDate: new Date(seed.timeline.startDate),
          endDate: new Date(seed.timeline.endDate)
        },
        beneficiaryStats: seed.beneficiaryStats,
        testimonials: seed.testimonials,
        coordinator: seed.coordinator,
        recognitions: seed.recognitions,
        updates: seed.updates
      };
    });

    const createdCampaigns = await Campaign.insertMany(campaignPayload);
    console.log(`✅ Created ${createdCampaigns.length} detailed campaigns`);

    const commitments = ['One-time', 'Weekly', 'Monthly', 'Flexible'];
    const volunteerOpportunities = createdCampaigns
      .filter((campaign) => campaign.volunteersNeeded && campaign.volunteersNeeded.length > 0)
      .map((campaign, index) => {
        const ngo = createdNgos.find((item) => item.id.toString() === campaign.ngo.toString());
        const startDate = new Date(campaign.timeline?.startDate || Date.now());
        const endDate = new Date(campaign.timeline?.endDate || Date.now() + 1000 * 60 * 60 * 24 * 90);

        return {
          ngo: ngo?.id,
          title: `Volunteer: ${campaign.title}`,
          description: `Support ${campaign.title} with on-ground and coordination tasks in ${campaign.location}.`,
          location: campaign.location,
          skills: campaign.volunteersNeeded,
          commitment: commitments[index % commitments.length],
          dateRange: {
            startDate,
            endDate
          },
          spots: faker.number.int({ min: 10, max: 35 }),
          // Keep opportunities free of pre-applied users; applications are created through the API flow.
          applicants: []
        };
      });

    const createdOpportunities = await VolunteerOpportunity.insertMany(volunteerOpportunities);
    console.log(`✅ Created ${createdOpportunities.length} volunteer opportunities`);

    await User.create({
      name: 'Admin User',
      email: 'admin@ngoconnect.org',
      password: hashedPassword,
      role: 'admin'
    });

    console.log('✅ Created admin user: admin@ngoconnect.org');
    console.log('\n🎉 Database seeded successfully with Bangalore/Karnataka datasets!\n');
    console.log('📝 Test Credentials:');
    console.log('─────────────────────────────────────────');
    console.log('Admin: admin@ngoconnect.org / password123');
    console.log('User: rahul@example.com / password123');
    console.log(`NGO: ${ngoSeeds[0].email} / password123`);
    console.log('─────────────────────────────────────────\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding database:', err);
    process.exit(1);
  }
};

seedDatabase();
