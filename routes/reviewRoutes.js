import { Router } from 'express';
import { protect, restrictTo } from '../conntrollers/authController.js';
import {
  getAlTourReviews,
  createTourReview,
  getTourReview,
  deleteTourReview,
  updateTourReview,
  setTourUserIds,
} from '../conntrollers/reviewController.js';

const reviewRouter = Router({ mergeParams: true });

// GET or POST: /tour/:tourId/reviews
reviewRouter
  .route('/')
  .get(protect, getAlTourReviews)
  .post(protect, restrictTo('user'), setTourUserIds, createTourReview);

// GET: /tour/:tourId/reviews/:reviewId
reviewRouter
  .route('/:id')
  .get(protect, getTourReview)
  .patch(protect, updateTourReview)
  .delete(protect, deleteTourReview);

export default reviewRouter;
