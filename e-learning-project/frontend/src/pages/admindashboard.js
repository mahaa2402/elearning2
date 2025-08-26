import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './admindashboard.css';
import Sidebar from '../components/Sidebar';  // ✅ Import Sidebar component
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line, 
  ResponsiveContainer 
} from 'recharts';
import { 
  BookOpen, 
  Award, 
  Clock, 
  TrendingUp, 
  Download,
  Users
} from 'lucide-react';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('ISP');
  const [selectedPeople, setSelectedPeople] = useState('All');
  const [selectedTopic, setSelectedTopic] = useState('All');

  // Sample data for charts
  const employeeData = [
    { name: 'ISP', value: 8 },
    { name: 'POSH', value: 12 },
    { name: 'HR Law', value: 15 },
    { name: 'Code of Conduct', value: 20 },
    { name: 'Workplace Safety', value: 25 },
    { name: 'Factory Act', value: 35 },
    { name: 'CSO', value: 42 },
    { name: 'Welding', value: 42 }
  ];

  const passFailData = [
    { name: 'Pass', value: 80, color: '#10B981' },
    { name: 'Fail', value: 20, color: '#1F2937' }
  ];

  const weakestTopics = [
    { name: 'Introduction to ISP', completion: 26, color: '#F59E0B' },
    { name: 'Welding', completion: 48, color: '#EF4444' },
    { name: 'Company Networking', completion: 64, color: '#EF4444' }
  ];

  const strongestTopics = [
    { name: 'POSH and code of conduct', completion: 95, color: '#10B981' },
    { name: 'Cyber Security Basics', completion: 92, color: '#10B981' },
    { name: 'Social Media Policies', completion: 89, color: '#10B981' }
  ];

  const leaderboardData = [
    { name: 'Jesse Thomas', points: 637, correct: 98, rank: 1, trend: 'up' },
    { name: 'Thisal Mathiyazhagan', points: 637, correct: 89, rank: 2, trend: 'down' },
    { name: 'Helen Chuang', points: 637, correct: 89, rank: 3, trend: 'up' }
  ];

  // Sidebar items are now handled by the Sidebar component

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200 p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Reports</h2>
            <button className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              <Download className="w-4 h-4 mr-2" />
              Download
            </button>
          </div>
          
          {/* Filters */}
          <div className="flex gap-4 mt-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category:</label>
              <select 
                className="px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-700"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option>ISP</option>
                <option>Safety</option>
                <option>Compliance</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">People:</label>
              <select 
                className="px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-700"
                value={selectedPeople}
                onChange={(e) => setSelectedPeople(e.target.value)}
              >
                <option>All</option>
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Topic:</label>
              <select 
                className="px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-700"
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
              >
                <option>All</option>
                <option>Safety</option>
                <option>Compliance</option>
              </select>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">150</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <BookOpen className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Courses</p>
                  <p className="text-2xl font-bold text-gray-900">6</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <Award className="w-8 h-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Assessments Completed Today</p>
                  <p className="text-2xl font-bold text-gray-900">38</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <Award className="w-8 h-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Certificates Issued This Week</p>
                  <p className="text-2xl font-bold text-gray-900">24</p>
                  <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                    <div className="bg-blue-600 h-1 rounded-full" style={{width: '60%'}}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Secondary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <Clock className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg. Completion Time</p>
                  <p className="text-2xl font-bold text-gray-900">24 mins</p>
                  <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                    <div className="bg-blue-600 h-1 rounded-full" style={{width: '40%'}}></div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <TrendingUp className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Knowledge Gain</p>
                  <p className="text-2xl font-bold text-gray-900">+34%</p>
                  <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                    <div className="bg-green-600 h-1 rounded-full" style={{width: '70%'}}></div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Assessment Pass vs Fail Percentage</h3>
              <div className="flex items-center justify-center">
                <ResponsiveContainer width={120} height={120}>
                  <PieChart>
                    <Pie
                      data={passFailData}
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={55}
                      dataKey="value"
                    >
                      {passFailData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="ml-4">
                  <div className="flex items-center mb-2">
                    <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
                    <span className="text-sm text-gray-600">PASS</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-gray-800 rounded mr-2"></div>
                    <span className="text-sm text-gray-600">FAIL</span>
                  </div>
                </div>
                <div className="ml-4 text-center">
                  <p className="text-3xl font-bold text-gray-900">80%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Employee Learning Chart - Full Width */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">No of Employees Learnt</h3>
              <select className="px-3 py-1 border border-gray-300 rounded text-sm">
                <option>Topic</option>
              </select>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={employeeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Topics Performance - Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Weakest Topics */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Weakest Topics</h3>
              <div className="space-y-4">
                {weakestTopics.map((topic, index) => (
                  <div key={index} className="flex items-center">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center mr-3">
                      <div className="w-6 h-6 bg-gray-400 rounded"></div>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{topic.name}</p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className="h-2 rounded-full" 
                          style={{width: `${topic.completion}%`, backgroundColor: topic.color}}
                        ></div>
                      </div>
                    </div>
                    <span className="ml-3 text-sm font-medium text-gray-600">
                      {100 - topic.completion}% not completed
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Strongest Topics */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Strongest Topics</h3>
              <div className="space-y-4">
                {strongestTopics.map((topic, index) => (
                  <div key={index} className="flex items-center">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center mr-3">
                      <div className="w-6 h-6 bg-gray-400 rounded"></div>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{topic.name}</p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className="h-2 rounded-full" 
                          style={{width: `${topic.completion}%`, backgroundColor: topic.color}}
                        ></div>
                      </div>
                    </div>
                    <span className="ml-3 text-sm font-medium text-gray-600">
                      {topic.completion}% completed
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Row - User Leaderboard and Pass/Fail Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* User Leaderboard */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">User Leaderboard</h3>
              <div className="space-y-4">
                {leaderboardData.map((user, index) => (
                  <div key={index} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-300 rounded-full mr-4"></div>
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.points} Points • {user.correct}% Correct</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className="text-2xl font-bold text-gray-900 mr-2">{user.rank}</span>
                      <div className={`w-0 h-0 border-l-4 border-r-4 border-transparent ${
                        user.trend === 'up' 
                          ? 'border-b-4 border-b-green-500' 
                          : 'border-t-4 border-t-red-500'
                      }`}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pass/Fail Chart - Moved to bottom right */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Assessment Pass vs Fail Percentage</h3>
              <div className="flex items-center justify-center h-64">
                <ResponsiveContainer width={200} height={200}>
                  <PieChart>
                    <Pie
                      data={passFailData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      dataKey="value"
                    >
                      {passFailData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="ml-6">
                  <div className="flex items-center mb-4">
                    <div className="w-4 h-4 bg-green-500 rounded mr-3"></div>
                    <span className="text-gray-600">PASS</span>
                  </div>
                  <div className="flex items-center mb-4">
                    <div className="w-4 h-4 bg-gray-800 rounded mr-3"></div>
                    <span className="text-gray-600">FAIL</span>
                  </div>
                  <div className="text-center">
                    <p className="text-4xl font-bold text-gray-900">80%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;