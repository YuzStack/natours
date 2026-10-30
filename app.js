import fs from 'fs';
import express from 'express';
import morgan from 'morgan';
import tourRouter from './routes/tourRoutes.js';
import userRouter from './routes/userRoutes.js';

export const app = express(); // Create express app

// 1. MIDDLEWARES
// 1.1 Third-Party Middlewares
app.use(morgan('dev'));
app.use(express.json()); // Middleware: Parses all json data coming from the client

// 1.2 Our Own Custum Middlewares
app.use((req, res, next) => {
  console.log('Hello from the custom middleware (1) 👋');
  next(); // Always remember to add this, else the request-response cycle will stuck in this middleware
});

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// 2. ROUTE DECLARATIONS
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
