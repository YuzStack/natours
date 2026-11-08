import { User } from '../models/userModel.js';
import AppError from '../utils/appError.js';
import { catchAsync } from '../utils/catchAsync.js';
import jwt from 'jsonwebtoken';

const signToken = (userID) => {
  return jwt.sign({ id: userID }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

export const signup = catchAsync(async (req, res, next) => {
  // const user = await User.create(req.body); // This has a major flaw: Any user can just creates an 'admin' profile using the API

  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  const token = signToken(user._id);

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
});

export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1. Check if email and password provided are valid
  if (!email || !password) {
    return next(
      new AppError('Kindly provide valid login credentials! (i.e., email and passowrd)', 400)
    );
  }

  // 2. Check if the user exists (in our database) && the password provided is correct
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.comparePassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  // 3. If everything is okay, send the JWT token to client
  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    token,
  });
});
