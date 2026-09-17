import user_models from '../models/user_models.js';
import { userotpsend } from '../mail/nodemailer.js';
import { error } from '../error/errorhandling.js';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'asdfgasdhbsbdjbjhbdwjgbwkgwbbjmscbswygwekgkjgbskgjmjgacmgjc';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '30d';

export const create_user = async (req, res) => {
  try {
    const data = req.body;
    const { email, name, password, gender } = data;

    if (!email || !name || !password) {
      return res.status(400).json({ status: false, msg: 'Name, email, and password are required.' });
    }

    const randomotp = Math.floor(1000 + Math.random() * 9000);
    const expiryTime = Date.now() + 10 * 60 * 1000;

    const existingUser = await user_models.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      if (existingUser.user?.isDelete) {
        return res.status(400).json({ status: false, msg: 'This account was deleted. Please contact support.' });
      }

      if (existingUser.user?.isVerify) {
        return res.status(409).json({ status: false, msg: 'Account already verified. Please sign in.' });
      }

      existingUser.user.userotp = randomotp;
      existingUser.user.otpExpire = expiryTime;
      if (name) existingUser.name = name;
      if (gender) existingUser.gender = gender;
      if (password) existingUser.password = password;
      await existingUser.save();

      try {
        await userotpsend(existingUser.email, existingUser.name, randomotp);
      } catch (mailErr) {
        console.log('Mail send error, continuing:', mailErr.message);
      }

      return res.status(200).json({
        status: true,
        msg: 'Verification code resent to your email.',
        id: existingUser._id,
        name: existingUser.name,
        email: existingUser.email,
        testOtp: randomotp
      });
    }

    const newUser = new user_models({
      name,
      email: email.toLowerCase(),
      password,
      gender: gender || 'Male',
      role: 'user',  // Always register as user — only admin can promote via admin panel
      user: {
        otpExpire: expiryTime,
        userotp: randomotp,
        isVerify: false,
        isDelete: false
      }
    });

    const savedUser = await newUser.save();

    try {
      await userotpsend(savedUser.email, savedUser.name, randomotp);
    } catch (mailErr) {
      console.log('Mail send error (logged):', mailErr.message);
    }

    return res.status(201).json({
      status: true,
      msg: 'Account created successfully! Please verify the OTP sent to your email.',
      id: savedUser._id,
      name: savedUser.name,
      email: savedUser.email,
      testOtp: randomotp
    });
  } catch (err) {
    return error(err, res);
  }
};

export const verify_otp = async (req, res) => {
  try {
    const { id } = req.params;
    const { otp, email } = req.body;

    if (!otp) {
      return res.status(400).json({ status: false, msg: 'Please provide the 4-digit verification code.' });
    }

    let user;
    if (id && id !== ':id' && id !== 'undefined') {
      user = await user_models.findById(id);
    } else if (email) {
      user = await user_models.findOne({ email: email.toLowerCase() });
    }

    if (!user) {
      return res.status(404).json({ status: false, msg: 'User not found. Please sign up again.' });
    }

    const { userotp, otpExpire, isVerify } = user.user || {};

    if (isVerify) {
      return res.status(200).json({ status: true, msg: 'Account is already verified. Please sign in.' });
    }

    if (otpExpire && Date.now() > otpExpire) {
      return res.status(410).json({ status: false, msg: 'OTP has expired. Please request a new code.' });
    }

    if (String(otp).trim() !== String(userotp).trim()) {
      return res.status(401).json({ status: false, msg: 'Invalid verification code. Please check and try again.' });
    }

    user.user.isVerify = true;
    user.user.userotp = null;
    user.user.otpExpire = null;
    await user.save();

    return res.status(200).json({
      status: true,
      msg: 'Account verified successfully! Welcome to WhiskyHub.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    return error(err, res);
  }
};

export const resend_otp = async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.body;

    let user;
    if (id && id !== ':id' && id !== 'undefined') {
      user = await user_models.findById(id);
    } else if (email) {
      user = await user_models.findOne({ email: email.toLowerCase() });
    }

    if (!user) {
      return res.status(404).json({ status: false, msg: 'User account not found.' });
    }

    const randomotp = Math.floor(1000 + Math.random() * 9000);
    const expiryTime = Date.now() + 10 * 60 * 1000;

    user.user.userotp = randomotp;
    user.user.otpExpire = expiryTime;
    await user.save();

    try {
      await userotpsend(user.email, user.name, randomotp);
    } catch (mailErr) {
      console.log('Mail resend error:', mailErr.message);
    }

    return res.status(200).json({
      status: true,
      msg: 'A fresh OTP has been sent to your email address.',
      id: user._id,
      testOtp: randomotp
    });
  } catch (err) {
    return error(err, res);
  }
};

export const change_unverified_email = async (req, res) => {
  try {
    const { id } = req.params;
    const { oldEmail, newEmail } = req.body;

    if (!newEmail || typeof newEmail !== 'string') {
      return res.status(400).json({ status: false, msg: 'Valid new email address is required.' });
    }

    const emailRe = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!emailRe.test(newEmail.trim())) {
      return res.status(400).json({ status: false, msg: 'Invalid email address format.' });
    }

    let user;
    if (id && id !== ':id' && id !== 'undefined') {
      user = await user_models.findById(id);
    } else if (oldEmail) {
      user = await user_models.findOne({ email: oldEmail.toLowerCase() });
    }

    if (!user) {
      return res.status(404).json({ status: false, msg: 'User account not found. Please register again.' });
    }

    // Check if newEmail is already used by someone else
    const emailConflict = await user_models.findOne({
      email: newEmail.toLowerCase().trim(),
      _id: { $ne: user._id }
    });

    if (emailConflict) {
      return res.status(409).json({ status: false, msg: 'This email is already registered with another account.' });
    }

    const randomotp = Math.floor(1000 + Math.random() * 9000);
    const expiryTime = Date.now() + 10 * 60 * 1000;

    user.email = newEmail.toLowerCase().trim();
    if (!user.user) user.user = {};
    user.user.userotp = randomotp;
    user.user.otpExpire = expiryTime;
    user.user.isVerify = false;
    await user.save();

    try {
      await userotpsend(user.email, user.name, randomotp);
    } catch (mailErr) {
      console.log('Error sending OTP to updated email:', mailErr.message);
    }

    return res.status(200).json({
      status: true,
      msg: 'Email updated! Verification code sent to your new email.',
      id: user._id,
      email: user.email,
      testOtp: randomotp
    });
  } catch (err) {
    return error(err, res);
  }
};

