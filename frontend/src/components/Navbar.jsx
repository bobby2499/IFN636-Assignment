import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-green-800 text-white p-4 flex justify-between items-center">
      <Link to="/" className="text-2xl font-bold">🌍 TravelReview</Link>
      <div className="flex items-center gap-4">
        <Link to="/attractions" className="hover:underline">Attractions</Link>
        {user ? (
          <>
            <Link to="/profile" className="hover:underline">Profile</Link>
            {user.role === 'admin' && (
              <Link to="/admin" className="bg-yellow-500 text-green-900 px-3 py-1 rounded text-sm font-bold">
                Admin
              </Link>
            )}
            <span className="text-sm text-green-200">Hi, {user.name}</span>
            <button
              onClick={handleLogout}
              className="bg-red-500 px-4 py-2 rounded hover:bg-red-700 text-sm"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="hover:underline">Login</Link>
            <Link to="/register" className="bg-yellow-500 text-green-900 px-4 py-2 rounded font-bold text-sm">
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
