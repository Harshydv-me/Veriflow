import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import api from '../services/api';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalProjects: 0,
    pendingProjects: 0,
    verifiedProjects: 0,
    totalFieldData: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [projectsRes, fieldDataRes] = await Promise.all([
        api.get('/projects/all'),
        api.get('/field-data/all'),
      ]);

      const projects = projectsRes.data.projects;
      const fieldData = fieldDataRes.data.fieldData;

      setStats({
        totalProjects: projects.length,
        pendingProjects: projects.filter(
          (p: any) => p.status === 'pending' || p.status === 'submitted'
        ).length,
        verifiedProjects: projects.filter(
          (p: any) => p.status === 'verified' || p.status === 'active'
        ).length,
        totalFieldData: fieldData.length,
      });
    } catch (error) {
      console.error('Load stats error:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, color }: any) => (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-gray-600 text-sm font-medium mb-2">{title}</h3>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Dashboard</h1>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-gray-600">Loading...</div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="Total Projects"
                value={stats.totalProjects}
                color="text-blue-600"
              />
              <StatCard
                title="Pending Review"
                value={stats.pendingProjects}
                color="text-yellow-600"
              />
              <StatCard
                title="Verified Projects"
                value={stats.verifiedProjects}
                color="text-green-600"
              />
              <StatCard
                title="Field Data Submissions"
                value={stats.totalFieldData}
                color="text-purple-600"
              />
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Welcome to Blue Carbon Admin</h2>
              <p className="text-gray-600 mb-4">
                This dashboard allows you to review and verify blue carbon restoration projects
                and field data submissions.
              </p>
              <div className="space-y-2 text-sm text-gray-700">
                <p>• Review project submissions in the Projects tab</p>
                <p>• Verify field data in the Field Data tab</p>
                <p>• Approve projects to mint carbon credits on blockchain</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
