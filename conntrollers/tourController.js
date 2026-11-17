import { query } from 'express';
import { Tour } from '../models/tourModel.js';
import { catchAsync } from '../utils/catchAsync.js';
import { createDoc, deleteDoc, getAllDocs, getDoc, updateDoc } from './controllerFactory.js';
import AppError from '../utils/appError.js';

export const aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

export const getAllTours = getAllDocs(Tour);
export const getTour = getDoc(Tour, { path: 'reviews' });
export const createTour = createDoc(Tour);
export const updateTour = updateDoc(Tour);
export const deleteTour = deleteDoc(Tour);

export const getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});

export const getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = Number(req.params.year);
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: { numTourStarts: -1 },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      plan,
    },
  });
});

// e.g., /tours-within?distance=233&latlng=34.111745,-118.113491&unit=mi
export const getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit = 'mi' } = req.query;
  const [lat, lng] = latlng.split(',').map(Number);

  const radius = unit === 'mi' ? Number(distance) / 3_963.2 : Number(distance) / 6_378.1;

  if (!lat || !lng)
    return next(new AppError('Please provide latitude and longitude in the format lag,lng.', 400));

  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[Number(lng), Number(lat)], radius] } },
  });

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: { data: tours },
  });
});
