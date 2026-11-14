import { Router } from 'express';
import { protect, restrictTo } from '../conntrollers/authController.js';
import {
  getAlTourReviews,
  createTourReview,
  getTourReview,
} from '../conntrollers/reviewController.js';

const reviewRouter = Router({ mergeParams: true });

// GET or POST: /tour/:tourId/reviews
reviewRouter
  .route('/')
  .get(protect, getAlTourReviews)
  .post(protect, restrictTo('user'), createTourReview);

// GET: /tour/:tourId/reviews/:reviewId
reviewRouter.route('/:reviewId').get(protect, getTourReview);

export default reviewRouter;
