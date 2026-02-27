import { useState, useEffect } from 'react';
import {
  ArrowUpRight,
  Plus,
  TrendingUp,
  Video,
  Zap,
  Layers,
  Cpu,
  Flame,
  Bug,
  Pause,
  Square
} from 'lucide-react';
import { Card, Button, Avatar, PageHeader } from '@components/ui';

// Stats data
const stats = [
  {
    title: 'Total Projects',
    value: '24',
    change: 'Increased from last month',
    trend: 'up',
    trendValue: '5',
    highlight: true,
  },
  {
    title: 'Ended Projects',
    value: '10',
    change: 'Increased from last month',
    trend: 'up',
    trendValue: '6',
    highlight: false,
  },
  {
    title: 'Running Projects',
    value: '12',
    change: 'Increased from last month',
    trend: 'up',
    trendValue: '2',
    highlight: false,
  },
  {
    title: 'Pending Project',
    value: '2',
    change: 'On Discuss',
    trend: 'neutral',
    highlight: false,
  },
];

// Analytics data for bar chart
const analyticsData = [
  { day: 'S', value: 40, highlight: false },
  { day: 'M', value: 60, highlight: false },
  { day: 'T', value: 80, highlight: true },
  { day: 'W', value: 100, highlight: true, showLabel: true },
  { day: 'T', value: 65, highlight: false },
  { day: 'F', value: 50, highlight: false },
  { day: 'S', value: 35, highlight: false },
];

// Projects data with colors matching the image
const projects = [
  { id: 1, name: 'Develop API Endpoints', dueDate: 'Nov 26, 2024', icon: Zap, color: '#3b82f6' },
  { id: 2, name: 'Onboarding Flow', dueDate: 'Nov 28, 2024', icon: Layers, color: '#0d9488' },
  { id: 3, name: 'Build Dashboard', dueDate: 'Nov 30, 2024', icon: Cpu, color: '#ec4899' },
  { id: 4, name: 'Optimize Page Load', dueDate: 'Dec 5, 2024', icon: Flame, color: '#eab308' },
  { id: 5, name: 'Cross-Browser Testing', dueDate: 'Dec 6, 2024', icon: Bug, color: '#f97316' },
];

// Team members data
const teamMembers = [
  {
    id: 1,
    name: 'Alexandra Deff',
    task: 'Github Project Repository',
    status: 'Completed',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop'
  },
  {
    id: 2,
    name: 'Edwin Adenike',
    task: 'Integrate User Authentication System',
    status: 'In Progress',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop'
  },
  {
    id: 3,
    name: 'Isaac Oluwatemilorun',
    task: 'Develop Search and Filter Functionality',
    status: 'Pending',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop'
  },
  {
    id: 4,
    name: 'David Oshodi',
    task: 'Responsive Layout for Homepage',
    status: 'In Progress',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop'
  },
];

// Striped Bar Component
const StripedBar = ({ height, isHighlight }) => {
  if (isHighlight) {
    return (
      <div
        className="w-10 rounded-t-full bg-primary-700"
        style={{ height: `${height}px` }}
      />
    );
  }

  return (
    <div
      className="w-10 rounded-t-full overflow-hidden"
      style={{ height: `${height}px` }}
    >
      <svg width="100%" height="100%" className="rounded-t-full">
        <defs>
          <pattern
            id="diagonalStripes"
            patternUnits="userSpaceOnUse"
            width="6"
            height="6"
            patternTransform="rotate(45)"
          >
            <line x1="0" y1="0" x2="0" y2="6" stroke="#166534" strokeWidth="3" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#diagonalStripes)" rx="20" />
      </svg>
    </div>
  );
};

