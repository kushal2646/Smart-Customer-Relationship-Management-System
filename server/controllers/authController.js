import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import logActivity from '../utils/activityLogger.js';

export const register = async (req, res, next) => {
  try {
    const { name, email, password, role, phone, department } = req.body;

    const exists = await User.findOne({ email });
    if (exists) return errorResponse(res, 400, 'User already exists with this email');

    const allowedRole = req.user?.role === 'admin' ? role : 'employee';

    const user = await User.create({
      name,
      email,
      password,
      role: allowedRole || 'employee',
      phone,
      department,
    });

    await logActivity({
      user: req.user?._id || user._id,
      action: 'create',
      entityType: 'user',
      entityId: user._id,
      description: `New user registered: ${user.name}`,
    });

    successResponse(res, 201, 'User registered successfully', {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return errorResponse(res, 401, 'Invalid email or password');
    }

    if (!user.isActive) {
      return errorResponse(res, 401, 'Account has been deactivated');
    }

    await logActivity({
      user: user._id,
      action: 'login',
      entityType: 'auth',
      description: `${user.name} logged in`,
    });

    successResponse(res, 200, 'Login successful', {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      token: generateToken(user._id),
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    successResponse(res, 200, 'Profile fetched', user);
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return errorResponse(res, 404, 'User not found');

    const { name, email, phone, department } = req.body;
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (department) user.department = department;

    if (req.file && process.env.CLOUDINARY_CLOUD_NAME) {
      const { uploadToCloudinary } = await import('../utils/uploadToCloudinary.js');
      const result = await uploadToCloudinary(req.file.buffer);
      user.avatar = result.secure_url;
    }

    const updated = await user.save();

    await logActivity({
      user: user._id,
      action: 'update',
      entityType: 'profile',
      entityId: user._id,
      description: `${user.name} updated their profile`,
    });

    successResponse(res, 200, 'Profile updated', updated);
  } catch (error) {
    next(error);
  }
};

export const updatePassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('+password');
    const { currentPassword, newPassword } = req.body;

    if (!(await user.matchPassword(currentPassword))) {
      return errorResponse(res, 401, 'Current password is incorrect');
    }

    user.password = newPassword;
    await user.save();

    successResponse(res, 200, 'Password updated successfully');
  } catch (error) {
    next(error);
  }
};
