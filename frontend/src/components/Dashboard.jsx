import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { jobApi } from '../api';
import { useAuth } from '../context/useAuth';
import '../styles/Dashboard.css';

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const loadJobs = async () => {
      setLoading(true);
      setError('');
      const result = await jobApi.getAll();

      if (!result.success) {
        setError(result.error || 'Failed to load dashboard data');
        setLoading(false);
        return;
      }

      setJobs(result.data || []);
      setLoading(false);
    };

    loadJobs();
  }, [isAuthenticated, navigate]);

  const handleStatusChange = async (jobId, applicantId, status) => {
    const result = await jobApi.updateApplicationStatus(jobId, applicantId, status);
    if (!result.success) {
      setError(result.error || 'Could not update application status');
      return;
    }
    setJobs((currentJobs) => currentJobs.map((job) => (job._id === jobId ? result.data : job)));
  };

  const dashboardData = useMemo(() => {
    const userId = user?.id || user?._id;
    const postedJobs = jobs.filter((job) => getOwnerId(job) === userId);
    const appliedJobs = jobs
      .map((job) => ({ job, application: getUserApplication(job, userId) }))
      .filter((item) => item.application);
    const totalApplications = postedJobs.reduce(
      (sum, job) => sum + (job.applications?.length || 0),
      0
    );
    const jobTypeCounts = countBy(jobs, 'jobType');
    const experienceCounts = countBy(jobs, 'experienceLevel');
    const employerStatusCounts = countApplicationsByStatus(postedJobs);
    const seekerStatusCounts = countApplicationItemsByStatus(appliedJobs);

    return {
      postedJobs,
      appliedJobs,
      totalApplications,
      jobTypeCounts,
      experienceCounts,
      employerStatusCounts,
      seekerStatusCounts,
      maxTypeCount: Math.max(1, ...Object.values(jobTypeCounts)),
      maxExperienceCount: Math.max(1, ...Object.values(experienceCounts)),
      maxEmployerStatusCount: Math.max(1, ...Object.values(employerStatusCounts)),
      maxSeekerStatusCount: Math.max(1, ...Object.values(seekerStatusCounts)),
    };
  }, [jobs, user?.id, user?._id]);

  if (loading) {
    return <div className="dashboard-container"><div className="dashboard-state">Loading your dashboard...</div></div>;
  }

  if (error) {
    return <div className="dashboard-container"><div className="dashboard-error">{error}</div></div>;
  }

  return (
    <div className="dashboard-container">
      <section className="dashboard-hero">
        <div>
          <p className="eyebrow">Professional workspace</p>
          <h1>{user?.role === 'employer' ? 'Employer Dashboard' : 'Job Seeker Dashboard'}</h1>
          <p>
            Welcome back, {user?.name}. Track applications, review decisions,
            and understand hiring performance with clear visual indicators.
          </p>
        </div>
        <div className="dashboard-actions">
          <Link to="/profile" className="dashboard-btn light">Edit Profile</Link>
          {user?.role === 'employer' ? (
            <Link to="/create-job" className="dashboard-btn dark">Post New Job</Link>
          ) : (
            <Link to="/jobs" className="dashboard-btn dark">Browse Jobs</Link>
          )}
        </div>
      </section>

      {user?.role === 'employer' ? (
        <EmployerDashboard data={dashboardData} onStatusChange={handleStatusChange} />
      ) : (
        <JobSeekerDashboard data={dashboardData} />
      )}

      <section className="dashboard-panel visualization-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Platform visualization</p>
            <h2>Job Market Overview</h2>
          </div>
        </div>
        <div className="charts-grid">
          <MiniBarChart title="Jobs by Type" values={dashboardData.jobTypeCounts} max={dashboardData.maxTypeCount} />
          <MiniBarChart title="Jobs by Experience" values={dashboardData.experienceCounts} max={dashboardData.maxExperienceCount} />
          <DonutChart
            title={user?.role === 'employer' ? 'Applicant Status' : 'Your Application Status'}
            values={user?.role === 'employer' ? dashboardData.employerStatusCounts : dashboardData.seekerStatusCounts}
          />
        </div>
      </section>
    </div>
  );
}