export const user_login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ status: false, msg: 'Email and password are required.' });
    }

    const checkuser = await user_models.findOne({
      email: email.toLowerCase(),
      'user.isDelete': false
    });

    if (!checkuser) {
      return res.status(404).json({
        status: false,
        msg: 'No account found with this email. Please check your credentials or create a new account.'
      });
    }

    if (!checkuser.user?.isVerify) {
      const randomotp = Math.floor(1000 + Math.random() * 9000);
      checkuser.user.userotp = randomotp;
      checkuser.user.otpExpire = Date.now() + 10 * 60 * 1000;
      await checkuser.save();

      try {
        await userotpsend(checkuser.email, checkuser.name, randomotp);
      } catch (e) {}

      return res.status(403).json({
        status: false,
        requiresVerification: true,
        id: checkuser._id,
        email: checkuser.email,
        msg: 'Account not verified yet. A verification code has been sent to your email.',
        testOtp: randomotp
      });
    }

    const isMatch = await bcrypt.compare(password, checkuser.password);
    if (!isMatch) {
      return res.status(401).json({ status: false, msg: 'Incorrect password. Please try again.' });
    }

    const token = jwt.sign(
      { id: checkuser._id, email: checkuser.email, role: checkuser.role || 'user' },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRE }
    );

    const userProfile = {
      id: checkuser._id,
      _id: checkuser._id,
      name: checkuser.name,
      email: checkuser.email,
      role: checkuser.role || 'user',
      gender: checkuser.gender || 'Male',
      avatar: checkuser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
      phone: checkuser.phone || '',
      address: checkuser.address || '',
      bio: checkuser.bio || 'Whisky connoisseur & luxury spirits enthusiast.'
    };

    return res.status(200).json({
      status: true,
      msg: `Welcome back, ${checkuser.name}!`,
      token,
      user: userProfile,
      DB: userProfile
    });
  } catch (err) {
    return error(err, res);
  }
};

export const get_profile = async (req, res) => {
  try {
    const user = await user_models.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ status: false, msg: 'User profile not found.' });

    return res.status(200).json({ status: true, user });
  } catch (err) {
    return error(err, res);
  }
};

export const update_profile = async (req, res) => {
  try {
    const { name, phone, gender, address, bio } = req.body;
    const userId = req.user._id;

    const updatedUser = await user_models.findByIdAndUpdate(
      userId,
      {
        $set: {
          ...(name && { name }),
          ...(phone !== undefined && { phone }),
          ...(gender && { gender }),
          ...(address !== undefined && { address }),
          ...(bio !== undefined && { bio })
        }
      },
      { new: true }
    ).select('-password');

    return res.status(200).json({
      status: true,
      msg: 'Profile updated successfully!',
      user: updatedUser
    });
  } catch (err) {
    return error(err, res);
  }
};

export const change_password = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ status: false, msg: 'Current password and new password are required.' });
    }

    const user = await user_models.findById(userId);
    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({ status: false, msg: 'Current password does not match.' });
    }

    user.password = newPassword;
    await user.save();

    return res.status(200).json({ status: true, msg: 'Password updated successfully!' });
  } catch (err) {
    return error(err, res);
  }
};

export const change_email = async (req, res) => {
  try {
    const { newEmail } = req.body;
    const userId = req.user._id;

    if (!newEmail) {
      return res.status(400).json({ status: false, msg: 'New email address is required.' });
    }

    const emailInUse = await user_models.findOne({
      email: newEmail.toLowerCase(),
      _id: { $ne: userId }
    });

    if (emailInUse) {
      return res.status(409).json({ status: false, msg: 'Email is already registered with another account.' });
    }

    const updatedUser = await user_models.findByIdAndUpdate(
      userId,
      { $set: { email: newEmail.toLowerCase() } },
      { new: true }
    ).select('-password');

    return res.status(200).json({
      status: true,
      msg: 'Email updated successfully!',
      user: updatedUser
    });
  } catch (err) {
    return error(err, res);
  }
};

export const change_avatar = async (req, res) => {
  try {
    const { avatarUrl } = req.body;
    const userId = req.user._id;

    if (!avatarUrl) {
      return res.status(400).json({ status: false, msg: 'Avatar URL is required.' });
    }

    const updatedUser = await user_models.findByIdAndUpdate(
      userId,
      { $set: { avatar: avatarUrl } },
      { new: true }
    ).select('-password');

    return res.status(200).json({
      status: true,
      msg: 'Profile avatar updated!',
      user: updatedUser
    });
  } catch (err) {
    return error(err, res);
  }
};

export const delete_account = async (req, res) => {
  try {
    const userId = req.user._id;
    await user_models.findByIdAndUpdate(userId, {
      $set: { 'user.isDelete': true }
    });

    return res.status(200).json({
      status: true,
      msg: 'Your account has been deactivated successfully.'
    });
  } catch (err) {
    return error(err, res);
  }
};
