import fs from 'fs';
import express from 'express';
import morgan from 'morgan';
import tourRouter from './routes/tourRoutes.js';
import userRouter from './routes/userRoutes.js';

export const app = express(); // Create express app

// 1. MIDDLEWARES
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));
app.use(express.json()); // Middleware: Parses all json data coming from the client

// 2. ROUTE DECLARATIONS
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// Handling any other undefined routes
app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'fail',
  //   message: `Can't find ${req.originalUrl} on this server!`,
  // });

  const err = new Error(`Can't find ${req.originalUrl} on this server!`);
  err.status = 'fail';
  err.statusCode = 404;

  next(err);
});

// Global Error Handling Middleware
app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
});
