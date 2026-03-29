import dotenv from 'dotenv';
import { connectDB } from './db.js';
import User from './models/User.js';

dotenv.config();

const addStudent = async () => {
  try {
    await connectDB();

    // Check if student already exists
    const existingStudent = await User.findOne({ email: 'student@paie.club' });
    
    if (existingStudent) {
      console.log('\n✓ Student already exists!');
      console.log('\n📧 Login Credentials:');
      console.log('   Email: student@paie.club');
      console.log('   Password: student123');
      console.log('   Roll Number: CS2024099');
      process.exit(0);
    }

    // Create new student
    const student = new User({
      name: 'Test Student',
      email: 'student@paie.club',
      password: 'student123',
      role: 'student',
      rollNumber: 'CS2024099',
    });

    await student.save();

    console.log('\n✓ Student created successfully!');
    console.log('\n📧 Login Credentials:');
    console.log('   Email: student@paie.club');
    console.log('   Password: student123');
    console.log('   Roll Number: CS2024099');
    console.log('   Role: Student');
    console.log('\n🌐 Access the application at:');
    console.log('   http://localhost:5173');
    console.log('\n');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

addStudent();
