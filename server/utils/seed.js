import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import Customer from '../models/Customer.js';
import Lead from '../models/Lead.js';
import Task from '../models/Task.js';

dotenv.config();

const seed = async () => {
  try {
    await connectDB();

    await Promise.all([
      User.deleteMany(),
      Customer.deleteMany(),
      Lead.deleteMany(),
      Task.deleteMany(),
    ]);

    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@smartcrm.com',
      password: 'admin123',
      role: 'admin',
      department: 'Management',
    });

    const manager = await User.create({
      name: 'Sarah Johnson',
      email: 'manager@smartcrm.com',
      password: 'manager123',
      role: 'sales_manager',
      department: 'Sales',
    });

    const employee = await User.create({
      name: 'John Smith',
      email: 'employee@smartcrm.com',
      password: 'employee123',
      role: 'employee',
      department: 'Sales',
    });

    const customers = await Customer.insertMany([
      {
        name: 'Acme Corporation',
        email: 'contact@acme.com',
        phone: '+1-555-0101',
        company: 'Acme Corp',
        status: 'active',
        assignedEmployee: employee._id,
        createdBy: admin._id,
      },
      {
        name: 'TechStart Inc',
        email: 'hello@techstart.io',
        phone: '+1-555-0102',
        company: 'TechStart',
        status: 'prospect',
        assignedEmployee: employee._id,
        createdBy: manager._id,
      },
    ]);

    await Lead.insertMany([
      {
        title: 'Enterprise Software Deal',
        customerName: 'Acme Corporation',
        email: 'contact@acme.com',
        phone: '+1-555-0101',
        company: 'Acme Corp',
        value: 50000,
        status: 'negotiation',
        assignedTo: employee._id,
        createdBy: manager._id,
      },
      {
        title: 'Cloud Migration Project',
        customerName: 'TechStart Inc',
        email: 'hello@techstart.io',
        company: 'TechStart',
        value: 25000,
        status: 'closed',
        assignedTo: employee._id,
        createdBy: admin._id,
      },
    ]);

    await Task.insertMany([
      {
        title: 'Follow up with Acme Corp',
        description: 'Schedule demo call for enterprise package',
        deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        priority: 'high',
        assignedUser: employee._id,
        status: 'pending',
        relatedCustomer: customers[0]._id,
        createdBy: manager._id,
      },
      {
        title: 'Send proposal to TechStart',
        description: 'Prepare and send cloud migration proposal',
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        priority: 'medium',
        assignedUser: employee._id,
        status: 'in_progress',
        relatedCustomer: customers[1]._id,
        createdBy: admin._id,
      },
    ]);

    console.log('Database seeded successfully!');
    console.log('\nDemo Accounts:');
    console.log('Admin:    admin@smartcrm.com / admin123');
    console.log('Manager:  manager@smartcrm.com / manager123');
    console.log('Employee: employee@smartcrm.com / employee123');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seed();
