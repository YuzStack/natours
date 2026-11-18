import '../env.js';
import mongoose from 'mongoose';
import fs from 'node:fs';
import { Tour } from '../models/tourModel.js';
import { User } from '../src/models/userModel.js';
import { Review } from '../src/models/reviewModel.js';

mongoose.connect(process.env.MONGODB_URI).then((connectionInstance) =>
  console.log(`\n MongoDB connection succesful!
      ${connectionInstance.connection.host}`)
);

// READ JSON FILE
const tours = JSON.parse(fs.readFileSync('./dev-data/tours.json', 'utf-8'));
const users = JSON.parse(fs.readFileSync('./dev-data/users.json', 'utf-8'));
const reviews = JSON.parse(fs.readFileSync('./dev-data/reviews.json', 'utf-8'));

// IMPORT DATA INTO THE DATABASE
const importData = async () => {
  try {
    await Tour.create(tours);
    await User.create(users, { validateBeforeSave: false });
    await Review.create(reviews);
    console.log('Data successfully loaded!');
  } catch (error) {
    console.log(error);
  }
  process.exit();
};

// DELETE ALL DATA FROM THE DATABASE
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
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
