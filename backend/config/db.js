const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sharebite', {
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(`ℹ️  MongoDB connection error: ${error.message}`);
    console.log(`ℹ️  To connect to MongoDB, ensure local MongoDB service is started or set MONGODB_URI in backend/.env`);
  }
};

module.exports = connectDB;
