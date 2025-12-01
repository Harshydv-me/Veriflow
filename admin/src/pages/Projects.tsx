import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import api from '../services/api';

const Projects: React.FC = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const response = await api.get('/projects/all');
      setProjects(response.data.projects);
    } catch (error) {
      console.error('Load projects error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (projectId: string, approved: boolean) => {
    try {
      await api.put(`/projects/${projectId}/status`, {
        status: approved ? 'verified' : 'rejected',
        estimatedCredits: approved ? 100 : 0, // Simplified for demo
      });

      alert(`Project ${approved ? 'approved' : 'rejected'} successfully!`);
      loadProjects();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to update project');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
      case 'submitted':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredProjects = projects.filter((p) => {
    if (filter === 'pending') return p.status === 'pending' || p.status === 'submitted';
    if (filter === 'verified') return p.status === 'verified' || p.status === 'active';
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Projects</h1>

          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded ${
                filter === 'all' ? 'bg-blue-900 text-white' : 'bg-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded ${
                filter === 'pending' ? 'bg-blue-900 text-white' : 'bg-white'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilter('verified')}
              className={`px-4 py-2 rounded ${
                filter === 'verified' ? 'bg-blue-900 text-white' : 'bg-white'
              }`}
            >
              Verified
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-gray-600">Loading projects...</div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Project
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Area
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Credits
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredProjects.map((project) => (
                  <tr key={project.projectId}>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{project.name}</div>
                        <div className="text-sm text-gray-500">{project.projectId}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {project.ecosystemType}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {project.area.toLocaleString()} m²
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                          project.status
                        )}`}
                      >
                        {project.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {project.estimatedCredits || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {(project.status === 'pending' || project.status === 'submitted') && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleVerify(project.projectId, true)}
                            className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleVerify(project.projectId, false)}
                            className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredProjects.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No projects found
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Projects;
