import crypto from 'node:crypto';
import { promisify } from 'node:util';
import jwt from 'jsonwebtoken';
import { User } from '../models/userModel.js';
import AppError from '../utils/appError.js';
import { catchAsync } from '../utils/catchAsync.js';
import { sendEmail } from '../utils/email.js';

const signToken = (userID) => {
  return jwt.sign({ id: userID }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, res, statusCode) => {
  const token = signToken(user._id);
  const cookieOpts = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1_000),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') cookieOpts.secure = true;

  res.cookie('jwt', token, cookieOpts);

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

export const signup = catchAsync(async (req, res, next) => {
  // const user = await User.create(req.body); // This has a major flaw: Any user can just creates an 'admin' profile using the API

  const { name, email, password, passwordConfirm } = req.body;
  const user = await User.create({ name, email, password, passwordConfirm });

  user.password = undefined; // Removes the password property from the user object that will be sent to the client

  createSendToken(user, res, 201);
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
  createSendToken(user, res, 200);
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

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    console.log(roles);
    // roles is an array, e.g., ['admin', 'lead-guide']
    if (!roles.includes(req.user.role))
      return next(new AppError('You do not have persmision to perform this action', 403));

    next();
  };
};

export const forgotPassword = catchAsync(async (req, res, next) => {
  // 1. Get user base on the POSTed (i.e., provided) email
  const user = await User.findOne({ email: req.body.email });
  if (!user) return next(new AppError('There is no user with the provided email address', 404));

  // 2. Generate a random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3. Send it to the user's email
  const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/reset-password/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}\nIf you didn't forget your password, please ignore this email!`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10mins)',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: `Password reset token sent to ${user.email}`,
    });
  } catch (error) {
    console.log(error);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError('There was an error sending the email. Please try again later.', 500));
  }
});

export const resetPassword = catchAsync(async (req, res, next) => {
  // 1. Get user base on the token received
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2. If there is user, and the token has not expired, set the new password
  if (!user)
    return next(
      new AppError(
        'Token is invalid or has expired. Kindly request for a new password reset token.',
        400
      )
    );

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 3. Update passwordChangedAt property for the user in the background (i.e., pre-save middleware/hook in th user model)

  // 4. Log the user in, send JWT
  createSendToken(user, res, 200);
});

export const updatePassword = catchAsync(async (req, res, next) => {
  // 1. Get user from the collection
  const user = await User.findById(req.user._id).select('+password');

  // 2. Check if the user POSTed the current password, and it is correct
  if (!req.body.curPassword) return next(new AppError('Kindly provide your current password', 400));
  const isCorrect = await user.comparePassword(req.body.curPassword, user.password);

  // 3. If so, update the user's password
  if (!isCorrect) return next(new AppError('Current password incorrect!', 401));
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  // 4. Log the user in, send JWT
  createSendToken(user, res, 200);
});
