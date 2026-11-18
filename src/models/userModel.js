import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcrypt';
import validator from 'validator';
import crypto from 'node:crypto';

const userSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name!'],
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email address'],
  },
  photo: String,
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Kindly confirm your password'],
    validate: {
      validator: function (val) {
        // This only works on CREATE and SAVE!
        return val === this.password;
      },
      message: 'Passwords are not the same',
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

userSchema.pre('save', async function () {
  // "this" points to the current document
  if (!this.isModified('password')) return; // Only run this function if password was modified

  // Hash the password with the CPU cost (saltOrRounds) of 11
  this.password = await bcrypt.hash(this.password, 11);

  // Delete passwordConfirm field
  this.passwordConfirm = undefined;
});

userSchema.pre('save', async function () {
  // "this" points to the current document
  if (!this.isModified('password') || this.isNew) return;

  this.passwordChangedAt = Date.now() - 1000; // A second delay to prevent race conditions with the due to be assigned JWT
});

userSchema.pre(/^find/, function () {
  // "this" points to the current query
  this.find({ active: { $ne: false } });
});

userSchema.methods.comparePassword = async function (providedPassword, userPassword) {
  return await bcrypt.compare(providedPassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    // Convert the document's passwordChangedAt date to a timestamp in seconds
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp; // i.e., has the password changed since the token was issued?
  }

  // False means the password has NOT changed
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // Reset token expires in 10mins

  return resetToken;
};

export const User = mongoose.model('User', userSchema);
