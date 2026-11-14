import { Review } from '../models/reviewModel.js';
import { Tour } from '../models/tourModel.js';
import APIFeatures from '../utils/apiFeatures.js';
import AppError from '../utils/appError.js';
import { catchAsync } from '../utils/catchAsync.js';
import { deleteDoc } from './controllerFactory.js';

export const getAlTourReviews = catchAsync(async (req, res, next) => {
  const reviews = await Review.find({ tour: req.params.tourId });

  // SEND RESPONSE
  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: {
      reviews,
    },
  });
});

export const createTourReview = catchAsync(async (req, res, next) => {
  // 1. Parse all the necessary data
  const { comment, rating } = req.body;
  const tour = req.params.tourId;
  const user = req.user._id;

  // 2. Check if the tour exists
  const tourExists = await Tour.exists({ _id: tour });
  if (!tourExists)
    return next(new AppError('Tour does not exists! Try reviewing some other tours.', 400));

  // 3. Create the review
  const review = await Review.create({ comment, rating, tour, user });

  // 4. Return response
  res.status(201).json({
    status: 'success', // sucess | fail (400) | error (500)
    data: {
      review,
    },
  });
});

export const getTourReview = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  res.status(200).json({
    status: 'success',
    data: {
      review,
    },
  });
});

export const deleteTourReview = deleteDoc(Review);
