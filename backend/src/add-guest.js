import dotenv from 'dotenv';
import { connectDB } from './db.js';
import User from './models/User.js';

dotenv.config();

const addGuest = async () => {
  try {
    await connectDB();

    const existingGuest = await User.findOne({ email: 'guest@paie.club' });
    if (existingGuest) {
      console.log('Guest user already exists');
      process.exit(0);
    }

    const guest = new User({
      name: 'Guest User',
      email: 'guest@paie.club',
      password: 'guest123',
      role: 'guest'
    });

    await guest.save();
    console.log('Guest user created successfully!');
    console.log('Email: guest@paie.club');
    console.log('Password: guest123');
    process.exit(0);
  } catch (error) {
    console.error('Error adding guest:', error);
    process.exit(1);
  }
};

addGuest();
