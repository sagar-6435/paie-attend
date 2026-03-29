# PAIE-Attend Backend

Node.js + Express.js + MongoDB backend for the QR-based attendance system.

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and update values:

```bash
cp .env.example .env
```

Edit `.env`:
```
MONGODB_URI=mongodb://localhost:27017/paie-attend
PORT=5000
JWT_SECRET=your_secure_jwt_secret_key
NODE_ENV=development
```

### 3. MongoDB Setup

Make sure MongoDB is running locally or update `MONGODB_URI` to your MongoDB connection string.

For local MongoDB:
```bash
# macOS with Homebrew
brew services start mongodb-community

# Windows (if installed)
mongod
```

### 4. Seed Database (Optional)

Populate initial data:

```bash
node src/seed.js
```

This creates:
- 1 admin user (admin@paie.club / admin123)
- 5 student users (aarav@student.com, etc. / student123)
- Sample QR sessions and attendance records

### 5. Start Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

Server runs on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/students` - Get all students
- `GET /api/users/:id` - Get user by ID
- `PATCH /api/users/:id` - Update user

### QR Sessions
- `POST /api/qr-sessions` - Create QR session (admin only)
- `GET /api/qr-sessions` - Get active sessions
- `GET /api/qr-sessions/:id` - Get session details
- `PATCH /api/qr-sessions/:id/use` - Mark session as used

### Attendance
- `POST /api/attendance` - Record attendance
- `GET /api/attendance` - Get all records (admin only)
- `GET /api/attendance/student/:studentId` - Get student's records
- `GET /api/attendance/stats/all` - Get attendance statistics (admin only)

## Database Schema

### User
- name, email, password, role, rollNumber, createdAt

### QRSession
- sessionId, createdBy, createdAt, expiresAt, location, used, attendanceCount

### AttendanceRecord
- studentId, studentName, sessionId, date, workDone, location, timestamp, createdAt
