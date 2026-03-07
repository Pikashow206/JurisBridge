const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const User = require('../models/User');
const Lawyer = require('../models/Lawyer');

const testLawyers = [
  {
    name: 'Adv. Amit Verma',
    email: 'amit.verma@test.com',
    password: 'test123456',
    phone: '9876543001',
    location: { type: 'Point', coordinates: [72.8777, 19.0760], city: 'Mumbai', state: 'Maharashtra' },
    barCouncilNumber: 'MH/2345/2018',
    specializations: ['Criminal Law', 'Civil Litigation'],
    experience: 12,
    consultationFee: 2000,
    bio: 'Senior criminal lawyer with 12 years of practice in Mumbai High Court',
    education: 'LLM, Government Law College Mumbai',
    courtPractice: 'High Court',
    languages: ['English', 'Hindi', 'Marathi'],
    isVerified: true,
    rating: 4.5,
    totalReviews: 28,
  },
  {
    name: 'Adv. Sneha Iyer',
    email: 'sneha.iyer@test.com',
    password: 'test123456',
    phone: '9876543002',
    location: { type: 'Point', coordinates: [77.5946, 12.9716], city: 'Bangalore', state: 'Karnataka' },
    barCouncilNumber: 'KA/5678/2016',
    specializations: ['Family Law', 'Property Law'],
    experience: 10,
    consultationFee: 1500,
    bio: 'Specialist in family disputes, divorce, and property matters',
    education: 'LLB, National Law School Bangalore',
    courtPractice: 'District Court',
    languages: ['English', 'Hindi', 'Kannada'],
    isVerified: true,
    rating: 4.8,
    totalReviews: 45,
  },
  {
    name: 'Adv. Rajesh Kumar',
    email: 'rajesh.kumar@test.com',
    password: 'test123456',
    phone: '9876543003',
    location: { type: 'Point', coordinates: [77.2090, 28.6139], city: 'Delhi', state: 'Delhi' },
    barCouncilNumber: 'DL/9012/2015',
    specializations: ['Corporate Law', 'Intellectual Property'],
    experience: 15,
    consultationFee: 3000,
    bio: 'Corporate lawyer handling mergers, acquisitions and IP rights',
    education: 'LLM, Delhi University',
    courtPractice: 'Supreme Court',
    languages: ['English', 'Hindi'],
    isVerified: true,
    rating: 4.2,
    totalReviews: 19,
  },
  {
    name: 'Adv. Fatima Sheikh',
    email: 'fatima.sheikh@test.com',
    password: 'test123456',
    phone: '9876543004',
    location: { type: 'Point', coordinates: [72.8311, 21.1702], city: 'Surat', state: 'Gujarat' },
    barCouncilNumber: 'GJ/3456/2019',
    specializations: ['Cyber Law', 'Consumer Rights'],
    experience: 7,
    consultationFee: 1000,
    bio: 'Tech-savvy lawyer specializing in cybercrime and digital rights',
    education: 'LLB, Gujarat National Law University',
    courtPractice: 'District Court',
    languages: ['English', 'Hindi', 'Gujarati'],
    isVerified: true,
    rating: 4.6,
    totalReviews: 33,
  },
  {
    name: 'Adv. Arjun Nair',
    email: 'arjun.nair@test.com',
    password: 'test123456',
    phone: '9876543005',
    location: { type: 'Point', coordinates: [76.2711, 9.9312], city: 'Kochi', state: 'Kerala' },
    barCouncilNumber: 'KL/7890/2017',
    specializations: ['Employment Law', 'Tax Law'],
    experience: 9,
    consultationFee: 1800,
    bio: 'Labour law and taxation expert practicing in Kerala High Court',
    education: 'LLM, Cochin University',
    courtPractice: 'High Court',
    languages: ['English', 'Hindi', 'Malayalam'],
    isVerified: true,
    rating: 4.3,
    totalReviews: 21,
  },
];

const seedLawyers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing test lawyers
    for (const data of testLawyers) {
      await User.findOneAndDelete({ email: data.email });
    }
    console.log('🗑️  Cleaned old test lawyers');

    // Create lawyers
    for (const data of testLawyers) {
      // Create user
      const user = await User.create({
        name: data.name,
        email: data.email,
        password: data.password,
        phone: data.phone,
        role: 'lawyer',
        location: {
          type: 'Point',
          coordinates: data.location.coordinates,
          city: data.location.city,
          state: data.location.state,
        },
      });

      // Create lawyer profile
      await Lawyer.create({
        userId: user._id,
        barCouncilNumber: data.barCouncilNumber,
        specializations: data.specializations,
        experience: data.experience,
        consultationFee: data.consultationFee,
        bio: data.bio,
        education: data.education,
        courtPractice: data.courtPractice,
        languages: data.languages,
        isVerified: data.isVerified,
        rating: data.rating,
        totalReviews: data.totalReviews,
      });

      console.log(`   ✅ Created: ${data.name} — ${data.specializations.join(', ')}`);
    }

    console.log(`\n🎉 ${testLawyers.length} test lawyers seeded successfully!`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    process.exit(1);
  }
};

seedLawyers();