import Booking from '../models/BookingSchema.js';
import nodemailer from 'nodemailer';

const generateOTP = (length) => {
    const chars = '0123456789';
    let otp = '';
    for (let i = 0; i < length; i++) {
      otp += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return otp;
  };

const transporter = nodemailer.createTransport({
    service: 'YourEmailService', 
    auth: {
      user: 'your_email@example.com',
      pass: 'your_email_password'
    }
});

const sendOTP = async (email, otp) => {
    try {
      await transporter.sendMail({
        from: 'your_email@example.com',
        to: email,
        subject: 'Appointment Booking OTP',
        text: `Your OTP for appointment booking is: ${otp}`
      });
      console.log('OTP sent successfully!');
    } catch (error) {
      console.error('Failed to send OTP:', error);
    }
  };

  export const bookAppointment = async (req, res) => {
    try {
        const { doctorId, ticketPrice, appointmentDate, userEmail } = req.body;
        const userId = req.userId;

        const otp = generateOTP(6);

        await sendOTP(userEmail, otp);
        
        const newBooking = new Booking({
            doctor: doctorId,
            user: userId,
            ticketPrice,
            appointmentDate,
            otp
        });

        
        await newBooking.save();

        res.status(201).json({ success: true, message: 'Appointment booked successfully', data: newBooking });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to book appointment', error: error.message });
    }
};