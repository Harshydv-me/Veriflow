import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import api from '../services/api';

const FieldData: React.FC = () => {
  const [fieldData, setFieldData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFieldData();
  }, []);

  const loadFieldData = async () => {
    try {
      const response = await api.get('/field-data/all');
      setFieldData(response.data.fieldData);
    } catch (error) {
      console.error('Load field data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (dataId: string, approved: boolean) => {
    try {
      await api.put(`/field-data/${dataId}/verify`, { approved });
      alert(`Field data ${approved ? 'approved' : 'rejected'} successfully!`);
      loadFieldData();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to verify field data');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Field Data Submissions</h1>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-gray-600">Loading field data...</div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Data ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Project
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Collector
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {fieldData.map((data) => (
                  <tr key={data.dataId}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {data.dataId}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {data.projectId}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {data.collector}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(data.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          data.verified
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {data.verified ? 'Verified' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {!data.verified && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleVerify(data.dataId, true)}
                            className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleVerify(data.dataId, false)}
                            className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                      <a
                        href={data.ipfsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline ml-2"
                      >
                        View IPFS
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {fieldData.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No field data submissions found
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FieldData;
