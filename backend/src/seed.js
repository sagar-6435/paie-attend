import dotenv from 'dotenv';
import { connectDB } from './db.js';
import User from './models/User.js';
import QRSession from './models/QRSession.js';
import AttendanceRecord from './models/AttendanceRecord.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany({});
    await QRSession.deleteMany({});
    await AttendanceRecord.deleteMany({});

    // Create users
    const users = await User.create([
      {
        name: 'Prof. Sharma',
        email: 'admin@paie.club',
        password: 'admin123',
        role: 'admin',
      },
      {
        name: 'Aarav Patel',
        email: 'aarav@student.com',
        password: 'student123',
        role: 'student',
        rollNumber: 'CS2024001',
      },
      {
        name: 'Priya Singh',
        email: 'priya@student.com',
        password: 'student123',
        role: 'student',
        rollNumber: 'CS2024002',
      },
      {
        name: 'Rohan Kumar',
        email: 'rohan@student.com',
        password: 'student123',
        role: 'student',
        rollNumber: 'CS2024003',
      },
      {
        name: 'Ananya Gupta',
        email: 'ananya@student.com',
        password: 'student123',
        role: 'student',
        rollNumber: 'CS2024004',
      },
      {
        name: 'Vikram Reddy',
        email: 'vikram@student.com',
        password: 'student123',
        role: 'student',
        rollNumber: 'CS2024005',
      },
    ]);

    console.log(`✓ Created ${users.length} users`);

    // Create QR sessions
    const sessions = await QRSession.create([
      {
        sessionId: 'session-001',
        createdBy: users[0]._id,
        location: { lat: 28.6139, lng: 77.209 },
        expiresAt: new Date(Date.now() + 3600000),
      },
      {
        sessionId: 'session-002',
        createdBy: users[0]._id,
        location: { lat: 28.6140, lng: 77.2091 },
        expiresAt: new Date(Date.now() + 3600000),
      },
    ]);

    console.log(`✓ Created ${sessions.length} QR sessions`);

    // Create attendance records
    const attendanceData = [
      {
        studentId: users[1]._id,
        studentName: users[1].name,
        sessionId: sessions[0]._id,
        date: new Date().toISOString().split('T')[0],
        workDone: 'Completed React hooks tutorial',
        location: { lat: 28.6139, lng: 77.209 },
      },
      {
        studentId: users[2]._id,
        studentName: users[2].name,
        sessionId: sessions[0]._id,
        date: new Date().toISOString().split('T')[0],
        workDone: 'Built a todo app component',
        location: { lat: 28.6140, lng: 77.2091 },
      },
      {
        studentId: users[1]._id,
        studentName: users[1].name,
        sessionId: sessions[1]._id,
        date: new Date().toISOString().split('T')[0],
        workDone: 'Studied TypeScript generics',
        location: { lat: 28.6139, lng: 77.209 },
      },
    ];

    const records = await AttendanceRecord.create(attendanceData);
    console.log(`✓ Created ${records.length} attendance records`);

    console.log('\n✓ Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
