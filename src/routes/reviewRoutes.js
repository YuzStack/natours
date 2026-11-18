import { Router } from 'express';
import { protect, restrictTo } from '../conntrollers/authController.js';
import {
  getAlTourReviews,
  createTourReview,
  getTourReview,
  deleteTourReview,
  updateTourReview,
  setTourUserIds,
  setTourIdFilter,
  checkDuplicateReview,
} from '../conntrollers/reviewController.js';

const reviewRouter = Router({ mergeParams: true });
reviewRouter.use(protect); // Protect all routes that comes after this middleware

reviewRouter
  .route('/')
  .get(setTourIdFilter, getAlTourReviews)
  .post(restrictTo('user'), setTourUserIds, checkDuplicateReview, createTourReview);

reviewRouter
  .route('/:id')
  .get(getTourReview)
  .patch(restrictTo('user', 'admin'), updateTourReview)
  .delete(restrictTo('user', 'admin'), deleteTourReview);

export default reviewRouter;
