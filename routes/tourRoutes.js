import { Router } from 'express';
import {
  aliasTopTours,
  createTour,
  deleteTour,
  getAllTours,
  getMonthlyPlan,
  getTour,
  getTourStats,
  updateTour,
} from '../conntrollers/tourController.js';
import { protect, restrictTo } from '../conntrollers/authController.js';
import reviewRouter from './reviewRoutes.js';

const tourRouter = Router();

tourRouter.route('/top-5-cheap').get(aliasTopTours, getAllTours);
tourRouter.route('/tour-stats').get(getTourStats);
tourRouter.route('/monthly-plan/:year').get(getMonthlyPlan);

tourRouter.route('/').get(protect, getAllTours).post(protect, createTour);
tourRouter
  .route('/:id')
  .get(getTour)
  .patch(updateTour)
  .delete(protect, restrictTo('admin', 'lead-role'), deleteTour);

// NESTED ROUTE (REVIEWS)
tourRouter.use('/:tourId/reviews', reviewRouter);

export default tourRouter;
