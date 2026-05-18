import Task from '../models/Task.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import logActivity from '../utils/activityLogger.js';

const buildQuery = (req) => {
  const { search, status, priority, assignedUser } = req.query;
  const query = {};

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }
  if (status) query.status = status;
  if (priority) query.priority = priority;
  if (assignedUser) query.assignedUser = assignedUser;

  if (req.user.role === 'employee') {
    query.assignedUser = req.user._id;
  }

  return query;
};

export const getTasks = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const query = buildQuery(req);

    const [tasks, total] = await Promise.all([
      Task.find(query)
        .populate('assignedUser', 'name email')
        .populate('relatedCustomer', 'name')
        .populate('relatedLead', 'title')
        .populate('createdBy', 'name')
        .sort({ deadline: 1 })
        .skip(skip)
        .limit(limit),
      Task.countDocuments(query),
    ]);

    successResponse(res, 200, 'Tasks fetched', {
      tasks,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

export const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedUser', 'name email')
      .populate('relatedCustomer', 'name')
      .populate('relatedLead', 'title');

    if (!task) return errorResponse(res, 404, 'Task not found');
    successResponse(res, 200, 'Task fetched', task);
  } catch (error) {
    next(error);
  }
};

export const createTask = async (req, res, next) => {
  try {
    const task = await Task.create({
      ...req.body,
      createdBy: req.user._id,
    });

    const populated = await Task.findById(task._id).populate('assignedUser', 'name email');

    await logActivity({
      user: req.user._id,
      action: 'create',
      entityType: 'task',
      entityId: task._id,
      description: `Task "${task.title}" created`,
    });

    successResponse(res, 201, 'Task created', populated);
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (req, res, next) => {
  try {
    let task = await Task.findById(req.params.id);
    if (!task) return errorResponse(res, 404, 'Task not found');

    task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('assignedUser', 'name email');

    await logActivity({
      user: req.user._id,
      action: 'update',
      entityType: 'task',
      entityId: task._id,
      description: `Task "${task.title}" updated to ${task.status}`,
    });

    successResponse(res, 200, 'Task updated', task);
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return errorResponse(res, 404, 'Task not found');

    if (task.status !== 'completed') {
      return errorResponse(res, 400, 'Only completed tasks can be deleted');
    }

    await Task.findByIdAndDelete(req.params.id);

    await logActivity({
      user: req.user._id,
      action: 'delete',
      entityType: 'task',
      entityId: task._id,
      description: `Task "${task.title}" deleted`,
    });

    successResponse(res, 200, 'Task deleted successfully');
  } catch (error) {
    next(error);
  }
};
