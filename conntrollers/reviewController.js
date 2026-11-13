import { Review } from '../models/reviewModel.js';
import APIFeatures from '../utils/apiFeatures.js';
import { catchAsync } from '../utils/catchAsync.js';

export const createReview = catchAsync(async (req, res, next) => {
  const review = await Review.create({ ...req.body, user: req.user._id });

  res.status(201).json({
    status: 'success', // sucess | fail (400) | error (500)
    data: {
      review,
    },
  });
});

export const getAllReviews = catchAsync(async (req, res, next) => {
  const reviews = await Review.find();

  // SEND RESPONSE
  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: {
      reviews,
    },
  });
});
