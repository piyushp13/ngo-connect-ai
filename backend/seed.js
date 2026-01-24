const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./src/models/User');
const NGO = require('./src/models/NGO');
const Campaign = require('./src/models/Campaign');

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ngo-connect');
    console.log('📊 Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await NGO.deleteMany({});
    await Campaign.deleteMany({});
    console.log('🗑️ Cleared existing data');

    // Create sample users
    const hashedPassword = await bcrypt.hash('password123', 10);

    const users = [
      { name: 'Rahul Kumar', email: 'rahul@example.com', password: hashedPassword, role: 'user', interests: ['Education', 'Health'], location: 'Delhi', skills: ['Teaching', 'Mentoring'], availability: 'Weekends' },
      { name: 'Priya Singh', email: 'priya@example.com', password: hashedPassword, role: 'user', interests: ['Environment', 'Food'], location: 'Mumbai', skills: ['Design', 'Marketing'], availability: 'Evenings' },
      { name: 'Amit Patel', email: 'amit@example.com', password: hashedPassword, role: 'user', interests: ['Health', 'Disaster Relief'], location: 'Bangalore', skills: ['Medical', 'First Aid'], availability: 'Flexible' },
      { name: 'Neha Gupta', email: 'neha@example.com', password: hashedPassword, role: 'user', interests: ['Education'], location: 'Chennai', skills: ['Coding', 'Technology'], availability: 'Weekends' },
      { name: 'Arjun Desai', email: 'arjun@example.com', password: hashedPassword, role: 'user', interests: ['Environment', 'Education'], location: 'Pune', skills: ['Writing', 'Speaking'], availability: 'Flexible' },
      { name: 'Deepak Sharma', email: 'deepak@example.com', password: hashedPassword, role: 'user', interests: ['Food', 'Health'], location: 'Hyderabad', skills: ['Cooking', 'Nutrition'], availability: 'Evenings' },
    ];

    const createdUsers = await User.insertMany(users);
    console.log(`✅ Created ${createdUsers.length} sample users`);

    // Create sample NGOs
    const ngos = [
      { 
        name: 'Education for All', 
        email: 'eduforall@ngo.org', 
        password: hashedPassword, 
        role: 'ngo',
        category: 'Education', 
        description: 'We provide quality education to underprivileged children in rural areas',
        location: 'Delhi', 
        verified: true,
        verificationDocs: ['doc1.pdf', 'doc2.pdf']
      },
      { 
        name: 'Green Earth Initiative', 
        email: 'greenearth@ngo.org', 
        password: hashedPassword, 
        role: 'ngo',
        category: 'Environment', 
        description: 'Fighting climate change through tree plantation and sustainable practices',
        location: 'Mumbai', 
        verified: true,
        verificationDocs: ['doc1.pdf', 'doc2.pdf']
      },
      { 
        name: 'Health First Foundation', 
        email: 'healthfirst@ngo.org', 
        password: hashedPassword, 
        role: 'ngo',
        category: 'Health', 
        description: 'Providing free healthcare services to underprivileged communities',
        location: 'Bangalore', 
        verified: true,
        verificationDocs: ['doc1.pdf', 'doc2.pdf']
      },
      { 
        name: 'Food & Nutrition Trust', 
        email: 'foodtrust@ngo.org', 
        password: hashedPassword, 
        role: 'ngo',
        category: 'Food', 
        description: 'Combating hunger and malnutrition in urban slums',
        location: 'Chennai', 
        verified: true,
        verificationDocs: ['doc1.pdf', 'doc2.pdf']
      },
      { 
        name: 'Disaster Relief Corps', 
        email: 'disasterrelief@ngo.org', 
        password: hashedPassword, 
        role: 'ngo',
        category: 'Disaster Relief', 
        description: 'Rapid response team for natural disasters and emergencies',
        location: 'Pune', 
        verified: false,
        verificationDocs: []
      },
      { 
        name: 'Tech for Good', 
        email: 'techforgood@ngo.org', 
        password: hashedPassword, 
        role: 'ngo',
        category: 'Education', 
        description: 'Teaching coding and digital literacy to youth in underserved communities',
        location: 'Hyderabad', 
        verified: true,
        verificationDocs: ['doc1.pdf', 'doc2.pdf']
      },
      { 
        name: 'Women Empowerment Network', 
        email: 'womenpower@ngo.org', 
        password: hashedPassword, 
        role: 'ngo',
        category: 'Education', 
        description: 'Empowering women through skill development and financial literacy',
        location: 'Delhi', 
        verified: true,
        verificationDocs: ['doc1.pdf', 'doc2.pdf']
      },
      { 
        name: 'Wildlife Conservation', 
        email: 'wildlife@ngo.org', 
        password: hashedPassword, 
        role: 'ngo',
        category: 'Environment', 
        description: 'Protecting endangered species and their habitats',
        location: 'Bangalore', 
        verified: true,
        verificationDocs: ['doc1.pdf', 'doc2.pdf']
      },
    ];

    const createdNGOs = await NGO.insertMany(ngos);
    console.log(`✅ Created ${createdNGOs.length} sample NGOs`);

    // Create sample campaigns
    const campaigns = [
      {
        ngo: createdNGOs[0]._id,
        title: 'Build a School in Rural India',
        description: 'Help us build a primary school for 200+ children in a remote village',
        category: 'Education',
        location: 'Delhi',
        goalAmount: 500000,
        currentAmount: 250000,
        volunteersNeeded: ['Construction', 'Teaching', 'Planning'],
        volunteers: [createdUsers[0]._id]
      },
      {
        ngo: createdNGOs[1]._id,
        title: '1 Million Trees Campaign',
        description: 'Plant 1 million trees across India to combat climate change',
        category: 'Environment',
        location: 'Mumbai',
        goalAmount: 300000,
        currentAmount: 150000,
        volunteersNeeded: ['Planting', 'Fundraising', 'Awareness'],
        volunteers: [createdUsers[1]._id, createdUsers[4]._id]
      },
      {
        ngo: createdNGOs[2]._id,
        title: 'Free Health Camp Drive',
        description: 'Organize free medical camps in 50 villages',
        category: 'Health',
        location: 'Bangalore',
        goalAmount: 400000,
        currentAmount: 200000,
        volunteersNeeded: ['Medical', 'Coordination', 'Awareness'],
        volunteers: [createdUsers[2]._id]
      },
      {
        ngo: createdNGOs[3]._id,
        title: 'Daily Meals for 1000 Children',
        description: 'Provide nutritious meals to 1000 underprivileged children daily',
        category: 'Food',
        location: 'Chennai',
        goalAmount: 600000,
        currentAmount: 350000,
        volunteersNeeded: ['Cooking', 'Distribution', 'Fundraising'],
        volunteers: [createdUsers[5]._id]
      },
      {
        ngo: createdNGOs[5]._id,
        title: 'Code Academy for Youth',
        description: 'Free coding bootcamp for 500 underprivileged youth',
        category: 'Education',
        location: 'Hyderabad',
        goalAmount: 450000,
        currentAmount: 200000,
        volunteersNeeded: ['Teaching', 'Mentoring', 'Content Creation'],
        volunteers: [createdUsers[3]._id]
      },
      {
        ngo: createdNGOs[6]._id,
        title: 'Women Vocational Training',
        description: 'Train 300 women in tailoring, handicrafts, and digital skills',
        category: 'Education',
        location: 'Delhi',
        goalAmount: 350000,
        currentAmount: 150000,
        volunteersNeeded: ['Training', 'Mentoring', 'Job Placement'],
        volunteers: []
      },
      {
        ngo: createdNGOs[7]._id,
        title: 'Tiger Reserve Protection',
        description: 'Protect and expand tiger habitats in national reserves',
        category: 'Environment',
        location: 'Bangalore',
        goalAmount: 800000,
        currentAmount: 400000,
        volunteersNeeded: ['Patrolling', 'Research', 'Community Engagement'],
        volunteers: [createdUsers[1]._id]
      },
    ];

    const createdCampaigns = await Campaign.insertMany(campaigns);
    console.log(`✅ Created ${createdCampaigns.length} sample campaigns`);

    // Create admin user
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@ngoconnect.org',
      password: hashedPassword,
      role: 'admin'
    });
    console.log(`✅ Created admin user: admin@ngoconnect.org`);

    console.log('\n🎉 Database seeded successfully!\n');
    console.log('📝 Test Credentials:');
    console.log('─────────────────────────────────────────');
    console.log('Admin: admin@ngoconnect.org / password123');
    console.log('User: rahul@example.com / password123');
    console.log('NGO: eduforall@ngo.org / password123');
    console.log('─────────────────────────────────────────\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding database:', err);
    process.exit(1);
  }
};

seedDatabase();
