import User from '../models/UserSchema.js'
import Doctor from '../models/DoctorSchema.js'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { sendOTPViaSMS } from '../utils.js';

const generateToken = user => {
    return jwt.sign({id : user._id, role : user.role}, process.env.JWT_SECRET_key,{
       expiresIn : "15d", 
    });
}

// Function to generate OTP
const generateOTP = () => {
    // Generate a 6-digit OTP
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

export const register = async(req, res) => {
    const {email, password, name, role, photo, gender} = req.body;

    try {
        let user = null;
        if(role === 'patient'){
            user = await User.findOne({email});
        }else if(role==='doctor'){
            user = await Doctor.findOne({email});
        }

        //check if user exist
        if(user){
            return res.status(400).json({message:'User already exist'});
        }

        // Generate OTP
        const otp = generateOTP();

        // Set OTP and its expiration time in the user's document
        user.otp = {
            code: otp,
            expiresAt: new Date(Date.now() + 600000), // OTP expires in 10 minutes
        };

        // Send OTP via SMS
        sendOTPViaSMS(phone, otp);


        //hash password
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);
        
        if(role==='patient'){
            user = new User({
                name,
                email,
                password: hashPassword,
                photo,
                gender,
                role,
                otp: { code: otp, expiresAt: otpExpiresAt }
            });     
        }

        if(role==='doctor'){
            user = new Doctor({
                name,
                email,
                password: hashPassword,
                photo,
                gender,
                role,
                otp: { code: otp, expiresAt: otpExpiresAt }
            });
        }

        await user.save();

        res.status(200).json({success:true, message:'User successfully created'});

    } catch(err) {
        res.status(500).json({success:false, message:'Internal server error, Try again!'});
    }
};

export const login = async(req, res) => {
    const {email, password} = req.body;

    try {
        let user = null;
        const patient = await User.findOne({email});
        const doctor = await Doctor.findOne({email});

        if(patient){
            user = patient;
        }
        if(doctor){
            user = doctor;
        }

        //check if user exist or not
        if(!user){
            return res.status(404).json({message: "User not found!"});
        }

        //compare password
        const isPasswordMatch = await bcrypt.compare(req.body.password, user.password);
        
        if(!isPasswordMatch){
            return res.status(400).json({status: false, message: "Invalid credential!"});
        }

        //get toke
        const token = generateToken(user);

        const {password, role, appointments, ...rest} = user._doc;

        res.status(200).json({status: true, message: "Successfully login", token, data:{...rest}, role}); 


    } catch(err) {
        return res.status(500).json({status: false, message: "Failed to login!"});
    }
};

export const verifyOTP = async (req, res) => {
    const { email, otp } = req.body;
  
    try {
      let user = await User.findOne({ email });
  
      // Check if OTP matches and has not expired
      if (user && user.otp && user.otp.code === otp && user.otp.expiresAt > new Date()) {
        // Clear OTP fields
        user.otp = undefined;
        await user.save();
        
        res.status(200).json({ success: true, message: 'OTP verified successfully.' });
      } else {
        res.status(400).json({ success: false, message: 'Invalid OTP or OTP expired.' });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Internal server error. Please try again later.' });
    }
  };