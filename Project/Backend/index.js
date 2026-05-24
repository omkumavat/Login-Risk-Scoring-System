import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.js';
import dashboardRoutes from './routes/dashboard.js';
import adminRoutes from './routes/admin.js';
import { User } from './models/User.js';
import { Threat } from './models/Threat.js';
import { Log } from './models/Log.js';

dotenv.config();

const app = express();

// Database connection
connectDB();

// CORS middleware setup
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));

// Body parser
app.use(express.json());

// Routes Mounts
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin', adminRoutes);

// Root diagnosis route
app.get('/', (req, res) => {
  res.json({
    name: 'Secure-Mesh Adaptive Security Platform API',
    status: 'ONLINE',
    version: '2.4.0',
    diagnostics: {
      socketHeartbeat: 'OK',
      threatAssessmentEngine: 'ACTIVE',
      blocklistFeed: 'SYNCED',
      databaseState: 'OPERATIONAL'
    }
  });
});

// Self-seeding logic to bootstrap initial admin account & simulated database items
// const seedDatabase = async () => {
//   try {
//     // 1. Seed Default Admin User
//     const adminEmail = 'admin@security.io';
//     const adminExists = await User.findOne({ email: adminEmail });
    
//     if (!adminExists) {
//       console.log('\x1b[36m%s\x1b[0m', '🌱 Seeding: Creating default Admin Security Specialist credentials...');
//       await User.create({
//         email: adminEmail,
//         password: 'security2026', // Hashed automatically by Pre-Save Schema Hook
//         role: 'Admin',
//         mfaEnabled: true,
//         riskScore: 12
//       });
//       console.log('\x1b[32m%s\x1b[0m', '✅ Seeding complete: Seeded admin@security.io / password: security2026');
//     }

//     // 2. Seed Default threat streams if empty
//     const threatCount = await Threat.countDocuments();
//     if (threatCount === 0) {
//       console.log('\x1b[36m%s\x1b[0m', '🌱 Seeding: Creating mock live threat feed alerts...');
//       await Threat.create([
//         {
//           type: 'Brute Force Attack',
//           severity: 'High',
//           source: '185.220.101.9',
//           location: 'Amsterdam, Netherlands (Tor)',
//           time: 'Just now',
//           target: 'admin@enterprise.com',
//           status: 'Active',
//           description: '14 failed login attempts detected in 45 seconds.'
//         },
//         {
//           type: 'Impossible Travel Alert',
//           severity: 'High',
//           source: '198.51.100.12',
//           location: 'Sydney, Australia',
//           time: '4 mins ago',
//           target: 'developer@enterprise.com',
//           status: 'Active',
//           description: 'Login attempt from Sydney 12 minutes after active session in London.'
//         },
//         {
//           type: 'Device Fingerprint Mismatch',
//           severity: 'Medium',
//           source: '172.56.22.41',
//           location: 'New York, USA',
//           time: '15 mins ago',
//           target: 'marketing@enterprise.com',
//           status: 'Mitigated',
//           description: 'User Agent header reports Safari but JS canvas fingerprint returns Chrome engine.'
//         }
//       ]);
//       console.log('\x1b[32m%s\x1b[0m', '✅ Seeding complete: Live threats seeded.');
//     }

//     // 3. Seed activity logs if empty
//     const logsCount = await Log.countDocuments();
//     if (logsCount === 0) {
//       console.log('\x1b[36m%s\x1b[0m', '🌱 Seeding: Seeding historical login audits logs...');
//       const user = await User.findOne({ email: adminEmail });
//       const userId = user ? user._id : null;
      
//       await Log.create([
//         {
//           userId,
//           time: '2026-05-24 14:12:08',
//           ip: '185.220.101.4',
//           browser: 'Tor Browser',
//           os: 'Linux x86_64',
//           location: 'Frankfurt, Germany (Tor Node)',
//           riskScore: 92,
//           riskLevel: 'High',
//           status: 'Denied',
//           details: 'Connection blocked due to high risk reputation (Tor Exit Node detected).'
//         },
//         {
//           userId,
//           time: '2026-05-24 11:45:12',
//           ip: '172.56.21.89',
//           browser: 'Safari Mobile',
//           os: 'iOS 17.4',
//           location: 'Tokyo, Japan',
//           riskScore: 8,
//           riskLevel: 'Low',
//           status: 'Approved',
//           details: 'Automatic token refresh. Device matches trusted fingerprint.'
//         },
//         {
//           userId,
//           time: '2026-05-23 23:19:54',
//           ip: '91.200.12.87',
//           browser: 'Chrome 123.0.0',
//           os: 'Windows 10',
//           location: 'Kiev, Ukraine',
//           riskScore: 78,
//           riskLevel: 'High',
//           status: 'OTP Challenged',
//           details: 'First time device in region. Triggered secondary authentication challenge.'
//         }
//       ]);
//       console.log('\x1b[32m%s\x1b[0m', '✅ Seeding complete: Login logs loaded.');
//     }
//   } catch (error) {
//     console.error('Seeding database error:', error.message);
//   }
// };

// // Seeding trigger (run shortly after boot to let mongo connect)
// setTimeout(seedDatabase, 2000);

// Server startup listener
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('\x1b[35m%s\x1b[0m', `🚀 Secure-Mesh Backend running in ${process.env.NODE_ENV || 'production'} mode on Port ${PORT}`);
});
