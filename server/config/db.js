import mongoose from 'mongoose';

let isMongoConnected = false;

export const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/campus_helpdesk';
  
  try {
    // Attempt Mongoose connection with a short timeout to not hang if daemon is absent
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 3000,
    });
    isMongoConnected = true;
    console.log(`[Database] MongoDB Connected successfully at: ${mongoURI}`);
  } catch (error) {
    isMongoConnected = false;
    console.warn(`[Database] MongoDB not reachable (${error.message}).`);
    console.log('[Database] -> Gracefully activated persistent JSON Storage engine (server/data/requests.json).');
    console.log('[Database] -> All data, creations, edits, and status changes persist across reloads!');
  }
};

export const getStorageMode = () => (isMongoConnected ? 'mongodb' : 'file-storage');
