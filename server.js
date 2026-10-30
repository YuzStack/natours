import './env.js';
import { app } from './app.js';

// 3. START SERVER
const port = process.env.PORT || 6_000;
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
