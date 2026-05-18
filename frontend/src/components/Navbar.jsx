import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import '../styles/Navbar.css';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const canCreateJob = user?.role === 'employer';
  const canOpenAdmin = user?.isAdmin;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          Tech Freelance Hub
        </Link>

        <div className="navbar-links">
          <Link to="/" className="nav-link">
            Home
          </Link>

          {isAuthenticated && (
            <>
              <Link to="/jobs" className="nav-link">
                Jobs
              </Link>

              <Link to="/dashboard" className="nav-link">
                Dashboard
              </Link>

              <Link to="/profile" className="nav-link">
                Profile
              </Link>

              {canCreateJob && (
                <Link to="/create-job" className="nav-link">
                  Create Job
                </Link>
              )}

              {canOpenAdmin && (
                <Link to="/admin" className="nav-link">
                  Admin
                </Link>
              )}
            </>
          )}
        </div>

        <div className="navbar-auth">
          {isAuthenticated ? (
            <>
              <span className="nav-user-name">
                Welcome, {user?.name}
              </span>

              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">
                Login
              </Link>

              <Link to="/register" className="register-btn">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
