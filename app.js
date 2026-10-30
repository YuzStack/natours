import fs from 'fs';
import express from 'express';
import morgan from 'morgan';

const app = express(); // Create an express app

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

const tours = JSON.parse(fs.readFileSync('./dev-data/data/tours-simple.json'));
const users = JSON.parse(fs.readFileSync('./dev-data/data/users.json'));

// 2. ROUTE HANDLERS
// 2.1 Tours
const getAllTours = (req, res) => {
  console.log(req.requestTime);

  res.status(200).json({
    status: 'success', // sucess | fail | error
    requestedAt: req.requestTime,
    results: tours.length,
    data: {
      tours,
    },
  });
};

const getTour = (req, res) => {
  const tour = tours.find((tour) => tour.id === Number(req.params.id));

  if (!tour) return res.status(404).json({ status: 'fail', message: 'Invalid ID' });

  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
};

const createTour = (req, res) => {
  const newId = tours.length;
  const newTour = Object.assign({ id: newId }, req.body);

  tours.push(newTour);
  fs.writeFile('./dev-data/data/tours-simple.json', JSON.stringify(tours), (err) => {
    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  });
};

const updateTour = (req, res) => {
  const tour = tours.find((tour) => tour.id === Number(req.params.id));

  if (!tour) return res.status(404).json({ status: 'fail', message: 'Invalid ID' });

  res.status(200).json({ status: 'success', data: { tour: '<Updated tour here...>' } });
};

const deleteTour = (req, res) => {
  const tour = tours.find((tour) => tour.id === Number(req.params.id));

  if (!tour) return res.status(404).json({ status: 'fail', message: 'Invalid ID' });

  res.status(204).json({ status: 'success', data: null });
};

// 2.2 Users
const getAllUsers = (req, res) => {
  res.status(200).json({
    status: 'success',
    results: users.length,
    data: { users },
  });
};

const getUser = (req, res) => {
  const user = users.find((user) => user._id === req.params.id);

  if (!user) return res.status(404).json({ status: 'fail', message: 'Invalid ID' });

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
};

const createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!',
  });
};

const updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!',
  });
};

const deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!',
  });
};

// 3. ROUTES
// 3.1 Tours
app.route('/api/v1/tours').get(getAllTours).post(createTour);
app.route('/api/v1/tours/:id').get(getTour).patch(updateTour).delete(deleteTour);

// 3.1 Users
app.route('/api/v1/users').get(getAllUsers).post(createUser);
app.route('/api/v1/users/:id').get(getUser).patch(updateUser).delete(deleteUser);

// 4. START SERVER
const PORT = 3_000;
app.listen(PORT, () => {
  console.log(`App running on port ${PORT}...`);
});
