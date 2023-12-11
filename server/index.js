import 'dotenv/config'
import express from "express";
import userRoutes from './routes/user.js';
import doctorRoutes from './routes/doctor.js';
import csvRoutes from './utils/csv.js';
import influxdbRoutes from './utils/influxdb.js';
import watchRoutes from './utils/watch.js';

const app = express();
const port = 3000; // default port to listen
app.use(express.json());

app.use('/1.0/doctor', doctorRoutes);
app.use('/1.0/user', userRoutes);
app.use('/1.0/watch', watchRoutes);

app.use('/1.0/csv', csvRoutes);
app.use('/1.0/influxdb', influxdbRoutes);

app.get('/', async (req, res, next) => {
  res.status(200).send('Backend health check');
});

// start the Express server
app.listen(port, () => {
  console.log(`server started at http://localhost:${port}`);
});
