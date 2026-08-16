/**
 * Seed Script – populates the DB with a demo admin + 20 sample leads
 * Usage: node seed.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Lead = require('./models/Lead');
const { buildSeedLeads } = require('./data/sampleLeads');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mini-crm';

const DEMO_USER = {
  name: 'Alex Admin',
  email: 'admin@savanacrm.dev',
  password: 'admin123',
  role: 'admin',
};

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB');

  // Clear existing data
  await Promise.all([User.deleteMany({}), Lead.deleteMany({})]);
  console.log('🗑  Cleared existing data');

  // Create admin user
  const user = await User.create(DEMO_USER);
  console.log(`👤 Created admin: ${DEMO_USER.email} / ${DEMO_USER.password}`);

  // Backdate leads across the last 6 months for realistic chart data
  const leads = buildSeedLeads(user.name);
  await Lead.insertMany(leads);
  console.log(`📋 Created ${leads.length} sample leads`);

  console.log('\n🎉 Seed complete! Login with:');
  console.log(`   Email:    ${DEMO_USER.email}`);
  console.log(`   Password: ${DEMO_USER.password}`);
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