const DashboardPage = () => {
  const [time, setTime] = useState({ hours: 1, minutes: 24, seconds: 8 });

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(prev => {
        let { hours, minutes, seconds } = prev;
        seconds++;
        if (seconds >= 60) {
          seconds = 0;
          minutes++;
        }
        if (minutes >= 60) {
          minutes = 0;
          hours++;
        }
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (num) => num.toString().padStart(2, '0');

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Completed': return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      case 'In Progress': return 'bg-rose-50 text-rose-600 border border-rose-200';
      case 'Pending': return 'bg-amber-50 text-amber-700 border border-amber-200';
      default: return 'bg-gray-50 text-gray-700 border border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Dashboard"
        subtitle="Plan, prioritize, and accomplish your tasks with ease."
      >
        <Button variant="primary" prefixIcon={Plus}>
          Add Project
        </Button>
        <Button variant="outline">
          Import Data
        </Button>
      </PageHeader>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card
            key={stat.title}
            className={`p-5 ${stat.highlight ? '!bg-primary-700' : ''}`}
          >
            <div className="flex items-start justify-between mb-3">
              <span className={`text-[14px] font-medium ${stat.highlight ? 'text-white/90' : 'text-gray-600'}`}>
                {stat.title}
              </span>
              <button className={`p-1.5 rounded-lg transition-colors ${stat.highlight ? 'bg-white/20 hover:bg-white/30' : 'bg-gray-100 hover:bg-gray-200'}`}>
                <ArrowUpRight size={16} className={stat.highlight ? 'text-white' : 'text-gray-600'} strokeWidth={2} />
              </button>
            </div>
            <div className={`text-[42px] font-bold leading-none mb-2 ${stat.highlight ? 'text-white' : 'text-gray-900'}`}>
              {stat.value}
            </div>
            <div className={`flex items-center gap-1.5 text-[12px] ${stat.highlight ? 'text-white/70' : 'text-gray-500'}`}>
              {stat.trend === 'up' && (
                <span className={`flex items-center justify-center w-5 h-5 rounded ${stat.highlight ? 'bg-white/20' : 'bg-gray-100'}`}>
                  <TrendingUp size={12} className={stat.highlight ? 'text-white' : 'text-gray-600'} />
                </span>
              )}
              <span>{stat.change}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-12 gap-4">
        {/* Project Analytics */}
        <Card className="col-span-12 lg:col-span-5 p-6">
          <h3 className="text-[17px] font-semibold text-gray-900 mb-8">Project Analytics</h3>
          <div className="flex items-end justify-between h-44 px-1">
            {analyticsData.map((item, index) => (
              <div key={index} className="flex flex-col items-center gap-3">
                <div className="relative flex flex-col items-center">
                  {item.showLabel && (
                    <span className="absolute -top-7 text-[11px] text-gray-600 bg-white px-2 py-1 rounded-md border border-gray-200 shadow-sm font-medium">
                      74%
                    </span>
                  )}
                  <StripedBar height={item.value * 1.4} isHighlight={item.highlight} />
                </div>
                <span className="text-[13px] text-gray-500 font-medium">{item.day}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Reminders */}
        <Card className="col-span-12 lg:col-span-4 p-6">
          <h3 className="text-[17px] font-semibold text-gray-900 mb-5">Reminders</h3>
          <div className="space-y-5">
            <div>
              <h4 className="text-[22px] font-bold text-gray-900 leading-tight">Meeting with Arc</h4>
              <h4 className="text-[22px] font-bold text-gray-900 leading-tight">Company</h4>
              <p className="text-[14px] text-gray-500 mt-2">Time : 02.00 pm - 04.00 pm</p>
            </div>
            <Button variant="primary" className="w-full !py-3" prefixIcon={Video}>
              Start Meeting
            </Button>
          </div>
        </Card>

        {/* Project List */}
        <Card className="col-span-12 lg:col-span-3 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[17px] font-semibold text-gray-900">Project</h3>
            <Button variant="outline" size="sm" prefixIcon={Plus}>
              New
            </Button>
          </div>
          <div className="space-y-3">
            {projects.map((project) => (
              <div key={project.id} className="flex items-start gap-3">
                <div
                  className="p-2 rounded-lg flex-shrink-0"
                  style={{ backgroundColor: project.color }}
                >
                  <project.icon size={16} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-[13px] font-semibold text-gray-900 truncate">{project.name}</h4>
                  <p className="text-[11px] text-gray-500">Due date: {project.dueDate}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Team Collaboration */}
        <Card className="col-span-12 lg:col-span-5 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[17px] font-semibold text-gray-900">Team Collaboration</h3>
            <Button variant="outline" size="sm" prefixIcon={Plus}>
              Add Member
            </Button>
          </div>
          <div className="space-y-2">
            {teamMembers.map((member) => (
              <div key={member.id} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <Avatar src={member.avatar} name={member.name} size="sm" />
                  <div>
                    <h4 className="text-[13px] font-semibold text-gray-900">{member.name}</h4>
                    <p className="text-[11px] text-gray-500">
                      Working on <span className="font-semibold text-gray-700">{member.task}</span>
                    </p>
                  </div>
                </div>
                <span className={`px-2.5 py-1 text-[10px] font-semibold rounded-full ${getStatusStyle(member.status)}`}>
                  {member.status}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Project Progress */}
        <Card className="col-span-12 lg:col-span-4 p-5">
          <h3 className="text-[17px] font-semibold text-gray-900 mb-4">Project Progress</h3>
          <div className="flex flex-col items-center">
            <div className="relative w-40 h-40">
              {/* Custom donut chart */}
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Background circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="#e5e7eb"
                  strokeWidth="12"
                  fill="none"
                />
                {/* Progress arc */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="#166534"
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={`${41 * 2.51} ${100 * 2.51}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[36px] font-bold text-gray-900">41%</span>
                <span className="text-[12px] text-gray-500">Project Ended</span>
              </div>
            </div>
            <div className="flex items-center justify-center gap-5 mt-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span className="text-[12px] text-gray-600">Completed</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-primary-700"></span>
                <span className="text-[12px] text-gray-600">In Progress</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-2.5 h-2.5" viewBox="0 0 10 10">
                  <defs>
                    <pattern id="legend-stripes" patternUnits="userSpaceOnUse" width="2" height="2" patternTransform="rotate(45)">
                      <line x1="0" y1="0" x2="0" y2="2" stroke="#166534" strokeWidth="1.5" />
                    </pattern>
                  </defs>
                  <circle cx="5" cy="5" r="5" fill="url(#legend-stripes)" />
                </svg>
                <span className="text-[12px] text-gray-600">Pending</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Time Tracker */}
        <Card className="col-span-12 lg:col-span-3 p-5 !bg-gradient-to-br from-[#1a3a2f] to-[#234d3d] text-white relative overflow-hidden">
          {/* Decorative wave pattern */}
          <div className="absolute inset-0 overflow-hidden">
            <svg className="absolute bottom-0 left-0 w-full h-full opacity-30" viewBox="0 0 200 200" preserveAspectRatio="none">
              {[...Array(10)].map((_, i) => (
                <path
                  key={i}
                  d={`M ${-40 + i * 25} 200 Q ${10 + i * 25} ${120 - i * 8} ${60 + i * 25} ${160 - i * 5} Q ${110 + i * 25} ${200 - i * 3} ${200 + i * 25} ${140 - i * 8}`}
                  stroke="rgba(255,255,255,0.25)"
                  strokeWidth="1"
                  fill="none"
                />
              ))}
            </svg>
          </div>
          <div className="relative z-10">
            <h3 className="text-[15px] font-semibold mb-5">Time Tracker</h3>
            <div className="text-[38px] font-bold tracking-wide mb-6 font-mono">
              {formatTime(time.hours)}:{formatTime(time.minutes)}:{formatTime(time.seconds)}
            </div>
            <div className="flex items-center gap-3">
              <button className="p-3.5 bg-white/20 hover:bg-white/30 rounded-full transition-colors">
                <Pause size={22} className="text-white" />
              </button>
              <button className="p-3.5 bg-red-500 hover:bg-red-600 rounded-full transition-colors">
                <Square size={22} className="text-white" fill="white" />
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
