import express from 'express';
const router = express.Router();
import { InfluxDB, Point, currentTime } from '@influxdata/influxdb-client'

/** influxdb config Environment variables **/
const url = process.env.INFLUX_URL
const token = process.env.INFLUX_TOKEN
const org = process.env.INFLUX_ORG
const bucket = process.env.INFLUX_BUCKET
const influxDB = new InfluxDB({ url, token })

/** 
 * get result data and write to influxdb 
 * **/
router.post('/', async (req, res, next) => {  
    try {
      console.log(transformToPoints(req.body));
  
      const points = transformToPoints(req.body);
      await new Promise((resolve, reject) => {
        const writeApi = influxDB.getWriteApi(org, bucket, 'ms');
        
        try {
          writeApi.writePoints(points);
          writeApi.close()
            .then(resolve)
            .catch(reject);
        } catch (error) {
          reject(error);
        }
      });
  
      res.status(200).json({ message: 'ok' });
    } catch (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
    }
  });
  
function transformToPoints(data) {
    return data.data.map(item => {
      // format time to influxdb point
      const isoDateString = item.time.replace(/_/g, ' ').replace(/(\d{4})(\d{2})(\d{2}) (\d{2})(\d{2})(\d{2})/, '$1-$2-$3T$4:$5:$6Z');
      console.log(isoDateString);
      const stringToDate = new Date(isoDateString).getTime();
      const timestampAsInt = parseInt(stringToDate) - 1000 * 60 * 60 * 8;
  
      console.log(stringToDate);
      const point = new Point('scrithcCare')
        .tag('device', data.device)
        .intField('result', item.result);
  
      point.timestamp(timestampAsInt);
      return point;
    });
}

export default router;