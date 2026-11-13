import '../../env.js';
import mongoose from 'mongoose';
import fs from 'fs';
import { Tour } from '../../models/tourModel.js';

const port = process.env.PORT || 6_000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

mongoose.connect(process.env.MONGODB_URI).then((connectionInstance) =>
  console.log(`\n MongoDB connection succesful!
      ${connectionInstance.connection.host}`)
);

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
