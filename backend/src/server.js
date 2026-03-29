import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { connectDB } from './db.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import qrSessionRoutes from './routes/qrSession.js';
import attendanceRoutes from './routes/attendance.js';
import labStatusRoutes from './routes/labStatus.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Resolve path for frontend
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendPath = path.join(__dirname, '../../frontend/dist');

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from frontend/dist
app.use(express.static(frontendPath));

// Connect to MongoDB
await connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/qr-sessions', qrSessionRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/lab-status', labStatusRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// SPA Catch-all: Send index.html for any other routes not handled by API
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
  console.log(`Access from network: http://<your-ip>:${PORT}`);
});
