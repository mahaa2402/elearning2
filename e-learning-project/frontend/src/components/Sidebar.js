import React from 'react';
import { BarChart, Zap, Users, Activity, HelpCircle, Settings } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const sidebarItems = [
    { 
      icon: BarChart, 
      label: 'Reports', 
      path: '/admindashboard', 
      active: location.pathname === '/admindashboard' ,onClick: () => navigate('/admindashboard'),
    },
    {
      icon: Zap,
      label: 'Customization',
      path: '/admincourses',
      active: location.pathname === '/admincourses',
      onClick: () => navigate('/admincourses'),
    },
    { 
      icon: Users, 
      label: 'Assign Task',  
      path: '/assigntask',
      active: location.pathname === '/assigntask',
      onClick: () => navigate('/assigntask') 
    },
    { 
      icon: Activity, 
      label: 'Activities',  
      path: '/employeetracking',
      active: location.pathname === '/employeetracking',
      onClick: () => navigate('/employeetracking') 
    }
  ];

  const supportItems = [
    { icon: HelpCircle, label: 'Get Started' },
    { icon: Settings, label: 'Settings' }
  ];

  return (
    <div className="sidebar flex flex-col h-full w-64 bg-white border-r border-gray-200 shadow-lg">
      <div className="sidebar-header p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
      </div>

      <div className="sidebar-section flex-1 p-4">
        <div className="sidebar-section-title text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Main
        </div>
        {sidebarItems.map((item, index) => (
          <div
            key={index}
            className={`sidebar-item flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 mb-1 ${
              item.active 
                ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
            }`}
            onClick={item.onClick}
          >
            <item.icon className="sidebar-item-icon w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </div>
        ))}
      </div>

      <div className="sidebar-section p-4 border-t border-gray-200">
        <div className="sidebar-section-title text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Support
        </div>
        {supportItems.map((item, index) => (
          <div key={index} className="sidebar-item flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 mb-1 text-gray-700 hover:bg-gray-50 hover:text-gray-900">
            <item.icon className="sidebar-item-icon w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </div>
        ))}
      </div>

      {/* Admin profile section at bottom */}
      <div className="mt-auto p-4 border-t border-gray-200">
        <div className="bg-gray-900 rounded-lg p-3 text-white">
          <p className="text-sm font-medium">Admin</p>
          <p className="text-xs text-gray-300">admin@company.com</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
