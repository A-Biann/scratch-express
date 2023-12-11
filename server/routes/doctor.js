import express from 'express';
const router = express.Router();

/**
 * patient api
 */
router.post('/patient', async (req, res) => { userSignUp(req, res) });
router.get('/patient', async (req, res) => { userSignUp(req, res) });

export default router;