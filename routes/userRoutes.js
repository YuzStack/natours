import express from 'express';
import {
  createUser,
  deleteUser,
  getAllUsers,
  getUser,
  updateUser,
} from '../conntrollers/userController.js';
import { signup } from '../conntrollers/authController.js';

const userRouter = express.Router();

userRouter.post('/signup', signup);

userRouter.route('/').get(getAllUsers).post(createUser);
userRouter.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

export default userRouter;
