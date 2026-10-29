import fs from 'fs';
import express from 'express';

const app = express(); // Create an express app

app.use(express.json()); // Middleware: Parses all json data coming from the client

// app.get('/', (req, res) => {
//   res.status(200).json({ message: 'Hello from the server side', app: 'Natours' });
// });

// app.post('/', (req, res) => {
//   res.send('You can post to this endpoint...');
// });

const tours = JSON.parse(fs.readFileSync('./dev-data/data/tours-simple.json'));

app.get('/api/v1/tours', (req, res) => {
  res.status(200).json({
    status: 'success', // sucess | fail | error
    results: tours.length,
    data: {
      tours,
    },
  });
});

app.get('/api/v1/tours/:id', (req, res) => {
  const tour = tours.find((tour) => tour.id === Number(req.params.id));

  if (!tour) return res.status(404).json({ status: 'fail', message: 'Invalid ID' });

  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

app.post('/api/v1/tours', (req, res) => {
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
});

app.patch('/api/v1/tours/:id', (req, res) => {
  const tour = tours.find((tour) => tour.id === Number(req.params.id));

  if (!tour) return res.status(404).json({ status: 'fail', message: 'Invalid ID' });

  res.status(200).json({ status: 'success', data: { tour: '<Updated tour here...>' } });
});

app.delete('/api/v1/tours/:id', (req, res) => {
  const tour = tours.find((tour) => tour.id === Number(req.params.id));

  if (!tour) return res.status(404).json({ status: 'fail', message: 'Invalid ID' });

  res.status(204).json({ status: 'success', data: null });
});

const PORT = 3_000;
app.listen(PORT, () => {
  console.log(`App running on port ${PORT}...`);
});
