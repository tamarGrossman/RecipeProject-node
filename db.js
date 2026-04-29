const mongoose = require('mongoose');

const connectToDatabase = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error('MONGO_URI is missing in environment variables');
  }

  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB Atlas');
};

module.exports = { connectToDatabase };
