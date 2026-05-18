import api from './api';

export const getDashboardStats = () => api.get('/dashboard/stats');
export const getActivities = (params) => api.get('/dashboard/activities', { params });
