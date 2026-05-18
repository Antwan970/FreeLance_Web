import { Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import '../styles/Home.css';

export default function Home() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="home-container">
      <section className="hero">
        <div className="hero-content">
          <p className="hero-badge">Freelance jobs · Talent matching · Professional dashboards</p>
          <h1 className="hero-title">Hire better talent and track every application clearly</h1>
          <p className="hero-subtitle">
            FreeLancena helps job seekers apply with CVs and detailed messages, while employers manage applicants, decisions, and hiring performance from one clean dashboard.
          </p>

          {isAuthenticated ? (
            <div className="hero-buttons">
              <Link to="/dashboard" className="btn btn-primary">Open Dashboard</Link>
              <Link to="/jobs" className="btn btn-secondary">Browse Jobs</Link>
              {user?.role === 'employer' && <Link to="/create-job" className="btn btn-secondary">Post a Job</Link>}
            </div>
          ) : (
            <div className="hero-buttons">
              <Link to="/register" className="btn btn-primary">Get Started</Link>
              <Link to="/login" className="btn btn-secondary">Login</Link>
            </div>
          )}
        </div>

        <div className="hero-visual" aria-label="Professional hiring dashboard preview">
          <img
            className="hero-main-image"
            src="https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=900&q=80"
            alt="Team working on a professional web dashboard"
          />
          <div className="floating-card card-one"><span>Active Jobs</span><strong>120+</strong></div>
          <div className="floating-card card-two"><span>Applicant Status</span><strong>Tracked</strong></div>
          <div className="hero-chart">
            <div style={{ height: '42%' }}></div>
            <div style={{ height: '68%' }}></div>
            <div style={{ height: '85%' }}></div>
            <div style={{ height: '56%' }}></div>
          </div>
        </div>
      </section>

      <section className="trust-strip">
        <div><strong>3</strong><span>Main roles</span></div>
        <div><strong>CV</strong><span>Application upload</span></div>
        <div><strong>Status</strong><span>Accept / Reject</span></div>
        <div><strong>Charts</strong><span>Visual dashboard</span></div>
      </section>

      <section className="image-story-section">
        <div className="story-text">
          <p className="section-eyebrow">Professional experience</p>
          <h2>Designed for both sides of the hiring process</h2>
          <p>
            Job seekers can submit a professional application with email, phone, CV, and a detailed message. Employers can read every application and decide whether it is accepted, rejected, or still in process.
          </p>
        </div>
        <div className="story-images">
          <img src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=600&q=80" alt="Freelancers collaborating" />
          <img src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=600&q=80" alt="Employer reviewing dashboards" />
        </div>
      </section>

      <section className="features">
        <p className="section-eyebrow">Core features</p>
        <h2>Why Choose FreeLancena?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📝</div>
            <h3>Detailed Applications</h3>
            <p>Applicants submit their contact details, CV, portfolio link, and a professional message.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">✅</div>
            <h3>Employer Decisions</h3>
            <p>Employers can accept, reject, or keep each candidate in process from the dashboard.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Visual Dashboards</h3>
            <p>Clean charts and status counters make project progress easy to present and understand.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🎨</div>
            <h3>Modern Interface</h3>
            <p>Comfortable colors, cards, spacing, and responsive layouts make the website look stronger.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
