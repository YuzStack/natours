import fs from 'fs';

const tours = JSON.parse(fs.readFileSync('./dev-data/data/tours-simple.json'));

export const checkId = (req, res, next, val) => {
  console.log(`Tour id is: ${val}`);
  const tour = tours.find((tour) => tour.id === Number(req.params.id));
  if (!tour) return res.status(404).json({ status: 'fail', message: 'Invalid ID' });
  next();
};

export const getAllTours = (req, res) => {
  res.status(200).json({
    status: 'success', // sucess | fail | error
    requestedAt: req.requestTime,
    results: tours.length,
    data: {
      tours,
    },
  });
};

export const getTour = (req, res) => {
  const tour = tours.find((tour) => tour.id === Number(req.params.id));

  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
};

export const createTour = (req, res) => {
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

export const updateTour = (req, res) => {
  res.status(200).json({ status: 'success', data: { tour: '<Updated tour here...>' } });
};

export const deleteTour = (req, res) => {
  res.status(204).json({ status: 'success', data: null });
};
