import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import dns from 'dns';
import User from '../models/User.model';
import Lead from '../models/Lead.model';

dns.setServers(['8.8.8.8', '8.8.4.4']);

const seed = async (): Promise<void> => {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('Connected to MongoDB for seeding');

    const existingAdmin = await User.findOne({ email: 'admin@smartleads.com' });
    if (existingAdmin) {
      console.log('Seed data already exists. Skipping.');
      process.exit(0);
    }

    // Create admin
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@smartleads.com',
      password: 'Admin123!',
      role: 'admin',
    });

    // Create sales user
    const salesUser = await User.create({
      name: 'Priya Sharma',
      email: 'priya@smartleads.com',
      password: 'Sales123!',
      role: 'sales',
    });

    // Create sample leads
    await Lead.insertMany([
      { name: 'Rahul Verma', email: 'rahul@techcorp.com', status: 'New', source: 'Website', assignedTo: salesUser._id },
      { name: 'Ananya Iyer', email: 'ananya@startup.io', status: 'Contacted', source: 'Instagram', assignedTo: salesUser._id },
      { name: 'Vikram Singh', email: 'vikram@enterprise.com', status: 'Qualified', source: 'Referral', assignedTo: admin._id },
      { name: 'Neha Patel', email: 'neha@agency.co', status: 'New', source: 'Instagram', assignedTo: salesUser._id },
      { name: 'Arjun Reddy', email: 'arjun@devhouse.in', status: 'Lost', source: 'Website', assignedTo: salesUser._id },
      { name: 'Meera Krishnan', email: 'meera@startup.io', status: 'Contacted', source: 'Referral', assignedTo: admin._id },
      { name: 'Suresh Kumar', email: 'suresh@bigco.com', status: 'New', source: 'Website', assignedTo: salesUser._id },
      { name: 'Divya Nair', email: 'divya@creative.co', status: 'Qualified', source: 'Instagram', assignedTo: salesUser._id },
      { name: 'Karthik Menon', email: 'karthik@infosys.com', status: 'Contacted', source: 'Website', assignedTo: admin._id },
      { name: 'Ritu Gupta', email: 'ritu@salesforce.com', status: 'New', source: 'Referral', assignedTo: salesUser._id },
      { name: 'Aditya Joshi', email: 'aditya@mozilla.org', status: 'Qualified', source: 'Website', assignedTo: salesUser._id },
      { name: 'Pooja Desai', email: 'pooja@meta.com', status: 'Lost', source: 'Instagram', assignedTo: admin._id },
    ]);

    console.log('\n═══════════════════════════════════════');
    console.log('  seed complete!');
    console.log('  admin: admin@smartleads.com / Admin123!');
    console.log('  sales: priya@smartleads.com / Sales123!');
    console.log('  12 sample leads created');
    console.log('═══════════════════════════════════════\n');

    process.exit(0);
  } catch (err) {
    console.error('seed failed:', err);
    process.exit(1);
  }
};

seed();
