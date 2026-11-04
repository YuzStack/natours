import express from 'express';
import {
  aliasTopTours,
  createTour,
  deleteTour,
  getAllTours,
  getTour,
  getTourStats,
  updateTour,
} from '../conntrollers/tourController.js';

const tourRouter = express.Router();

tourRouter.route('/top-5-cheap').get(aliasTopTours, getAllTours);
tourRouter.route('/tour-stats').get(getTourStats);

tourRouter.route('/').get(getAllTours).post(createTour);
tourRouter.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

export default tourRouter;
