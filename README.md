# PAIE-Attend: QR-Based Attendance System

A full-stack web application for managing attendance using QR codes. Built with React, Node.js, Express, and MongoDB.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or cloud)
- npm or yarn

### Installation

```bash
# 1. Install all dependencies
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..

# 2. Setup MongoDB
# Option A: Local
mongod

# Option B: Docker
docker run -d -p 27017:27017 mongo:latest

# Option C: MongoDB Atlas (cloud)
# Create account at https://www.mongodb.com/cloud/atlas

# 3. Configure environment
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 4. Seed database (optional)
cd backend
node src/seed.js
cd ..

# 5. Start application
npm run dev
```

### Access Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/api/health

## 📋 Test Credentials

After seeding the database:

| Email | Password | Role |
|-------|----------|------|
| admin@paie.club | admin123 | Admin |
| aarav@student.com | student123 | Student |
| priya@student.com | student123 | Student |
| rohan@student.com | student123 | Student |
| ananya@student.com | student123 | Student |
| vikram@student.com | student123 | Student |

## 📁 Project Structure

```
paie-attend/
├── backend/                    # Node.js + Express + MongoDB
│   ├── src/
│   │   ├── models/            # Database schemas
│   │   ├── routes/            # API endpoints
│   │   ├── middleware/        # Authentication
│   │   ├── db.js              # Database connection
│   │   ├── server.js          # Express setup
│   │   └── seed.js            # Database seeding
│   ├── package.json
│   ├── .env
│   └── README.md
│
├── frontend/                   # React + TypeScript + Vite
│   ├── src/
│   │   ├── pages/             # Page components
│   │   ├── components/        # UI components
│   │   ├── lib/
│   │   │   ├── api.ts         # API client
│   │   │   ├── auth-context.tsx
│   │   │   └── mock-data.ts
│   │   └── main.tsx
│   ├── package.json
│   ├── .env
│   └── vite.config.ts
│
├── package.json               # Root scripts
├── SETUP.md                   # Detailed setup guide
├── QUICK_START.md             # Quick reference
├── BACKEND_INTEGRATION.md     # Backend documentation
├── ARCHITECTURE.md            # System architecture
├── ENV_SETUP.md               # Environment configuration
└── README.md                  # This file
```

## 🏗️ Architecture

### Technology Stack

**Frontend**
- React 18 with TypeScript
- Vite for fast development
- shadcn/ui components
- Tailwind CSS
- React Router for navigation

**Backend**
- Node.js with Express.js
- MongoDB with Mongoose ODM
- JWT authentication
- bcrypt for password hashing
- CORS enabled

**Database**
- MongoDB (NoSQL)
- Collections: Users, QRSessions, AttendanceRecords
- Automatic TTL indexes for session expiration

### System Flow

```
User Login → JWT Token → API Requests → Database
   ↓
Dashboard → View/Record Attendance
   ↓
Admin → Create QR Sessions → Statistics
```

## 🔐 Features

### Authentication & Authorization
- ✅ User registration and login
- ✅ JWT token-based authentication
- ✅ Role-based access control (Admin, Student, Guest)
- ✅ Password hashing with bcrypt
- ✅ Secure token storage

### Attendance Management
- ✅ QR session creation (admin)
- ✅ Attendance recording with location
- ✅ Student attendance tracking
- ✅ Attendance statistics and reports
- ✅ Work description logging

### User Management
- ✅ User profiles
- ✅ Student roll numbers
- ✅ Admin dashboard
- ✅ User statistics

### API Features
- ✅ 20+ RESTful endpoints
- ✅ Error handling
- ✅ Input validation
- ✅ CORS support
- ✅ Health check endpoint

## 📚 API Documentation

### Authentication Endpoints
```
POST   /api/auth/register      - Register new user
POST   /api/auth/login         - Login user
GET    /api/auth/me            - Get current user
```

### User Endpoints
```
GET    /api/users              - Get all users (admin)
GET    /api/users/students     - Get all students
GET    /api/users/:id          - Get user by ID
PATCH  /api/users/:id          - Update user
```

### QR Session Endpoints
```
POST   /api/qr-sessions        - Create session (admin)
GET    /api/qr-sessions        - Get active sessions
GET    /api/qr-sessions/:id    - Get session details
PATCH  /api/qr-sessions/:id/use - Mark as used
```

### Attendance Endpoints
```
POST   /api/attendance         - Record attendance
GET    /api/attendance         - Get all records (admin)
GET    /api/attendance/student/:studentId - Get student records
GET    /api/attendance/stats/all - Get statistics (admin)
```

