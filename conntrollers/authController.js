import { User } from '../models/userModel.js';
import { catchAsync } from '../utils/catchAsync.js';
import jwt from 'jsonwebtoken';

export const signup = catchAsync(async (req, res, next) => {
  // const user = await User.create(req.body); // This introduces a major flaw: Any user can just creates an 'admin' profile using the API

  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN, 
  });

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
});
