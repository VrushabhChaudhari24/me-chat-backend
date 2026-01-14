import mongoose from "mongoose";

const connectDB = async () => {
  try {
    mongoose.set('bufferCommands', false); // Disable buffering
 
    await mongoose.connect('mongodb+srv://vrushabhchaudhari_db_user:KL32y1jyHgc3Brtq@cluster0.4jnq7rq.mongodb.net/?appName=Cluster0', {
      maxPoolSize: 50,              // Adjust based on pod count
      minPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      retryWrites: true,
      readPreference: 'secondaryPreferred', // If replica exists
    });
 
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

export default connectDB;
