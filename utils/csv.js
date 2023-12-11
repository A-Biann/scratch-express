import express from 'express';
import csv from 'csv-parser';
import multer from 'multer';

const router = express.Router();
const upload = multer({ dest: '../tmp/csv' });
/** 
 * upload csv file 
 * **/
const readFile = (fileName) => new Promise((resolve, reject) => {
    const stream = [];
  
    fs.createReadStream(fileName)
      .pipe(csv())
      .on('data', (data) => stream.push(data))
      .on('end', () => {
        resolve(stream);
      });
  });
  
router.post('/', upload.single('file'), async (req, res, next) => {
    console.log(req.headers);
    console.log(req.file);
    try {
  
      const fileContents = await readFile(req.file.path);
      fs.unlinkSync(req.file.path);
      res.json(fileContents);
    } catch (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
    }
});

export default router;