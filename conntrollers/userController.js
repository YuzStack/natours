import { User } from '../models/userModel.js';
import AppError from '../utils/appError.js';
import { catchAsync } from '../utils/catchAsync.js';
import { createDoc, deleteDoc, getAllDocs, getDoc, updateDoc } from './controllerFactory.js';

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });

  return newObj;
};

export const updateCurUser = catchAsync(async (req, res, next) => {
  // 1. Create error if the user POSTs password data
  if (req.body.password || req.body.passwordConfirm)
    return next(
      new AppError('This route is not for password updates. Please use /change-my-password', 400)
    );

  // 2. Filter out unwanted fields that are not allowed to be updated
  const filteredBody = filterObj(req.body, 'name', 'email');

  // 3. Update the user document
  const user = await User.findByIdAndUpdate(req.user._id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

export const deleteCurUser = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

export const getAllUsers = getAllDocs(User);
export const getUser = getDoc(User);
export const createUser = createDoc(User);
export const updateUser = updateDoc(User); // Do NOT update passwords with this!
export const deleteUser = deleteDoc(User);
