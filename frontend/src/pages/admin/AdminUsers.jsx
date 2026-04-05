import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../axiosConfig';

const AdminUsers = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const headers = { Authorization: `Bearer ${user?.token}` };

  const fetchUsers = async () => {
    try {
      const response = await axiosInstance.get('/api/admin/users', { headers });
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users');
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleToggleStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      await axiosInstance.put(`/api/admin/users/${userId}/status`, { status: newStatus }, { headers });
      fetchUsers();
    } catch (error) {
      alert('Failed to update user status');
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Delete this user? All their reviews will also be removed.')) return;
    try {
      await axiosInstance.delete(`/api/admin/users/${userId}`, { headers });
      fetchUsers();
    } catch (error) {
      alert('Failed to delete user');
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Manage Users</h1>

      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left text-sm font-bold">Name</th>
              <th className="p-3 text-left text-sm font-bold">Email</th>
              <th className="p-3 text-left text-sm font-bold">Role</th>
              <th className="p-3 text-left text-sm font-bold">Status</th>
              <th className="p-3 text-left text-sm font-bold">Joined</th>
              <th className="p-3 text-left text-sm font-bold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} className="border-t">
                <td className="p-3 font-bold">{u.name}</td>
                <td className="p-3">{u.email}</td>
                <td className="p-3">
                  <span className={`text-xs px-2 py-1 rounded ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100'}`}>
                    {u.role}
                  </span>
                </td>
                <td className="p-3">
                  <span className={`text-xs px-2 py-1 rounded ${u.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {u.status}
                  </span>
                </td>
                <td className="p-3 text-sm">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="p-3">
                  <button
                    onClick={() => handleToggleStatus(u._id, u.status)}
                    className={`${u.status === 'active' ? 'bg-yellow-500' : 'bg-green-600'} text-white px-3 py-1 rounded mr-2 text-sm`}
                  >
                    {u.status === 'active' ? 'Suspend' : 'Activate'}
                  </button>
                  <button
                    onClick={() => handleDelete(u._id)}
                    className="bg-red-500 text-white px-3 py-1 rounded text-sm"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && <p className="text-center py-8 text-gray-500">No users found</p>}
      </div>
    </div>
  );
};

export default AdminUsers;
