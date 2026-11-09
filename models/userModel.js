import mongoose, { Schema } from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcrypt';

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
});

userSchema.pre('save', async function () {
  // Only run this function if password was modified
  if (!this.isModified('password')) return;

  // Hash the password with the CPU cost (saltOrRounds) of 11
  this.password = await bcrypt.hash(this.password, 11);

  // Delete passwordConfirm field
  this.passwordConfirm = undefined;
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

export const User = mongoose.model('User', userSchema);
