import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav className="bg-blue-900 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-xl font-bold">
            Blue Carbon Admin
          </Link>

          <div className="flex space-x-6">
            <Link
              to="/"
              className="hover:text-blue-200 transition-colors"
            >
              Dashboard
            </Link>
            <Link
              to="/projects"
              className="hover:text-blue-200 transition-colors"
            >
              Projects
            </Link>
            <Link
              to="/field-data"
              className="hover:text-blue-200 transition-colors"
            >
              Field Data
            </Link>
          </div>

          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
