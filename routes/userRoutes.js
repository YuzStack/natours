import express from 'express';
import {
  createUser,
  deleteCurUser,
  deleteUser,
  getAllUsers,
  getUser,
  updateCurUser,
  updateUser,
} from '../conntrollers/userController.js';
import {
  forgotPassword,
  login,
  protect,
  resetPassword,
  signup,
  updatePassword,
} from '../conntrollers/authController.js';

const userRouter = express.Router();

userRouter.post('/signup', signup);
userRouter.post('/login', login);

userRouter.post('/forgot-password', forgotPassword);
userRouter.patch('/reset-password/:token', resetPassword);
userRouter.patch('/change-my-password', protect, updatePassword);

userRouter.patch('/update-my-account', protect, updateCurUser);
userRouter.delete('/close-my-account', protect, deleteCurUser);

userRouter.route('/').get(getAllUsers).post(createUser);
userRouter.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

export default userRouter;
