import Activity from '../models/Activity.js';

export const logActivity = async ({ user, action, entityType, entityId, description, metadata = {} }) => {
  try {
    await Activity.create({
      user,
      action,
      entityType,
      entityId,
      description,
      metadata,
    });
  } catch (error) {
    console.error('Activity log error:', error.message);
  }
};

export default logActivity;
