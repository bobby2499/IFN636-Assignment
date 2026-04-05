import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../axiosConfig';

const AdminAttractions = () => {
  const { user } = useAuth();
  const [attractions, setAttractions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    name: '', description: '', location: '', category: 'Nature',
    openingHours: '', entryPrice: 0
  });

  const categories = ['Nature', 'Historical', 'Adventure', 'Cultural', 'Food & Drink'];
  const headers = { Authorization: `Bearer ${user?.token}` };

  const fetchAttractions = async () => {
    try {
      const response = await axiosInstance.get('/api/attractions');
      setAttractions(response.data);
    } catch (error) {
      console.error('Failed to fetch');
    }
  };

  useEffect(() => { fetchAttractions(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await axiosInstance.put(`/api/attractions/${editing._id}`, formData, { headers });
      } else {
        await axiosInstance.post('/api/attractions', formData, { headers });
      }
      setShowForm(false);
      setEditing(null);
      setFormData({ name: '', description: '', location: '', category: 'Nature', openingHours: '', entryPrice: 0 });
      fetchAttractions();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save');
    }
  };

  const handleEdit = (attraction) => {
    setEditing(attraction);
    setFormData({
      name: attraction.name,
      description: attraction.description,
      location: attraction.location,
      category: attraction.category,
      openingHours: attraction.openingHours || '',
      entryPrice: attraction.entryPrice || 0
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this attraction? All its reviews will also be removed.')) return;
    try {
      await axiosInstance.delete(`/api/attractions/${id}`, { headers });
      fetchAttractions();
    } catch (error) {
      alert('Failed to delete');
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Attractions</h1>
        <button
          onClick={() => { setShowForm(!showForm); setEditing(null); setFormData({ name: '', description: '', location: '', category: 'Nature', openingHours: '', entryPrice: 0 }); }}
          className="bg-green-700 text-white px-4 py-2 rounded"
        >
          + Add New Attraction
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow mb-6">
          <h2 className="text-xl font-bold mb-4">{editing ? 'Edit Attraction' : 'Add New Attraction'}</h2>
          <input type="text" placeholder="Attraction Name" value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full mb-3 p-2 border rounded" required />
          <div className="grid grid-cols-2 gap-3 mb-3">
            <select value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="p-2 border rounded">
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            <input type="text" placeholder="Location" value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="p-2 border rounded" required />
          </div>
          <textarea placeholder="Description" value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full mb-3 p-2 border rounded h-24" required />
          <div className="grid grid-cols-2 gap-3 mb-3">
            <input type="text" placeholder="Opening Hours (e.g. 9am-5pm)" value={formData.openingHours}
              onChange={(e) => setFormData({ ...formData, openingHours: e.target.value })}
              className="p-2 border rounded" />
            <input type="number" placeholder="Entry Price ($)" value={formData.entryPrice}
              onChange={(e) => setFormData({ ...formData, entryPrice: Number(e.target.value) })}
              className="p-2 border rounded" />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-green-700 text-white px-6 py-2 rounded">
              {editing ? 'Update' : 'Create'}
            </button>
            <button type="button" onClick={() => { setShowForm(false); setEditing(null); }}
              className="bg-gray-300 px-6 py-2 rounded">Cancel</button>
          </div>
        </form>
      )}

      {/* Table */}
      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left text-sm font-bold">Name</th>
              <th className="p-3 text-left text-sm font-bold">Category</th>
              <th className="p-3 text-left text-sm font-bold">Location</th>
              <th className="p-3 text-left text-sm font-bold">Rating</th>
              <th className="p-3 text-left text-sm font-bold">Reviews</th>
              <th className="p-3 text-left text-sm font-bold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {attractions.map((a) => (
              <tr key={a._id} className="border-t">
                <td className="p-3 font-bold">{a.name}</td>
                <td className="p-3">{a.category}</td>
                <td className="p-3">{a.location}</td>
                <td className="p-3">★ {a.avgRating}</td>
                <td className="p-3">{a.reviewCount}</td>
                <td className="p-3">
                  <button onClick={() => handleEdit(a)} className="bg-yellow-500 text-white px-3 py-1 rounded mr-2 text-sm">Edit</button>
                  <button onClick={() => handleDelete(a._id)} className="bg-red-500 text-white px-3 py-1 rounded text-sm">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {attractions.length === 0 && <p className="text-center py-8 text-gray-500">No attractions yet</p>}
      </div>
    </div>
  );
};

export default AdminAttractions;
