import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../axiosConfig';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axiosInstance.get('/api/admin/dashboard', {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setStats(response.data);
      } catch (error) {
        console.error('Failed to fetch dashboard');
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchStats();
  }, [user]);

  if (loading) return <div className="text-center mt-20">Loading...</div>;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded shadow text-center">
          <div className="text-3xl font-bold text-green-700">{stats?.totalUsers || 0}</div>
          <div className="text-sm text-gray-500">Total Users</div>
        </div>
        <div className="bg-white p-6 rounded shadow text-center">
          <div className="text-3xl font-bold text-blue-700">{stats?.totalAttractions || 0}</div>
          <div className="text-sm text-gray-500">Attractions</div>
        </div>
        <div className="bg-white p-6 rounded shadow text-center">
          <div className="text-3xl font-bold text-yellow-600">{stats?.totalReviews || 0}</div>
          <div className="text-sm text-gray-500">Total Reviews</div>
        </div>
        <div className="bg-white p-6 rounded shadow text-center">
          <div className="text-3xl font-bold text-red-600">{stats?.flaggedReviews || 0}</div>
          <div className="text-sm text-gray-500">Flagged Reviews</div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/admin/attractions" className="bg-white p-6 rounded shadow hover:shadow-lg transition">
          <h3 className="font-bold text-lg mb-2">🏔️ Manage Attractions</h3>
          <p className="text-sm text-gray-500">Create, edit, and delete attraction listings</p>
        </Link>
        <Link to="/admin/users" className="bg-white p-6 rounded shadow hover:shadow-lg transition">
          <h3 className="font-bold text-lg mb-2">👥 Manage Users</h3>
          <p className="text-sm text-gray-500">View, suspend, or delete user accounts</p>
        </Link>
        <Link to="/admin/reviews" className="bg-white p-6 rounded shadow hover:shadow-lg transition">
          <h3 className="font-bold text-lg mb-2">⭐ Moderate Reviews</h3>
          <p className="text-sm text-gray-500">Approve, flag, or remove user reviews</p>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;
