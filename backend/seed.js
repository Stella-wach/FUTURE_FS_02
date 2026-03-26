/**
 * Seed Script – populates the DB with a demo admin + 20 sample leads
 * Usage: node seed.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Lead = require('./models/Lead');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mini-crm';

const DEMO_USER = {
  name: 'Alex Admin',
  email: 'admin@savanacrm.dev',
  password: 'admin123',
  role: 'admin',
};

const SOURCES = ['website', 'referral', 'social_media', 'email_campaign', 'cold_call', 'other'];
const STATUSES = ['new', 'new', 'new', 'contacted', 'contacted', 'qualified', 'converted', 'lost'];

const SAMPLE_LEADS = [
  { name: 'Sophia Wanjiru',   email: 'sophia@kenyatech.co.ke',   company: 'Kenya Tech Ltd',      phone: '+254 712 000 001', source: 'website',        status: 'new',       value: 15000, message: 'Interested in the enterprise CRM package.' },
  { name: 'James Odhiambo',  email: 'james@innovate.co.ke',     company: 'Innovate Africa',     phone: '+254 722 000 002', source: 'referral',       status: 'contacted', value: 8500,  message: 'Referred by Sophia. Needs a demo.' },
  { name: 'Amina Hassan',    email: 'amina@nairobi.digital',    company: 'Nairobi Digital',     phone: '+254 733 000 003', source: 'social_media',   status: 'qualified', value: 22000, message: 'Saw us on LinkedIn. Ready to buy.' },
  { name: 'Brian Mutua',     email: 'brian@scalehub.io',        company: 'Scale Hub',           phone: '+254 700 000 004', source: 'email_campaign', status: 'converted', value: 31000, message: 'Responded to the Q1 campaign. Signed contract.' },
  { name: 'Grace Achieng',   email: 'grace@finpilot.co.ke',    company: 'FinPilot',            phone: '+254 711 000 005', source: 'website',        status: 'new',       value: 5000,  message: 'Filled the contact form late at night.' },
  { name: 'David Kimani',    email: 'david@growthlab.africa',   company: 'Growth Lab Africa',   phone: '+254 799 000 006', source: 'cold_call',      status: 'lost',      value: 0,     message: 'Not interested at this time.' },
  { name: 'Priya Patel',     email: 'priya@techpulse.in',       company: 'TechPulse India',     phone: '+91 98765 00007', source: 'referral',       status: 'new',       value: 18000, message: 'Looking for a solution to manage 500+ leads per month.' },
  { name: 'Omar Al-Rashid',  email: 'omar@ventures.ae',         company: 'Gulf Ventures',       phone: '+971 50 000 0008', source: 'email_campaign', status: 'contacted', value: 42000, message: 'Enterprise inquiry from Dubai office.' },
  { name: 'Chloe Martin',    email: 'chloe@pixelstudio.fr',     company: 'Pixel Studio',        phone: '+33 6 00 00 0009', source: 'social_media',   status: 'qualified', value: 9500,  message: 'Wants a white-label version for their clients.' },
  { name: 'Kwame Asante',    email: 'kwame@accratech.gh',       company: 'AccraTech',           phone: '+233 24 000 0010', source: 'website',        status: 'new',       value: 6000,  message: 'Small team, 5 users needed.' },
  { name: 'Fatima Nour',     email: 'fatima@digitalcairo.eg',   company: 'Digital Cairo',       phone: '+20 10 0000 0011', source: 'referral',       status: 'converted', value: 27500, message: 'Partner referral. Went through fast.' },
  { name: 'Carlos Mendez',   email: 'carlos@latamcrm.mx',       company: 'LatAm CRM Co.',       phone: '+52 55 0000 0012', source: 'cold_call',      status: 'contacted', value: 13000, message: 'Cold call converted to warm. Follow up next Tuesday.' },
  { name: 'Nia Okonkwo',     email: 'nia@lagosbuilds.ng',       company: 'Lagos Builds',        phone: '+234 80 0000 0013', source: 'website',       status: 'new',       value: 4500,  message: 'Construction company needing client tracking.' },
  { name: 'Liam O\'Brien',   email: 'liam@dublindev.ie',        company: 'Dublin Dev House',    phone: '+353 87 000 0014', source: 'email_campaign', status: 'qualified', value: 19000, message: 'Developer agency, 12 seats.' },
  { name: 'Yuki Tanaka',     email: 'yuki@tokyoui.jp',          company: 'Tokyo UI Lab',        phone: '+81 90 0000 0015', source: 'social_media',   status: 'new',       value: 11000, message: 'Found us through a Twitter thread.' },
  { name: 'Amara Diallo',    email: 'amara@dakarconsult.sn',    company: 'Dakar Consulting',    phone: '+221 77 000 0016', source: 'referral',       status: 'contacted', value: 7500,  message: 'Referred by Kwame. Speaks French primarily.' },
  { name: 'Sam Goldberg',    email: 'sam@nycagency.io',         company: 'NYC Agency',          phone: '+1 212 000 0017', source: 'cold_call',      status: 'converted', value: 55000, message: 'Large enterprise deal. Closed after 3 demos.' },
  { name: 'Ingrid Larsson',  email: 'ingrid@nordicsaas.se',     company: 'Nordic SaaS AB',      phone: '+46 70 000 0018', source: 'website',        status: 'new',       value: 24000, message: 'Wants GDPR compliance info before proceeding.' },
  { name: 'Tariq Hussain',   email: 'tariq@karachitrade.pk',    company: 'Karachi Trade Co.',   phone: '+92 300 000 0019', source: 'email_campaign', status: 'lost',      value: 0,     message: 'Budget constraints. May revisit Q3.' },
  { name: 'Mei Lin',         email: 'mei@shanghaiops.cn',       company: 'Shanghai Ops',        phone: '+86 138 0000 020', source: 'social_media',   status: 'qualified', value: 33000, message: 'Evaluating us vs. Salesforce. Needs case studies.' },
];

const SAMPLE_NOTES = [
  'Called and left a voicemail. Will try again tomorrow.',
  'Sent a follow-up email with pricing PDF attached.',
  'Had a 30-minute discovery call. Very interested, budget confirmed.',
  'Demo scheduled for next Monday at 10am.',
  'They requested a trial period of 2 weeks.',
  'Contract sent for review.',
];

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
  const now = Date.now();
  const leads = SAMPLE_LEADS.map((lead, i) => {
    const daysAgo = Math.floor(Math.random() * 180);
    const createdAt = new Date(now - daysAgo * 86400000);
    const notes = lead.status !== 'new'
      ? [{ content: SAMPLE_NOTES[i % SAMPLE_NOTES.length], addedBy: user.name, createdAt }]
      : [];
    return { ...lead, notes, createdAt, updatedAt: createdAt };
  });

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
