import { Review } from '../models/reviewModel.js';
import { Tour } from '../models/tourModel.js';
import APIFeatures from '../utils/apiFeatures.js';
import AppError from '../utils/appError.js';
import { catchAsync } from '../utils/catchAsync.js';
import { createDoc, deleteDoc, updateDoc } from './controllerFactory.js';

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

export const getTourReview = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  res.status(200).json({
    status: 'success',
    data: {
      review,
    },
  });
});

export const setTourUserIds = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user._id;
  next();
};

export const createTourReview = createDoc(Review);
export const updateTourReview = updateDoc(Review);
export const deleteTourReview = deleteDoc(Review);
