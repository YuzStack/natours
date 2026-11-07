import './env.js';
import { app } from './app.js';
import mongoose from 'mongoose';

const port = process.env.PORT || 6_000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

mongoose.connect(process.env.MONGODB_URI).then((connectionInstance) =>
  console.log(`\n MongoDB connection succesful!
      ${connectionInstance.connection.host}`)
);

process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');

  // server.close clears all pending requests
  server.close(() => {
    // process.exit(1) "kills" the server
    process.exit(1);
  });
});