See `backend/README.md` for detailed API documentation.

## 🛠️ Development

### Running Servers

**Both servers together:**
```bash
npm run dev
```

**Backend only:**
```bash
npm run dev:backend
```

**Frontend only:**
```bash
npm run dev:frontend
```

### Building for Production

**Frontend:**
```bash
cd frontend
npm run build
npm run preview
```

**Backend:**
```bash
cd backend
npm start
```

### Database Management

**Seed database:**
```bash
cd backend
node src/seed.js
```

**Connect to MongoDB:**
```bash
mongosh
use paie-attend
db.users.find()
```

## 📖 Documentation

- **[SETUP.md](./SETUP.md)** - Comprehensive setup guide
- **[QUICK_START.md](./QUICK_START.md)** - Quick reference
- **[BACKEND_INTEGRATION.md](./BACKEND_INTEGRATION.md)** - Backend details
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System architecture
- **[ENV_SETUP.md](./ENV_SETUP.md)** - Environment configuration
- **[backend/README.md](./backend/README.md)** - Backend API docs

## 🚨 Troubleshooting

### MongoDB Connection Error
```bash
# Check if MongoDB is running
mongosh

# Start MongoDB
mongod
```

### Port Already in Use
```bash
# Find process using port 5000
lsof -i :5000

# Kill process
kill -9 <PID>
```

### CORS Error
- Verify `VITE_API_URL` in `frontend/.env`
- Ensure backend is running on correct port
- Check CORS configuration in backend

### Module Not Found
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

See [QUICK_START.md](./QUICK_START.md) for more troubleshooting.

## 🔄 Environment Variables

### Backend (`backend/.env`)
```env
MONGODB_URI=mongodb://localhost:27017/paie-attend
PORT=5000
JWT_SECRET=your_secret_key
NODE_ENV=development
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:5000/api
```

See [ENV_SETUP.md](./ENV_SETUP.md) for detailed configuration.

## 📊 Database Schema

### User Collection
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: 'admin' | 'student' | 'guest',
  rollNumber: String,
  createdAt: Date
}
```

### QRSession Collection
```javascript
{
  sessionId: String (unique),
  createdBy: ObjectId,
  createdAt: Date,
  expiresAt: Date,
  location: { lat: Number, lng: Number },
  used: Boolean,
  attendanceCount: Number
}
```

### AttendanceRecord Collection
```javascript
{
  studentId: ObjectId,
  studentName: String,
  sessionId: ObjectId,
  date: String,
  workDone: String,
  location: { lat: Number, lng: Number },
  timestamp: Date,
  createdAt: Date
}
```

## 🚀 Deployment

### Frontend Deployment
1. Build: `npm run build`
2. Deploy to Vercel, Netlify, or AWS S3
3. Set `VITE_API_URL` to production backend

### Backend Deployment
1. Set `NODE_ENV=production`
2. Use MongoDB Atlas for database
3. Deploy to Heroku, Railway, or AWS EC2
4. Set environment variables in deployment platform

## 🔒 Security

- ✅ Passwords hashed with bcrypt
- ✅ JWT authentication
- ✅ CORS configured
- ✅ Environment variables for secrets
- ✅ Role-based access control
- ⚠️ TODO: Rate limiting
- ⚠️ TODO: Input validation
- ⚠️ TODO: HTTPS in production

## 📈 Future Enhancements

- [ ] QR code generation and scanning
- [ ] Real-time updates with WebSocket
- [ ] Email notifications
- [ ] Advanced analytics dashboard
- [ ] Geofencing for attendance verification
- [ ] Mobile app (React Native)
- [ ] Biometric authentication
- [ ] Attendance reports export

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📝 License

This project is licensed under the ISC License.

## 👨‍💻 Author

Created as a QR-based attendance system for educational institutions.

## 📞 Support

For issues and questions:
1. Check the documentation files
2. Review troubleshooting section
3. Check backend/frontend logs
4. Verify environment configuration

## 🎯 Getting Help

- **Setup Issues**: See [SETUP.md](./SETUP.md)
- **Quick Reference**: See [QUICK_START.md](./QUICK_START.md)
- **API Details**: See [backend/README.md](./backend/README.md)
- **Architecture**: See [ARCHITECTURE.md](./ARCHITECTURE.md)
- **Environment**: See [ENV_SETUP.md](./ENV_SETUP.md)

---

**Happy coding!** 🚀

For detailed information, refer to the documentation files in the project root.
