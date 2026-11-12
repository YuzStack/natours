import express from 'express';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import ExpressMongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import tourRouter from './routes/tourRoutes.js';
import userRouter from './routes/userRoutes.js';
import AppError from './utils/appError.js';
import { globalErrorHandler } from './conntrollers/errorController.js';

export const app = express(); // Create express app

// 1. GLOBAL MIDDLEWARES
app.use(helmet()); // Set security HTTP headers
if (process.env.NODE_ENV === 'development') app.use(morgan('dev')); // HTTP request logger
app.use(express.json({ limit: '10kb' })); // Body parser: Reads data from body into req.body
app.use(ExpressMongoSanitize()); // Data sanitization against NoSQL query injection
app.use(xss()); // Data sanitization against XSS
app.use(express.static('./public')); // Serve static files

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1_000, // 1hr
  message: 'Too many requests from this IP, please try again in an hour!',
});
app.use('/api', limiter); // Limit requests from saem API in an hour window

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.headers);
  next();
});

// 2. ROUTE DECLARATIONS
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// Handling any other undefined routes
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global Error Handling Middleware
app.use(globalErrorHandler);
