import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import { User } from '../models/userModel.js';
import AppError from '../utils/appError.js';
import { catchAsync } from '../utils/catchAsync.js';

const signToken = (userID) => {
  return jwt.sign({ id: userID }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

export const signup = catchAsync(async (req, res, next) => {
  // const user = await User.create(req.body); // This has a major flaw: Any user can just creates an 'admin' profile using the API

  const { name, email, password, passwordConfirm } = req.body;
  const user = await User.create({ name, email, password, passwordConfirm });

  user.password = undefined; // Removes the password property from the user object that will be sent to the client
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

export const protect = catchAsync(async (req, res, next) => {
  // 1. Try getting the token and check if it's there
  let token;
  const { authorization } = req.headers;
  if (authorization && authorization.startsWith('Bearer')) {
    token = authorization.split(' ').at(1);
  }

  if (!token) return next(new AppError('You are not logged in! Please login to get access.', 401));

  // 2. Verify the token
  const decodedPayload = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3. Check if the user (with the token) still exists
  const user = await User.findById(decodedPayload.id);
  if (!user) return next(new AppError('The user with this token no longer exist!', 401));

  // 4. Check if the user has changed password since the token was issued
  const hasChanged = user.changedPasswordAfter(decodedPayload.iat);
  if (hasChanged)
    return next(new AppError('User recently changed password! Please log in again.', 401));

  // 5. Grant access to the protected route
  req.user = user;
  next();
});
