import mongoose from 'mongoose';
import dns from 'dns';

// use Google DNS for reliable Atlas SRV resolution
dns.setServers(['8.8.8.8', '8.8.4.4']);

const connectDB = async (): Promise<void> => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.error('MONGODB_URI is not defined in .env');
      process.exit(1);
    }

    console.log('Connecting to MongoDB...');

    await mongoose.connect(uri, {
      autoIndex: true,
      serverSelectionTimeoutMS: 10000,
    });

    console.log(`MongoDB connected: ${mongoose.connection.host}/${mongoose.connection.name}`);

    mongoose.connection.on('error', (err) => {
      console.error(`MongoDB runtime error: ${err.message}`);
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error(`MongoDB connection failed: ${message}`);
    process.exit(1);
  }
};

export default connectDB;
