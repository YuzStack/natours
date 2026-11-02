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
