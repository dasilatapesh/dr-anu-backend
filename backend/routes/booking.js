import express from 'express';
import { authenticate } from '../auth/verifyToken.js';
import { bookAppointment } from '../controllers/bookingController.js';

const router = express.Router();

router.post('/', authenticate, bookAppointment);

export default router;
