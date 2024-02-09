import express from 'express';
import { register } from '../controllers/authController.js';
import { login } from '../controllers/authController.js';
import { sendOtpSms } from '../controllers/authController.js';
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/send-otp', sendOtpSms);
router.post('/verify-otp', verifyOTP);

export default router;