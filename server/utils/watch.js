import express from 'express';
const router = express.Router();

/** 
 * generate serial number 
 * **/

router.get('/serial', async (req, res, next) => {
    try {
      const randomSerialNumber = generateRandomString(10);
      console.log(randomSerialNumber);
      res.status(200).json({ number: randomSerialNumber });
    } catch (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
    }
  });

export default router;

function generateRandomString(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}