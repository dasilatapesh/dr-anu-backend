import nodemailer from 'nodemailer';
import dotenv from 'dotenv'
dotenv.config();

export const sendMessage = async (req, res) => {
    const { name, email, message } = req.body;

    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.USER_EMAIL, 
                pass: process.env.USER_PASSWORD
            }
        });

        await transporter.sendMail({
            from: '"Dr. Anuradha" <no.reply.su12pport.1.8.4@gmail.com>',
            to: `${email}`,
            cc: process.env.USER_EMAIL,
            subject: `Thank you for your feedback: ${name}`,
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
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <h2>Thank You for Your Feedback</h2>
                            <p>Dear ${name},</p>
                            <p>Thank you for providing your valuable feedback. We appreciate your time and effort in sharing your thoughts with us.</p>
                            <p>Your Message: ${message}</p>
                            <p>We look forward to serving you soon.</p>
                            <p>Best regards,<br>Tapesh Dasila</p>
                        </div>
                    </body>
                </html>
            `
        });

        res.status(200).json({ success: true, message: 'Email sent successfully' });
    } catch (error) {
        console.error('Failed to send email:', error);
        res.status(500).json({ success: false, message: 'Failed to send email' });
    }
};