import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../axiosConfig';

const AdminReviews = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [filter, setFilter] = useState('');
  const headers = { Authorization: `Bearer ${user?.token}` };

  const fetchReviews = async () => {
    try {
      let url = '/api/admin/reviews';
      if (filter) url += `?status=${filter}`;
      const response = await axiosInstance.get(url, { headers });
      setReviews(response.data);
    } catch (error) {
      console.error('Failed to fetch reviews');
    }
  };

  useEffect(() => { fetchReviews(); }, [filter]);

  const handleStatusChange = async (reviewId, newStatus) => {
    try {
      await axiosInstance.put(`/api/admin/reviews/${reviewId}/status`, { status: newStatus }, { headers });
      fetchReviews();
    } catch (error) {
      alert('Failed to update review');
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Delete this review permanently?')) return;
    try {
      await axiosInstance.delete(`/api/reviews/${reviewId}`, { headers });
      fetchReviews();
    } catch (error) {
      alert('Failed to delete review');
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Moderate Reviews</h1>

      {/* Filter buttons */}
      <div className="flex gap-2 mb-6">
        <button onClick={() => setFilter('')}
          className={`px-4 py-2 rounded ${filter === '' ? 'bg-green-700 text-white' : 'bg-gray-200'}`}>
          All
        </button>
        <button onClick={() => setFilter('active')}
          className={`px-4 py-2 rounded ${filter === 'active' ? 'bg-green-700 text-white' : 'bg-gray-200'}`}>
          Active
        </button>
        <button onClick={() => setFilter('flagged')}
          className={`px-4 py-2 rounded ${filter === 'flagged' ? 'bg-yellow-500 text-white' : 'bg-gray-200'}`}>
          Flagged
        </button>
        <button onClick={() => setFilter('removed')}
          className={`px-4 py-2 rounded ${filter === 'removed' ? 'bg-red-500 text-white' : 'bg-gray-200'}`}>
          Removed
        </button>
      </div>

      {/* Reviews table */}
      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left text-sm font-bold">Review</th>
              <th className="p-3 text-left text-sm font-bold">Attraction</th>
              <th className="p-3 text-left text-sm font-bold">Author</th>
              <th className="p-3 text-left text-sm font-bold">Rating</th>
              <th className="p-3 text-left text-sm font-bold">Status</th>
              <th className="p-3 text-left text-sm font-bold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((review) => (
              <tr key={review._id} className="border-t">
                <td className="p-3">
                  <div className="font-bold text-sm">{review.title}</div>
                  <div className="text-xs text-gray-500">{review.body?.substring(0, 60)}...</div>
                </td>
                <td className="p-3 text-sm">{review.attraction?.name || 'Deleted'}</td>
                <td className="p-3 text-sm">{review.user?.name || 'Unknown'}</td>
                <td className="p-3 text-yellow-500">{'★'.repeat(review.rating)}</td>
                <td className="p-3">
                  <span className={`text-xs px-2 py-1 rounded ${
                    review.status === 'active' ? 'bg-green-100 text-green-700' :
                    review.status === 'flagged' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {review.status}
                  </span>
                </td>
                <td className="p-3">
                  {review.status === 'flagged' && (
                    <button onClick={() => handleStatusChange(review._id, 'active')}
                      className="bg-green-600 text-white px-3 py-1 rounded mr-2 text-sm">
                      Approve
                    </button>
                  )}
                  {review.status === 'active' && (
                    <button onClick={() => handleStatusChange(review._id, 'flagged')}
                      className="bg-yellow-500 text-white px-3 py-1 rounded mr-2 text-sm">
                      Flag
                    </button>
                  )}
                  <button onClick={() => handleDelete(review._id)}
                    className="bg-red-500 text-white px-3 py-1 rounded text-sm">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {reviews.length === 0 && <p className="text-center py-8 text-gray-500">No reviews found</p>}
      </div>
    </div>
  );
};

export default AdminReviews;
