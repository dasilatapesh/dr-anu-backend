import express from 'express';
import { authenticate } from '../auth/verifyToken.js';
import { bookAppointment, verifyAppointment } from '../controllers/bookingController.js';

const router = express.Router();

router.post('/', authenticate, bookAppointment);
router.post('/confirm/:id', authenticate, verifyAppointment);

export default router;
