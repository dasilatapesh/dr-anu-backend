import Booking from '../models/BookingSchema.js';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv'
dotenv.config();

const generateOTP = (length) => {
    const chars = '0123456789';
    let otp = '';
    for (let i = 0; i < length; i++) {
      otp += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return otp;
  };

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
      user:process.env.USER_EMAIL,
      pass:process.env.USER_PASSWORD
  },
});

const sendOTP = async (email, otp) => {
    try {
      await transporter.sendMail({
        from: '"Dr. Anuradha" <hellotd12@gmail.com>',
        to: email,
        subject: 'Appointment Booking OTP',
        html: `
                <html>
                    <head>
                        <style>
                            body {
                                font-family: Arial, sans-serif;
                                background-color: #f4f4f4;
                                padding: 20px;
                            }
                            .container {
                                max-width: 600px;
                                margin: 0 auto;
                                background-color: lightgrey;
                                padding: 30px;
                                border-radius: 10px;
                                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                            }
                            h2 {
                                color: #333;
                            }
                            p {
                                color: #666;
                            }
                            .otp {
                                font-size: 14px;
                                color: #007bff;
                                background-color:yellow;
                            }
                            .footer {
                                margin-top: 20px;
                                color: #888;
                                font-size: 12px;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <h2>Appointment Booking</h2>
                            <p>Dear User,</p>
                            <p>Your One-Time Password (OTP) for appointment booking is: <span class="otp">${otp}</span></p>
                            <p class="footer">Best regards,<br><br>Tapesh Dasila</p>
                        </div>
                    </body>
                </html>`
      });
      console.log('OTP sent successfully!');
    } catch (error) {
      console.error('Failed to send OTP:', error);
    }
  };

  export const bookAppointment = async (req, res) => {
    try {
        const { doctorId, ticketPrice, appointmentDate, email } = req.body;
        const userId = req.userId;

        const otp = generateOTP(6);

        await sendOTP(email, otp);
        
        const newBooking = new Booking({
            doctor: doctorId,
            user: userId,
            ticketPrice,
            appointmentDate,
            email,
            otp
        });
        console.log(newBooking);

        
        await newBooking.save();

        res.status(200).json({ success: true, message: 'Otp sent successfully' , bookingId: newBooking._id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to book appointment', error: error.message });
    }
};


export const verifyAppointment = async (req, res) => {
    try {
        const { id: bookingId } = req.params;
        const { otp } = req.body;

        const booking = await Booking.findById(bookingId);

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        if (booking.otp !== otp) {
            return res.status(400).json({ success: false, message: 'Invalid OTP' });
        }
        booking.status = 'approved';
        booking.otp='';

        await booking.save();

        res.status(200).json({ success: true, message: 'Appointment confirmed successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to confirm appointment', error: error.message });
    }
};