import Customer from '../models/Customer.js';
import Lead from '../models/Lead.js';
import Task from '../models/Task.js';
import Activity from '../models/Activity.js';
import { successResponse } from '../utils/apiResponse.js';

export const getDashboardStats = async (req, res, next) => {
  try {
    const employeeFilter =
      req.user.role === 'employee'
        ? { assignedEmployee: req.user._id }
        : {};
    const leadFilter =
      req.user.role === 'employee' ? { assignedTo: req.user._id } : {};
    const taskFilter =
      req.user.role === 'employee'
        ? { assignedUser: req.user._id, status: { $ne: 'completed' } }
        : { status: { $ne: 'completed' } };

    const [
      totalCustomers,
      totalLeads,
      closedDeals,
      pendingTasks,
      monthlySales,
      recentActivities,
    ] = await Promise.all([
      Customer.countDocuments({ ...employeeFilter, status: { $ne: 'inactive' } }),
      Lead.countDocuments(leadFilter),
      Lead.countDocuments({ ...leadFilter, status: 'closed' }),
      Task.countDocuments(taskFilter),
      getMonthlySales(leadFilter),
      Activity.find()
        .populate('user', 'name avatar')
        .sort({ createdAt: -1 })
        .limit(10),
    ]);

    successResponse(res, 200, 'Dashboard stats fetched', {
      stats: {
        totalCustomers,
        totalLeads,
        closedDeals,
        pendingTasks,
      },
      monthlySales,
      recentActivities,
    });
  } catch (error) {
    next(error);
  }
};

const getMonthlySales = async (filter = {}) => {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const sales = await Lead.aggregate([
    {
      $match: {
        ...filter,
        status: 'closed',
        updatedAt: { $gte: sixMonthsAgo },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: '$updatedAt' },
          month: { $month: '$updatedAt' },
        },
        total: { $sum: '$value' },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];

  const result = [];
  const now = new Date();

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const found = sales.find(
      (s) => s._id.year === d.getFullYear() && s._id.month === d.getMonth() + 1
    );
    result.push({
      month: monthNames[d.getMonth()],
      revenue: found?.total || 0,
      deals: found?.count || 0,
    });
  }

  return result;
};

export const getActivities = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [activities, total] = await Promise.all([
      Activity.find()
        .populate('user', 'name email avatar role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Activity.countDocuments(),
    ]);

    successResponse(res, 200, 'Activities fetched', {
      activities,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};
