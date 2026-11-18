import mongoose, { Schema } from 'mongoose';
import { Tour } from './tourModel.js';

const reviewSchema = new Schema(
  {
    comment: {
      type: String,
      required: [true, 'Comment is required! Kindly write a comment.'],
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required! Kindly provide a rating.'],
      min: [1, 'Rating can not be less than 1.0'],
      max: [5, 'Rating can not be more than 5.0'],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'A review must belong to a tour!'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'A review must belong to a user!'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function () {
  // "this" points to the current query
  // this.populate({ path: 'user', select: 'name photo' });
  this.populate('user', 'name photo'); // A shorthand syntax for the same operation above
});

reviewSchema.statics.calcAverageRatings = async function (tourId) {
  // "this" points to the current Model
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        numRatings: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  if (stats.length > 0)
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats.at(0).numRatings,
      ratingsAverage: stats.at(0).avgRating,
    });
  else
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
};

reviewSchema.post('save', function () {
  // "this" points to the current review document (that has just been saved)
  this.constructor.calcAverageRatings(this.tour);
});

reviewSchema.post(/^findOneAnd/, async function (doc) {
  // "doc" points to the review document that was just updated or deleted
  if (doc) await doc.constructor.calcAverageRatings(doc.tour);
});

export const Review = mongoose.model('Review', reviewSchema);
