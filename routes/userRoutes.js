import { Router } from 'express';
import {
  createUser,
  deleteCurUser,
  deleteUser,
  getAllUsers,
  getCurUser,
  getUser,
  updateCurUser,
  updateUser,
} from '../conntrollers/userController.js';
import {
  forgotPassword,
  login,
  protect,
  resetPassword,
  restrictTo,
  signup,
  updatePassword,
} from '../conntrollers/authController.js';

const userRouter = Router();

userRouter.post('/signup', signup);
userRouter.post('/login', login);
userRouter.post('/forgot-password', forgotPassword);
userRouter.patch('/reset-password/:token', resetPassword);

userRouter.use(protect); // Protect all routes that comes after this middleware
userRouter.patch('/change-my-password', updatePassword);
userRouter.get('/my-account', getCurUser, getUser);
userRouter.patch('/update-my-account', updateCurUser, getUser);
userRouter.delete('/close-my-account', deleteCurUser);

userRouter.use(restrictTo('admin')); // Restrict all routes that comes after this middleware
userRouter.route('/').get(getAllUsers).post(createUser);
userRouter.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

export default userRouter;
