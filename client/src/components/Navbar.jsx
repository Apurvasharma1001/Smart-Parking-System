import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold">
            🅿️ Smart Parking
          </Link>

          {isAuthenticated ? (
            <div className="flex items-center space-x-4">
              <span className="text-sm">
                {user?.name} ({user?.role})
              </span>
              <Link
                to={user?.role === 'OWNER' ? '/owner/dashboard' : '/customer/dashboard'}
                className="px-4 py-2 bg-blue-700 rounded hover:bg-blue-800 transition"
              >
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 rounded hover:bg-red-700 transition"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="px-4 py-2 bg-blue-700 rounded hover:bg-blue-800 transition"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 bg-green-600 rounded hover:bg-green-700 transition"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;


