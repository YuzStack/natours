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

  console.log(stats);
  await Tour.findByIdAndUpdate(tourId, {
    ratingsQuantity: stats.at(0).numRatings,
    ratingsAverage: Number(stats.at(0).avgRating.toFixed(1)),
  });
};

reviewSchema.post('save', function () {
  // "this" points to the current document (that has been saved)
  this.constructor.calcAverageRatings(this.tour);
});

export const Review = mongoose.model('Review', reviewSchema);
