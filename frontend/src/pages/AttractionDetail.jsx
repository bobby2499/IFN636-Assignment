import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';

const AttractionDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [attraction, setAttraction] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', body: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [attrRes, revRes] = await Promise.all([
          axiosInstance.get(`/api/attractions/${id}`),
          axiosInstance.get(`/api/reviews/attraction/${id}`)
        ]);
        setAttraction(attrRes.data);
        setReviews(revRes.data);
      } catch (error) {
        console.error('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      if (editingReview) {
        const response = await axiosInstance.put(`/api/reviews/${editingReview._id}`, reviewForm, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setReviews(reviews.map(r => r._id === editingReview._id ? response.data : r));
        setEditingReview(null);
      } else {
        const response = await axiosInstance.post('/api/reviews', {
          ...reviewForm, attraction: id
        }, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setReviews([response.data, ...reviews]);
      }
      setReviewForm({ rating: 5, title: '', body: '' });
      setShowReviewForm(false);
      // refresh attraction to get updated rating
      const attrRes = await axiosInstance.get(`/api/attractions/${id}`);
      setAttraction(attrRes.data);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to submit review');
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      await axiosInstance.delete(`/api/reviews/${reviewId}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setReviews(reviews.filter(r => r._id !== reviewId));
      const attrRes = await axiosInstance.get(`/api/attractions/${id}`);
      setAttraction(attrRes.data);
    } catch (error) {
      alert('Failed to delete review');
    }
  };

  const startEdit = (review) => {
    setEditingReview(review);
    setReviewForm({ rating: review.rating, title: review.title, body: review.body });
    setShowReviewForm(true);
  };

  if (loading) return <div className="text-center mt-20">Loading...</div>;
  if (!attraction) return <div className="text-center mt-20">Attraction not found</div>;

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="bg-green-100 rounded-lg p-8 mb-6">
        <span className="text-sm bg-green-700 text-white px-3 py-1 rounded">{attraction.category}</span>
        <h1 className="text-3xl font-bold mt-2">{attraction.name}</h1>
        <p className="text-gray-600 mt-1">📍 {attraction.location}</p>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-yellow-500 text-xl">
            {'★'.repeat(Math.round(attraction.avgRating))}
          </span>
          <span className="font-bold text-lg">{attraction.avgRating}</span>
          <span className="text-gray-500">({attraction.reviewCount} reviews)</span>
        </div>
      </div>

      {/* Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="md:col-span-2">
          <h2 className="text-xl font-bold mb-2">About</h2>
          <p className="text-gray-700">{attraction.description}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-bold mb-3">Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-500">Category</span>
              <span>{attraction.category}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-500">Location</span>
              <span>{attraction.location}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-500">Hours</span>
              <span>{attraction.openingHours || 'Not specified'}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-500">Entry Price</span>
              <span>{attraction.entryPrice > 0 ? `$${attraction.entryPrice}` : 'Free'}</span>
            </div>
          </div>
          {user && (
            <button
              onClick={() => { setShowReviewForm(!showReviewForm); setEditingReview(null); setReviewForm({ rating: 5, title: '', body: '' }); }}
              className="w-full mt-4 bg-green-700 text-white py-2 rounded hover:bg-green-800"
            >
              ✏️ Write a Review
            </button>
          )}
        </div>
      </div>

      {/* Review Form */}
      {showReviewForm && (
        <div className="bg-white p-6 rounded shadow mb-8">
          <h2 className="text-xl font-bold mb-4">
            {editingReview ? 'Edit Your Review' : 'Write a Review'}
          </h2>
          <form onSubmit={handleSubmitReview}>
            <div className="mb-4">
              <label className="block text-sm font-bold mb-1">Rating</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                    className={`text-3xl ${star <= reviewForm.rating ? 'text-yellow-500' : 'text-gray-300'}`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
            <input
              type="text"
              placeholder="Review title"
              value={reviewForm.title}
              onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
              className="w-full mb-4 p-2 border rounded"
              required
            />
            <textarea
              placeholder="Share your experience..."
              value={reviewForm.body}
              onChange={(e) => setReviewForm({ ...reviewForm, body: e.target.value })}
              className="w-full mb-4 p-2 border rounded h-32"
              required
            />
            <div className="flex gap-2">
              <button type="submit" className="bg-green-700 text-white px-6 py-2 rounded">
                {editingReview ? 'Update Review' : 'Submit Review'}
              </button>
              <button
                type="button"
                onClick={() => { setShowReviewForm(false); setEditingReview(null); }}
                className="bg-gray-300 px-6 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reviews List */}
      <h2 className="text-xl font-bold mb-4">Reviews ({reviews.length})</h2>
      {reviews.length === 0 ? (
        <p className="text-gray-500">No reviews yet. Be the first to share your experience!</p>
      ) : (
        reviews.map((review) => (
          <div key={review._id} className="bg-white p-4 rounded shadow mb-3">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold text-sm">
                    {review.user?.name?.charAt(0) || '?'}
                  </div>
                  <div>
                    <span className="font-bold text-sm">{review.user?.name}</span>
                    {user && review.user?._id === user.id && (
                      <span className="text-xs text-green-600 ml-1">(You)</span>
                    )}
                  </div>
                </div>
              </div>
              <span className="text-yellow-500">
                {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
              </span>
            </div>
            <h3 className="font-bold mt-2">{review.title}</h3>
            <p className="text-gray-600 text-sm mt-1">{review.body}</p>
            <p className="text-xs text-gray-400 mt-2">
              {new Date(review.createdAt).toLocaleDateString()}
            </p>
            {user && review.user?._id === user.id && (
              <div className="flex gap-3 mt-2">
                <button
                  onClick={() => startEdit(review)}
                  className="text-sm text-blue-600 hover:underline"
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => handleDeleteReview(review._id)}
                  className="text-sm text-red-600 hover:underline"
                >
                  🗑️ Delete
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default AttractionDetail;
