import mongoose from 'mongoose';

export async function connectDB() {
  const uri = (process.env.MONGODB_URI || '').replace(/^"|"$/g, '');
  if (!uri) throw new Error('MONGODB_URI manquant dans le fichier .env');

  mongoose.set('strictQuery', true);
  await mongoose.connect(uri, {
    dbName: (process.env.MONGODB_DB || 'econs').replace(/^"|"$/g, ''),
    serverSelectionTimeoutMS: 15000,
  });
  console.log('MongoDB connecte sur la base "%s"', mongoose.connection.name);
}
