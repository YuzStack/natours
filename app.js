import express from 'express';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import tourRouter from './routes/tourRoutes.js';
import userRouter from './routes/userRoutes.js';
import AppError from './utils/appError.js';
import { globalErrorHandler } from './conntrollers/errorController.js';

export const app = express(); // Create express app

// 1. GLOBAL MIDDLEWARES
if (process.env.NODE_ENV === 'development') app.use(morgan('dev')); // Middleware: HTTP request logger
app.use(express.json()); // Middleware: Parses all json data coming from the client

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1_000, // 1hr
  message: 'Too many requests from this IP, please try again in an hour!',
});

app.use('/api', limiter);

// 2. ROUTE DECLARATIONS
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// Handling any other undefined routes
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global Error Handling Middleware
app.use(globalErrorHandler);
