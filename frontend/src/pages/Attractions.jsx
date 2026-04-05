import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../axiosConfig';

const Attractions = () => {
  const [attractions, setAttractions] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);

  const categories = ['Nature', 'Historical', 'Adventure', 'Cultural', 'Food & Drink'];

  const fetchAttractions = async () => {
    setLoading(true);
    try {
      let url = '/api/attractions?';
      if (search) url += `search=${search}&`;
      if (category) url += `category=${category}&`;
      const response = await axiosInstance.get(url);
      setAttractions(response.data);
    } catch (error) {
      console.error('Failed to fetch attractions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttractions();
  }, [category]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchAttractions();
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Explore Attractions</h1>

      {/* Search and Filter */}
      <div className="flex flex-wrap gap-4 mb-6">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <input
            type="text"
            placeholder="Search attractions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 p-2 border rounded"
          />
          <button type="submit" className="bg-green-700 text-white px-4 py-2 rounded">
            Search
          </button>
        </form>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="text-center">Loading...</p>
      ) : attractions.length === 0 ? (
        <p className="text-center text-gray-500">No attractions found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {attractions.map((attraction) => (
            <Link
              to={`/attractions/${attraction._id}`}
              key={attraction._id}
              className="bg-white rounded shadow hover:shadow-lg transition"
            >
              <div className="bg-green-100 h-40 flex items-center justify-center text-4xl rounded-t">
                🏔️
              </div>
              <div className="p-4">
                <span className="text-xs bg-green-700 text-white px-2 py-1 rounded">
                  {attraction.category}
                </span>
                <h2 className="text-lg font-bold mt-2">{attraction.name}</h2>
                <p className="text-sm text-gray-500">📍 {attraction.location}</p>
                <div className="flex items-center gap-1 mt-2">
                  <span className="text-yellow-500">
                    {'★'.repeat(Math.round(attraction.avgRating))}
                    {'☆'.repeat(5 - Math.round(attraction.avgRating))}
                  </span>
                  <span className="text-sm font-bold">{attraction.avgRating}</span>
                  <span className="text-xs text-gray-400">({attraction.reviewCount} reviews)</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Attractions;
