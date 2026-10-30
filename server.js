import { app } from './app.js';

// 3. START SERVER
const PORT = 3_000;
app.listen(PORT, () => {
  console.log(`App running on port ${PORT}...`);
});
