import fs from 'fs';
import express from 'express';

const app = express(); // Create an express app

app.use(express.json()); // Middleware: Parses all json data coming from the client

const tours = JSON.parse(fs.readFileSync('./dev-data/data/tours-simple.json'));

const getAllTours = (req, res) => {
  res.status(200).json({
    status: 'success', // sucess | fail | error
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

// app.get('/api/v1/tours', getAllTours);
// app.post('/api/v1/tours', createTour);
// app.get('/api/v1/tours/:id', getTour);
// app.patch('/api/v1/tours/:id', updateTour);
// app.delete('/api/v1/tours/:id', deleteTour);

app.route('/api/v1/tours').get(getAllTours).post(createTour);
app.route('/api/v1/tours/:id').get(getTour).patch(updateTour).delete(deleteTour);

const PORT = 3_000;
app.listen(PORT, () => {
  console.log(`App running on port ${PORT}...`);
});
