import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Users, Briefcase, CheckSquare, Activity, ArrowUpRight, TrendingUp } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState({
    customers: 0,
    leads: 0,
    tasks: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [customersRes, leadsRes, tasksRes] = await Promise.all([
          api.get('/customers'),
          api.get('/leads'),
          api.get('/tasks')
        ]);
        
        setStats({
          customers: customersRes.data.length,
          leads: leadsRes.data.length,
          tasks: tasksRes.data.filter(t => t.status !== 'Completed').length
        });
      } catch (error) {
        console.error('Error fetching stats', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const cards = [
    { 
      title: 'Total Customers', 
      value: stats.customers, 
      icon: Users, 
      bg: 'bg-gradient-to-br from-blue-500 to-blue-700',
      shadow: 'shadow-blue-500/30'
    },
    { 
      title: 'Active Leads', 
      value: stats.leads, 
      icon: Briefcase, 
      bg: 'bg-gradient-to-br from-indigo-500 to-purple-600',
      shadow: 'shadow-indigo-500/30'
    },
    { 
      title: 'Pending Tasks', 
      value: stats.tasks, 
      icon: CheckSquare, 
      bg: 'bg-gradient-to-br from-orange-400 to-red-500',
      shadow: 'shadow-red-500/30'
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard Overview</h1>
          <p className="text-gray-500 mt-1">Welcome back! Here is what's happening today.</p>
        </div>
        <button className="flex items-center bg-white border border-gray-200 px-4 py-2 rounded-lg text-sm font-medium text-gray-600 shadow-sm hover:bg-gray-50 transition-colors">
          <TrendingUp className="w-4 h-4 mr-2 text-gray-400" />
          Generate Report
        </button>
      </div>
      
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card, idx) => (
          <div key={idx} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-32 h-32 ${card.bg} rounded-full blur-[80px] opacity-10 group-hover:opacity-20 transition-opacity`}></div>
            <div className="flex items-start justify-between relative z-10">
              <div>
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{card.title}</p>
                <h3 className="text-4xl font-extrabold text-gray-900 mt-2 tracking-tight">{card.value}</h3>
              </div>
              <div className={`p-4 rounded-2xl text-white ${card.bg} shadow-lg ${card.shadow}`}>
                <card.icon className="w-7 h-7" />
              </div>
            </div>
            <div className="mt-6 flex items-center text-sm font-medium text-green-600 relative z-10">
              <ArrowUpRight className="w-4 h-4 mr-1" />
              <span>12% increase from last month</span>
            </div>
          </div>
        ))}
      </div>

      {/* Activity Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <Activity className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Recent Activities</h2>
          </div>
          <button className="text-sm font-medium text-blue-600 hover:text-blue-700">View All</button>
        </div>
        
        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
          
          <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-300 group-[.is-active]:bg-blue-600 text-white group-[.is-active]:text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
              <CheckSquare className="w-4 h-4" />
            </div>
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-bold text-gray-900 text-sm">Task Completed</h3>
                <time className="text-xs font-medium text-gray-500">10 mins ago</time>
              </div>
              <p className="text-sm text-gray-500">You completed "Prepare Q3 Presentation"</p>
            </div>
          </div>

          <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-300 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
              <Users className="w-4 h-4" />
            </div>
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-bold text-gray-900 text-sm">New Customer Added</h3>
                <time className="text-xs font-medium text-gray-500">2 hours ago</time>
              </div>
              <p className="text-sm text-gray-500">Jane Doe from TechCorp was registered.</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
