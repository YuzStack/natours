import mongoose, { Schema } from 'mongoose';

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
  this.populate('user', 'name photo');
});

export const Review = mongoose.model('Review', reviewSchema);
