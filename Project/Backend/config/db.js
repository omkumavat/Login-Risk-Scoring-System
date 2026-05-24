import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export const connectDB = async () => {
  try {
    const connStr = process.env.MONGO_URI;
    
    // Check if the URI is a template placeholder
    if (connStr.includes('abcde') || connStr.includes('YOUR_MONGO_URI')) {
      console.warn('\x1b[33m%s\x1b[0m', '⚠️  WARNING: MongoDB Atlas URI placeholder detected in .env');
      console.warn('\x1b[33m%s\x1b[0m', 'Please configure your Mongo Cloud connection string in .env.');
      console.log('\x1b[36m%s\x1b[0m', 'ℹ️  System will attempt to connect or run in Adaptive Demo Sync Mode.');
    }

    const conn = await mongoose.connect(connStr, {
      serverSelectionTimeoutMS: 5000 // 5 seconds timeout
    });

    console.log('\x1b[32m%s\x1b[0m', `🔌 MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('\x1b[31m%s\x1b[0m', `❌ Database Connection Failed: ${error.message}`);
    console.warn('\x1b[33m%s\x1b[0m', '⚠️  Secure-Mesh is proceeding in Isolated Local Memory State.');
  }
};
