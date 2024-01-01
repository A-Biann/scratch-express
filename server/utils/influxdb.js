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

router.get('/', async (req, res, next) => {  
    try {
      const { time } = req.query;
      const queryApi = new InfluxDB({url, token}).getQueryApi(org)
      
      /** To avoid SQL injection, use a string literal for the query. */
      // const fluxQuery = `from(bucket:"scritchcare") |> range(start: -24h) |> filter(fn: (r) => r._measurement == "scrithcCare")`
      const fluxQuery = time === 'min'
    ? `from(bucket:"scritchcare") |> range(start: -15m) |> filter(fn: (r) => r._measurement == "scrithcCare")`
    : `from(bucket:"scritchcare") |> range(start: -24h) |> filter(fn: (r) => r._measurement == "scrithcCare")`;

      const data = [];
      let totalHand = 0;
      let totalBody = 0;
      let totalLower = 0;
      let totalNeutral = 0;
  
      for await (const { values, tableMeta } of queryApi.iterateRows(fluxQuery)) {
        const o = tableMeta.toObject(values);
        const timestamp = new Date(o._time);
  
        // 加上八小時
        const adjustedTimestamp = new Date(timestamp.getTime() + 8 * 60 * 60 * 1000);
  
        // 將 timestamp 轉換為每兩分鐘一個區間的形式
        const intervalStart = time === 'min' 
        ? new Date(Math.floor(adjustedTimestamp.getTime() / (2 * 60 * 1000)) * (2 * 60 * 1000))
        : new Date(Math.floor(adjustedTimestamp.getTime() / (1 * 60 * 60 * 1000)) * (1 * 60 * 60 * 1000));
  
        // 查找 data 中是否已有該區間的資料
        const existingData = data.find(item => item.date.getTime() === intervalStart.getTime());
  
        // 如果不存在，則新增一個新的區間
        if (!existingData) {
          const newData = { date: intervalStart, hand: 0, body: 0, lower: 0, neutral: 0 };
  
          // 根據 result 的值更新相應的計數
          switch (o._value) {
            case 0:
              newData.neutral++;
              totalNeutral++;
              break;
            case 1:
              newData.body++;
              totalBody++;
              break;
            case 2:
              newData.lower++;
              totalLower++;
              break;
            case 3:
              newData.hand++;
              totalHand++;
              break;
            default:
              break;
          }
  
          data.push(newData);
        } else {
          // 如果存在，則更新相應的計數
          switch (o._value) {
            case 0:
              existingData.neutral++;
              totalNeutral++;
              break;
            case 1:
              existingData.body++;
              totalBody++;
              break;
            case 2:
              existingData.lower++;
              totalLower++;
              break;
            case 3:
              existingData.hand++;
              totalHand++;
              break;
            default:
              break;
          }
        }
      }
  
      // 計算每個時間段的抓癢百分比
      const percentage = data.map(item => {
        const total = item.hand + item.body + item.lower + item.neutral;
        return total === 0 ? 0 : ((item.hand + item.body + item.lower) / total) * 100;
      });
  
      res.status(200).json({ data, percentage });
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

      let resultInt = 0;
      if (item.result === 'neutral') {
        resultInt = 0;
      } else if (item.result === 'body') {
        resultInt = 1;
      } else if (item.result === 'lower') {
        resultInt = 2;
      } else if (item.result === 'hand') {
        resultInt = 3;
      }
  
      console.log(stringToDate);
      const point = new Point('scrithcCare')
        .tag('device', data.device)
        .intField('result', resultInt);
  
      point.timestamp(timestampAsInt);
      return point;
    });
}

export default router;