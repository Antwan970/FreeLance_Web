import { Link } from 'react-router-dom';
import '../styles/Footer.css';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-brand">
          <Link to="/" className="footer-logo">FreeLancena</Link>
          <p>
            A professional freelance hiring platform for job seekers, employers, and admins.
          </p>
        </div>

        <div className="footer-links">
          <div>
            <h4>Platform</h4>
            <Link to="/jobs">Jobs</Link>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/profile">Profile</Link>
          </div>
          <div>
            <h4>For Employers</h4>
            <Link to="/create-job">Create Job</Link>
            <Link to="/dashboard">Applicants</Link>
            <Link to="/admin">Admin Panel</Link>
          </div>
          <div>
            <h4>Contact</h4>
            <span>support@freelancena.com</span>
            <span>Cairo, Egypt</span>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 FreeLancena. All rights reserved.</span>
        <span>Built for modern freelance hiring.</span>
      </div>
    </footer>
  );
}
