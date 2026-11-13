import { Router } from 'express';
import { protect, restrictTo } from '../conntrollers/authController.js';
import { createReview, getAllReviews } from '../conntrollers/reviewController.js';

const reviewRouter = Router();

reviewRouter.route('/').post(protect, restrictTo('user'), createReview).get(protect, getAllReviews);

export default reviewRouter;
