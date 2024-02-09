import Vonage from '@vonage/server-sdk';

const vonage = new Vonage({
  apiKey: process.env.VONAGE_API_KEY,
  apiSecret: process.env.VONAGE_API_SECRET,
});

export const sendOTPViaSMS = (phone, otp) => {
  const from = '+918126386856';
  const to = phone;
  const text = `Your OTP for verification is: ${otp}`;

  vonage.message.sendSms(from, to, text, (err, responseData) => {
    if (err) {
      console.error(err);
    } else {
      if (responseData.messages[0]['status'] === '0') {
        console.log('Message sent successfully.');
      } else {
        console.error(
          `Message failed with error: ${responseData.messages[0]['error-text']}`
        );
      }
    }
  });
};
