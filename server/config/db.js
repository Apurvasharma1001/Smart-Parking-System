const mongoose = require('mongoose');

/**
 * MongoDB Connection Handler
 * Reads MONGO_URI from environment variables and establishes connection
 */
const connectDB = async () => {
  try {
    // Read MONGO_URI from .env
    const mongoURI = process.env.MONGO_URI;
    
    if (!mongoURI) {
      throw new Error('MONGO_URI is not defined in environment variables');
    }

    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    console.log('🔄 Attempting to connect to MongoDB...');
    const conn = await mongoose.connect(mongoURI, options);
    
    // Connection success log
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });

  } catch (error) {
    // Connection error log
    console.error(`\n❌ MongoDB Connection Error: ${error.message}\n`);
    console.error('📋 Troubleshooting Steps:');
    console.error('   1. Check if MongoDB is installed and running');
    console.error('   2. For local MongoDB: Start the service or run "mongod"');
    console.error('   3. For MongoDB Atlas: Check your connection string');
    console.error('   4. Verify MONGO_URI in .env file\n');
    process.exit(1);
  }
};

module.exports = connectDB;