function EmployerDashboard({ data, onStatusChange }) {
  return (
    <>
      <div className="dashboard-stats">
        <StatCard label="Jobs Posted" value={data.postedJobs.length} note="Active listings created by you" />
        <StatCard label="Total Applicants" value={data.totalApplications} note="Candidates who applied" />
        <StatCard label="Average Applicants" value={average(data.totalApplications, data.postedJobs.length)} note="Per job post" />
        <StatCard label="Accepted" value={data.employerStatusCounts.accepted || 0} note="Candidates approved" />
      </div>

      <section className="dashboard-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Recruitment pipeline</p>
            <h2>Your Posted Jobs</h2>
          </div>
          <Link to="/create-job" className="text-link">Create another job →</Link>
        </div>

        {data.postedJobs.length === 0 ? (
          <EmptyState title="No jobs posted yet" message="Create your first job to start receiving applications." />
        ) : (
          <div className="employer-job-list">
            {data.postedJobs.map((job) => (
              <article className="employer-job-card" key={job._id}>
                <div className="employer-job-header">
                  <div>
                    <h3>{job.title}</h3>
                    <p>{job.company} · {job.location} · {formatLabel(job.jobType)}</p>
                  </div>
                  <span className="pill">{job.applications?.length || 0} Applicants</span>
                </div>

                {job.applications?.length ? (
                  <div className="candidate-grid">
                    {job.applications.map((application, index) => {
                      const applicantId = application.userId?._id || application.userId;
                      const applicationId = application._id || applicantId;
                      return (
                        <div className="candidate-card" key={`${job._id}-${applicantId || index}`}>
                          <div className="candidate-top">
                            <div>
                              <h4>{application.name || 'Applicant'}</h4>
                              <p>{application.email || 'No email'} · {application.phone || 'No phone'}</p>
                            </div>
                            <span className={`application-status ${getStatusClass(application.status)}`}>
                              {formatStatus(application.status)}
                            </span>
                          </div>
                          <p className="candidate-message">{application.message || 'No message provided.'}</p>
                          <div className="candidate-meta">
                            <span>📄 {application.cvName || 'No CV file'}</span>
                            {application.cvUrl && (
                              <a href={application.cvUrl} target="_blank" rel="noreferrer">Open CV Link</a>
                            )}
                            <span>🕒 {formatDate(application.appliedAt)}</span>
                          </div>
                          <div className="decision-actions">
                            <button
                              type="button"
                              className="decision-btn process"
                              onClick={() => onStatusChange(job._id, applicationId, 'in-process')}
                            >
                              In Process
                            </button>
                            <button
                              type="button"
                              className="decision-btn accept"
                              onClick={() => onStatusChange(job._id, applicationId, 'accepted')}
                            >
                              Accept
                            </button>
                            <button
                              type="button"
                              className="decision-btn reject"
                              onClick={() => onStatusChange(job._id, applicationId, 'rejected')}
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <span className="muted">No applicants yet</span>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

function JobSeekerDashboard({ data }) {
  return (
    <>
      <div className="dashboard-stats">
        <StatCard label="Applied Jobs" value={data.appliedJobs.length} note="Applications sent by you" />
        <StatCard label="In Process" value={data.seekerStatusCounts['in-process'] || 0} note="Waiting for employer decision" />
        <StatCard label="Accepted" value={data.seekerStatusCounts.accepted || 0} note="Applications approved" />
        <StatCard label="Rejected" value={data.seekerStatusCounts.rejected || 0} note="Applications declined" />
      </div>

      <section className="dashboard-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Application tracking</p>
            <h2>Jobs You Applied For</h2>
          </div>
          <Link to="/jobs" className="text-link">Find more jobs →</Link>
        </div>

        {data.appliedJobs.length === 0 ? (
          <EmptyState title="No applications yet" message="Browse jobs and apply to start building your application history." />
        ) : (
          <div className="application-grid">
            {data.appliedJobs.map(({ job, application }) => (
              <article className="application-card" key={job._id}>
                <div className="application-card-main">
                  <div>
                    <h3>{job.title}</h3>
                    <p>{job.company} · {job.location}</p>
                  </div>
                  <span className={`application-status ${getStatusClass(application.status)}`}>
                    {formatStatus(application.status)}
                  </span>
                </div>
                <p className="application-message">{application.message}</p>
                <div className="application-footer">
                  <span>📄 {application.cvName || 'CV attached'}</span>
                  <span>🕒 {formatDate(application.appliedAt)}</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

function StatCard({ label, value, note }) {
  return (
    <div className="dashboard-stat-card">
      <span>{label}</span>
      <strong>{value}</strong>
      <p>{note}</p>
    </div>
  );
}

function MiniBarChart({ title, values, max }) {
  const entries = Object.entries(values);

  return (
    <div className="mini-chart">
      <h3>{title}</h3>
      {entries.length === 0 ? (
        <p className="muted">No data available yet.</p>
      ) : (
        entries.map(([label, count]) => (
          <div className="bar-row" key={label}>
            <div className="bar-label">
              <span>{formatLabel(label)}</span>
              <strong>{count}</strong>
            </div>
            <div className="bar-track">
              <div className="bar-fill" style={{ width: `${Math.max(8, (count / max) * 100)}%` }} />
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function DonutChart({ title, values }) {
  const total = Object.values(values).reduce((sum, value) => sum + value, 0);
  const accepted = values.accepted || 0;
  const rejected = values.rejected || 0;
  const inProcess = values['in-process'] || 0;
  const acceptedDeg = total ? (accepted / total) * 360 : 0;
  const rejectedDeg = total ? (rejected / total) * 360 : 0;
  const processDeg = total ? (inProcess / total) * 360 : 0;

  return (
    <div className="mini-chart donut-card">
      <h3>{title}</h3>
      <div
        className="donut-chart"
        style={{
          background: total
            ? `conic-gradient(#16a34a 0deg ${acceptedDeg}deg, #dc2626 ${acceptedDeg}deg ${acceptedDeg + rejectedDeg}deg, #2563eb ${acceptedDeg + rejectedDeg}deg ${acceptedDeg + rejectedDeg + processDeg}deg, #e5e7eb ${acceptedDeg + rejectedDeg + processDeg}deg 360deg)`
            : '#e5e7eb',
        }}
      >
        <div><strong>{total}</strong><span>Total</span></div>
      </div>
      <div className="donut-legend">
        <span><i className="dot accepted-dot"></i>Accepted {accepted}</span>
        <span><i className="dot rejected-dot"></i>Rejected {rejected}</span>
        <span><i className="dot process-dot"></i>In Process {inProcess}</span>
      </div>
    </div>
  );
}

function EmptyState({ title, message }) {
  return (
    <div className="empty-state">
      <h3>{title}</h3>
      <p>{message}</p>
    </div>
  );
}

function getOwnerId(job) {
  return job.postedBy?._id || job.postedBy;
}

function getUserApplication(job, userId) {
  if (!userId) return null;
  return job.applications?.find((application) => {
    const applicantId = application.userId?._id || application.userId;
    return applicantId === userId;
  }) || null;
}

function countBy(items, key) {
  return items.reduce((acc, item) => {
    const value = item[key] || 'other';
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}

function countApplicationsByStatus(jobs) {
  return jobs.reduce((acc, job) => {
    (job.applications || []).forEach((application) => {
      const status = application.status || 'in-process';
      acc[status] = (acc[status] || 0) + 1;
    });
    return acc;
  }, {});
}

function countApplicationItemsByStatus(items) {
  return items.reduce((acc, item) => {
    const status = item.application?.status || 'in-process';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});
}

function average(total, count) {
  if (!count) return 0;
  return (total / count).toFixed(1);
}

function formatLabel(value = '') {
  return value
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function getStatusClass(status = 'in-process') {
  return status.replace(/\s+/g, '-');
}

function formatStatus(status = 'in-process') {
  if (status === 'accepted') return 'Accepted';
  if (status === 'rejected') return 'Rejected';
  return 'In Process';
}

function formatDate(date) {
  if (!date) return 'Date not saved';
  return new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}
