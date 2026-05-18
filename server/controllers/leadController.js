import Lead from '../models/Lead.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import logActivity from '../utils/activityLogger.js';

const buildQuery = (req) => {
  const { search, status, assignedTo } = req.query;
  const query = {};

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { customerName: { $regex: search, $options: 'i' } },
      { company: { $regex: search, $options: 'i' } },
    ];
  }
  if (status) query.status = status;
  if (assignedTo) query.assignedTo = assignedTo;

  if (req.user.role === 'employee') {
    query.assignedTo = req.user._id;
  }

  return query;
};

export const getLeads = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const query = buildQuery(req);

    const [leads, total] = await Promise.all([
      Lead.find(query)
        .populate('assignedTo', 'name email')
        .populate('createdBy', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Lead.countDocuments(query),
    ]);

    successResponse(res, 200, 'Leads fetched', {
      leads,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

export const getLeadById = async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name');

    if (!lead) return errorResponse(res, 404, 'Lead not found');
    successResponse(res, 200, 'Lead fetched', lead);
  } catch (error) {
    next(error);
  }
};

export const createLead = async (req, res, next) => {
  try {
    const lead = await Lead.create({
      ...req.body,
      createdBy: req.user._id,
    });

    const populated = await Lead.findById(lead._id).populate('assignedTo', 'name email');

    await logActivity({
      user: req.user._id,
      action: 'create',
      entityType: 'lead',
      entityId: lead._id,
      description: `Lead "${lead.title}" created`,
    });

    successResponse(res, 201, 'Lead created', populated);
  } catch (error) {
    next(error);
  }
};

export const updateLead = async (req, res, next) => {
  try {
    let lead = await Lead.findById(req.params.id);
    if (!lead) return errorResponse(res, 404, 'Lead not found');

    lead = await Lead.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('assignedTo', 'name email');

    await logActivity({
      user: req.user._id,
      action: 'update',
      entityType: 'lead',
      entityId: lead._id,
      description: `Lead "${lead.title}" updated to ${lead.status}`,
    });

    successResponse(res, 200, 'Lead updated', lead);
  } catch (error) {
    next(error);
  }
};

export const deleteLead = async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return errorResponse(res, 404, 'Lead not found');

    await Lead.findByIdAndDelete(req.params.id);

    await logActivity({
      user: req.user._id,
      action: 'delete',
      entityType: 'lead',
      entityId: lead._id,
      description: `Lead "${lead.title}" deleted`,
    });

    successResponse(res, 200, 'Lead deleted successfully');
  } catch (error) {
    next(error);
  }
};
