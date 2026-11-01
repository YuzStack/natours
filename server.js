import './env.js';
import { app } from './app.js';
import connectDB from './config/database.js';

const startServer = async () => {
  try {
    await connectDB();

    app.on('error', (error) => {
      console.log('ERROR', error);
      throw error;
    });

    app.listen(process.env.PORT || 6_000);
  } catch (error) {
    console.log('MongoDB connection failed', error);
  }
};

startServer();
