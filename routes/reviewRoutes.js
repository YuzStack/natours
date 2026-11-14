import { Router } from 'express';
import { protect, restrictTo } from '../conntrollers/authController.js';
import {
  getAlTourReviews,
  createTourReview,
  getTourReview,
  deleteTourReview,
} from '../conntrollers/reviewController.js';

const reviewRouter = Router({ mergeParams: true });

// GET or POST: /tour/:tourId/reviews
reviewRouter
  .route('/')
  .get(protect, getAlTourReviews)
  .post(protect, restrictTo('user'), createTourReview);

// GET: /tour/:tourId/reviews/:reviewId
reviewRouter.route('/:id').get(protect, getTourReview).delete(protect, deleteTourReview);

export default reviewRouter;
