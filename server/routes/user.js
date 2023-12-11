import express from 'express';
const router = express.Router();

/**
 * User signup api
 */
router.post('/signup', async (req, res) => { userSignUp(req, res) });

/**
 * User signin api
 */
router.post('/signin', async (req, res) => { userSignIn(req, res) });

/**
 * User profile api
 */
router.get('/profile', async (req, res) => { userProfile(req, res) });

/**
 * User medicine api
 */
router.get('/medicine', async (req, res) => { 
    // userProfile(req, res)
    try {
        const randomSerialNumber = generateRandomString(10);
        console.log(randomSerialNumber);
        res.status(200).json({ number: randomSerialNumber });
      } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
      }
});
router.post('/medicine', async (req, res) => { userProfile(req, res) });
function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}
export default router;