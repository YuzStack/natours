import { Router } from 'express';
import {
  aliasTopTours,
  createTour,
  deleteTour,
  getAllTours,
  getDistances,
  getMonthlyPlan,
  getTour,
  getTourStats,
  getToursWithin,
  updateTour,
} from '../conntrollers/tourController.js';
import { protect, restrictTo } from '../conntrollers/authController.js';
import reviewRouter from './reviewRoutes.js';

const tourRouter = Router();

tourRouter.route('/top-5-cheap').get(aliasTopTours, getAllTours);
tourRouter.route('/tour-stats').get(getTourStats);
tourRouter
  .route('/monthly-plan/:year')
  .get(protect, restrictTo('admin', 'lead-guide', 'guide'), getMonthlyPlan);

tourRouter.route('/tours-within').get(getToursWithin); // e.g., /tours-within?distance=233&latlng=-40,45&unit=mi
tourRouter.route('/distances').get(getDistances); // e.g., /distances?latlng=-40,45&unit=mi

tourRouter.route('/').get(getAllTours).post(protect, restrictTo('admin', 'lead-guide'), createTour);
tourRouter
  .route('/:id')
  .get(getTour)
  .patch(protect, restrictTo('admin', 'lead-guide'), updateTour)
  .delete(protect, restrictTo('admin', 'lead-guide'), deleteTour);

// NESTED ROUTE (REVIEWS)
tourRouter.use('/:tourId/reviews', reviewRouter);

export default tourRouter;
