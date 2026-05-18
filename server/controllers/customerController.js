import Customer from '../models/Customer.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import logActivity from '../utils/activityLogger.js';

const buildQuery = (req) => {
  const { search, status, assignedEmployee } = req.query;
  const query = {};

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { company: { $regex: search, $options: 'i' } },
    ];
  }
  if (status) query.status = status;
  if (assignedEmployee) query.assignedEmployee = assignedEmployee;

  if (req.user.role === 'employee') {
    query.assignedEmployee = req.user._id;
  }

  return query;
};

export const getCustomers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const query = buildQuery(req);

    const [customers, total] = await Promise.all([
      Customer.find(query)
        .populate('assignedEmployee', 'name email')
        .populate('createdBy', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Customer.countDocuments(query),
    ]);

    successResponse(res, 200, 'Customers fetched', {
      customers,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

export const getCustomerById = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id)
      .populate('assignedEmployee', 'name email role')
      .populate('createdBy', 'name');

    if (!customer) return errorResponse(res, 404, 'Customer not found');

    if (
      req.user.role === 'employee' &&
      customer.assignedEmployee?._id?.toString() !== req.user._id.toString()
    ) {
      return errorResponse(res, 403, 'Not authorized to view this customer');
    }

    successResponse(res, 200, 'Customer fetched', customer);
  } catch (error) {
    next(error);
  }
};

export const createCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.create({
      ...req.body,
      createdBy: req.user._id,
    });

    const populated = await Customer.findById(customer._id).populate(
      'assignedEmployee',
      'name email'
    );

    await logActivity({
      user: req.user._id,
      action: 'create',
      entityType: 'customer',
      entityId: customer._id,
      description: `Customer ${customer.name} created`,
    });

    successResponse(res, 201, 'Customer created', populated);
  } catch (error) {
    next(error);
  }
};

export const updateCustomer = async (req, res, next) => {
  try {
    let customer = await Customer.findById(req.params.id);
    if (!customer) return errorResponse(res, 404, 'Customer not found');

    if (
      req.user.role === 'employee' &&
      customer.assignedEmployee?.toString() !== req.user._id.toString()
    ) {
      return errorResponse(res, 403, 'Not authorized');
    }

    customer = await Customer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('assignedEmployee', 'name email');

    await logActivity({
      user: req.user._id,
      action: 'update',
      entityType: 'customer',
      entityId: customer._id,
      description: `Customer ${customer.name} updated`,
    });

    successResponse(res, 200, 'Customer updated', customer);
  } catch (error) {
    next(error);
  }
};

export const deleteCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return errorResponse(res, 404, 'Customer not found');

    customer.status = 'inactive';
    await customer.save();

    await logActivity({
      user: req.user._id,
      action: 'delete',
      entityType: 'customer',
      entityId: customer._id,
      description: `Customer ${customer.name} marked inactive`,
    });

    successResponse(res, 200, 'Customer deactivated successfully');
  } catch (error) {
    next(error);
  }
};
