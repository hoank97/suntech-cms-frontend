'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Card } from '@/components/ui/card';

const dashboardData = [
  { name: 'Jan', users: 400, posts: 240, products: 220 },
  { name: 'Feb', users: 520, posts: 290, products: 300 },
  { name: 'Mar', users: 480, posts: 400, products: 380 },
  { name: 'Apr', users: 590, posts: 480, products: 420 },
  { name: 'May', users: 620, posts: 550, products: 490 },
  { name: 'Jun', users: 720, posts: 640, products: 580 },
];

const pieData = [
  { name: 'Active', value: 75 },
  { name: 'Inactive', value: 15 },
  { name: 'Pending', value: 10 },
];

const COLORS = ['#086799', '#f05110', '#d9d9d9'];

const stats = [
  { label: 'Total Users', value: '2,543', change: '+12%', color: 'bg-primary/10' },
  { label: 'Total Products', value: '1,284', change: '+8%', color: 'bg-accent/10' },
  { label: 'Active Posts', value: '847', change: '+15%', color: 'bg-secondary' },
  { label: 'Categories', value: '42', change: '+3%', color: 'bg-primary/5' },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-lg p-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Welcome back to CMS Panel!</h1>
        <p className="text-muted-foreground">Monitor your content, users, and analytics in real-time.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <Card key={idx} className="p-6 bg-card border border-border">
            <div className={`w-10 h-10 ${stat.color} rounded-lg mb-4`} />
            <p className="text-sm text-muted-foreground mb-2">{stat.label}</p>
            <div className="flex items-end justify-between">
              <h3 className="text-2xl font-bold text-foreground">{stat.value}</h3>
              <span className="text-xs text-green-600 font-medium">{stat.change}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line Chart */}
        <Card className="lg:col-span-2 p-6 bg-card border border-border">
          <h3 className="text-lg font-semibold text-foreground mb-4">Growth Overview</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dashboardData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="name" stroke="#666666" />
              <YAxis stroke="#666666" />
              <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e0e0e0' }} />
              <Line type="monotone" dataKey="users" stroke="#086799" strokeWidth={2} name="Users" />
              <Line type="monotone" dataKey="posts" stroke="#f05110" strokeWidth={2} name="Posts" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Pie Chart */}
        <Card className="p-6 bg-card border border-border">
          <h3 className="text-lg font-semibold text-foreground mb-4">User Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Bar Chart */}
      <Card className="p-6 bg-card border border-border">
        <h3 className="text-lg font-semibold text-foreground mb-4">Monthly Statistics</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={dashboardData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis dataKey="name" stroke="#666666" />
            <YAxis stroke="#666666" />
            <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e0e0e0' }} />
            <Bar dataKey="users" fill="#086799" name="Users" />
            <Bar dataKey="posts" fill="#f05110" name="Posts" />
            <Bar dataKey="products" fill="#d9d9d9" name="Products" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
