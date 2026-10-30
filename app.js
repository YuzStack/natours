import fs from 'fs';
import express from 'express';
import morgan from 'morgan';

const app = express(); // Create an express app

// 1. MIDDLEWARES
app.use(morgan('dev'));
app.use(express.json()); // Middleware: Parses all json data coming from the client

// Our own custum middleware
app.use((req, res, next) => {
  console.log('Hello from the custom middleware (1) 👋');
  next(); // Always remember to add this, else the request-response cycle will stuck in this middleware
});

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

const tours = JSON.parse(fs.readFileSync('./dev-data/data/tours-simple.json'));

// 2. ROUTE HANDLERS
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
  // console.log(req.body);
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

// 3. ROUTES
app.route('/api/v1/tours').get(getAllTours).post(createTour);
app.route('/api/v1/tours/:id').get(getTour).patch(updateTour).delete(deleteTour);

// 4. START SERVER
const PORT = 3_000;
app.listen(PORT, () => {
  console.log(`App running on port ${PORT}...`);
});
