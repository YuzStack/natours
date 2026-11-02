import fs from 'fs';
import '../../env.js';
import { Tour } from '../../models/tourModel.js';
import connectDB from '../../config/database.js';

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

// READ JSON FILE
const tours = JSON.parse(fs.readFileSync('./dev-data/data/tours-simple.json', 'utf-8'));

// IMPORT DATA INTO DB
const importData = async () => {
  try {
    await Tour.create(tours);
    console.log('Data successfully loaded!');
  } catch (error) {
    console.log(error);
  }
  process.exit();
};

// DELETE ALL DATA FROM COLLECTION DB
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log('Data successfully deleted!');
  } catch (error) {
    console.log(error);
  }
  process.exit();
};

if (process.argv.at(2) === '--import') {
  importData();
} else if (process.argv.at(2) === '--delete') {
  deleteData();
}

console.log(process.argv);
