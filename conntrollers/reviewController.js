import { Review } from '../models/reviewModel.js';
import { createDoc, deleteDoc, getAllDocs, getDoc, updateDoc } from './controllerFactory.js';

export const setTourIdFilter = (req, res, next) => {
  req.query.tour = req.params.tourId;
  next();
};

export const setTourUserIds = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user._id;
  next();
};

export const getAlTourReviews = getAllDocs(Review);
export const getTourReview = getDoc(Review);
export const createTourReview = createDoc(Review);
export const updateTourReview = updateDoc(Review);
export const deleteTourReview = deleteDoc(Review);
