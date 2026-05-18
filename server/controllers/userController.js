import User from '../models/User.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import logActivity from '../utils/activityLogger.js';

export const getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const role = req.query.role || '';

    const query = { isActive: true };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    if (role) query.role = role;

    const [users, total] = await Promise.all([
      User.find(query).select('-password').sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(query),
    ]);

    successResponse(res, 200, 'Users fetched', {
      users,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return errorResponse(res, 404, 'User not found');
    successResponse(res, 200, 'User fetched', user);
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, phone, department } = req.body;

    const exists = await User.findOne({ email });
    if (exists) return errorResponse(res, 400, 'Email already in use');

    const user = await User.create({ name, email, password, role, phone, department });

    await logActivity({
      user: req.user._id,
      action: 'create',
      entityType: 'user',
      entityId: user._id,
      description: `Employee ${user.name} added by ${req.user.name}`,
    });

    successResponse(res, 201, 'Employee created', {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return errorResponse(res, 404, 'User not found');

    const { name, email, role, phone, department, isActive } = req.body;
    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (phone !== undefined) user.phone = phone;
    if (department !== undefined) user.department = department;
    if (isActive !== undefined) user.isActive = isActive;

    const updated = await user.save();

    await logActivity({
      user: req.user._id,
      action: 'update',
      entityType: 'user',
      entityId: user._id,
      description: `User ${user.name} updated by ${req.user.name}`,
    });

    successResponse(res, 200, 'User updated', updated);
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return errorResponse(res, 404, 'User not found');

    if (user._id.toString() === req.user._id.toString()) {
      return errorResponse(res, 400, 'Cannot delete your own account');
    }

    user.isActive = false;
    await user.save();

    await logActivity({
      user: req.user._id,
      action: 'delete',
      entityType: 'user',
      entityId: user._id,
      description: `User ${user.name} deactivated by ${req.user.name}`,
    });

    successResponse(res, 200, 'User deactivated successfully');
  } catch (error) {
    next(error);
  }
};

export const getEmployees = async (req, res, next) => {
  try {
    const employees = await User.find({ isActive: true })
      .select('name email role')
      .sort({ name: 1 });
    successResponse(res, 200, 'Employees fetched', employees);
  } catch (error) {
    next(error);
  }
};
