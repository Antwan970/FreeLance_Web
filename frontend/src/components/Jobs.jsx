import { useEffect, useState } from 'react';
import { useAuth } from '../context/useAuth';
import { jobApi } from '../api';
import '../styles/Jobs.css';

const emptyApplication = {
  name: '',
  email: '',
  phone: '',
  cvName: '',
  cvUrl: '',
  message: '',
};

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeJobId, setActiveJobId] = useState(null);
  const [application, setApplication] = useState(emptyApplication);
  const [applyErrors, setApplyErrors] = useState({});
  const [applyingJobId, setApplyingJobId] = useState(null);
  const [applyMessage, setApplyMessage] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await jobApi.getAll();

      if (!result.success) {
        throw new Error(result.error);
      }

      setJobs(result.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenApply = (jobId) => {
    setActiveJobId(jobId);
    setApplication({
      ...emptyApplication,
      name: user?.name || '',
      email: user?.email || '',
    });
    setApplyErrors({});
    setApplyMessage({});
  };

  const handleApplicationChange = (e) => {
    const { name, value, files } = e.target;
    setApplication((current) => ({
      ...current,
      [name]: files ? files[0]?.name || '' : value,
    }));

    if (applyErrors[name]) {
      setApplyErrors((current) => ({ ...current, [name]: '' }));
    }
  };

  const handleApplySubmit = async (e, jobId) => {
    e.preventDefault();

    const newErrors = {};
    if (!application.name.trim()) newErrors.name = 'Name is required';
    if (!application.email.trim()) newErrors.email = 'Email is required';
    if (!application.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!application.cvName.trim() && !application.cvUrl.trim()) {
      newErrors.cvName = 'Upload your CV file or add a CV link';
    }
    if (!application.message.trim()) {
      newErrors.message = 'Write a detailed message for the employer';
    } else if (application.message.trim().length < 40) {
      newErrors.message = 'Message should be at least 40 characters';
    }

    if (Object.keys(newErrors).length > 0) {
      setApplyErrors(newErrors);
      return;
    }

    setApplyingJobId(jobId);
    setApplyErrors({});

    const result = await jobApi.apply(jobId, {
      name: application.name.trim(),
      email: application.email.trim(),
      phone: application.phone.trim(),
      cvName: application.cvName.trim() || 'CV link provided',
      cvUrl: application.cvUrl.trim(),
      message: application.message.trim(),
    });

    setApplyingJobId(null);

    if (!result.success) {
      setApplyErrors({ general: result.error || 'Failed to apply for this job' });
      return;
    }

    setJobs((currentJobs) =>
      currentJobs.map((job) => (job._id === jobId ? result.data : job))
    );
    setActiveJobId(null);
    setApplication(emptyApplication);
    setApplyMessage({ [jobId]: 'Application sent successfully. Status: In Process.' });
  };

  const filteredJobs = jobs.filter((job) => {
    const searchText = `${job.title} ${job.company} ${job.location} ${job.skills?.join(' ')}`.toLowerCase();
    const matchesSearch = searchText.includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || job.jobType === typeFilter;
    return matchesSearch && matchesType;
  });

  const totalApplications = jobs.reduce((sum, job) => sum + (job.applications?.length || 0), 0);
  const remoteJobs = jobs.filter((job) => job.location?.toLowerCase().includes('remote')).length;

  if (loading) {
    return (
      <div className="jobs-container">
        <div className="loading">Loading jobs...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="jobs-container">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="jobs-container">
      <section className="jobs-header">
        <div>
          <p className="jobs-eyebrow">Opportunity board</p>
          <h1>Available Jobs</h1>
          <p>Search jobs, compare opportunities, and apply with a detailed message, contact data, and CV.</p>
        </div>
        <div className="jobs-summary">
          <div><strong>{jobs.length}</strong><span>Total Jobs</span></div>
          <div><strong>{totalApplications}</strong><span>Applications</span></div>
          <div><strong>{remoteJobs}</strong><span>Remote Jobs</span></div>
        </div>
      </section>

      <section className="jobs-toolbar">
        <input
          type="search"
          placeholder="Search by title, company, location, or skill..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="all">All Types</option>
          <option value="full-time">Full Time</option>
          <option value="part-time">Part Time</option>
          <option value="contract">Contract</option>
          <option value="temporary">Temporary</option>
        </select>
      </section>

      {jobs.length === 0 ? (
        <div className="no-jobs">
          <p>No jobs available at the moment. Please check back later.</p>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="no-jobs">
          <p>No jobs match your current search or filter.</p>
        </div>
      ) : (
        <div className="jobs-grid">
          {filteredJobs.map((job) => {
            const isApplyOpen = activeJobId === job._id;
            const hasApplied = hasUserApplied(job, user?.id);
            const canApply = isAuthenticated && user?.role === 'jobseeker';
            const userApplication = getUserApplication(job, user?.id);

            return (
              <div key={job._id} className="job-card">
                <div className="job-card-topline">
                  <span className="job-status open">{job.jobType || 'open'}</span>
                  <span className="job-status level">{job.experienceLevel || 'intermediate'}</span>
                </div>
                <h3 className="job-title">{job.title}</h3>
                <p className="job-description">{job.description}</p>
                <div className="job-company">{job.company}</div>
                <div className="job-meta">
                  <span className="job-niche">📍 {job.location}</span>
                  <span className="job-budget">{formatSalary(job.salary)}</span>
                </div>

                {job.skills?.length > 0 && (
                  <div className="skills-row">
                    {job.skills.slice(0, 5).map((skill) => (
                      <span key={skill}>{skill}</span>
                    ))}
                  </div>
                )}

                {applyMessage[job._id] && (
                  <div className="apply-success">{applyMessage[job._id]}</div>
                )}

                {canApply && hasApplied && (
                  <div className="applied-box">
                    <span className={`application-status ${getStatusClass(userApplication?.status)}`}>
                      {formatStatus(userApplication?.status)}
                    </span>
                    <p>Your application is saved. Check your dashboard for employer decisions.</p>
                  </div>
                )}

                {canApply && !hasApplied && !isApplyOpen && (
                  <button
                    type="button"
                    className="btn btn-primary btn-small"
                    onClick={() => handleOpenApply(job._id)}
                  >
                    Apply Now
                  </button>
                )}

                {canApply && !hasApplied && isApplyOpen && (
                  <form
                    className="apply-form"
                    onSubmit={(e) => handleApplySubmit(e, job._id)}
                  >
                    {applyErrors.general && (
                      <div className="apply-error">{applyErrors.general}</div>
                    )}
                    <div className="apply-form-title">
                      <strong>Application Details</strong>
                      <span>The employer will read this information in their dashboard.</span>
                    </div>
                    <div className="apply-field">
                      <label htmlFor={`name-${job._id}`}>Full Name</label>
                      <input
                        id={`name-${job._id}`}
                        type="text"
                        name="name"
                        value={application.name}
                        onChange={handleApplicationChange}
                        disabled={applyingJobId === job._id}
                      />
                      {applyErrors.name && <span className="apply-error-text">{applyErrors.name}</span>}
                    </div>
                    <div className="apply-field two-columns">
                      <div>
                        <label htmlFor={`email-${job._id}`}>Email</label>
                        <input
                          id={`email-${job._id}`}
                          type="email"
                          name="email"
                          value={application.email}
                          onChange={handleApplicationChange}
                          disabled={applyingJobId === job._id}
                        />
                        {applyErrors.email && <span className="apply-error-text">{applyErrors.email}</span>}
                      </div>
                      <div>
                        <label htmlFor={`phone-${job._id}`}>Phone Number</label>
                        <input
                          id={`phone-${job._id}`}
                          type="tel"
                          name="phone"
                          value={application.phone}
                          onChange={handleApplicationChange}
                          disabled={applyingJobId === job._id}
                        />
                        {applyErrors.phone && <span className="apply-error-text">{applyErrors.phone}</span>}
                      </div>
                    </div>
                    <div className="apply-field">
                      <label htmlFor={`cv-${job._id}`}>Upload CV</label>
                      <input
                        id={`cv-${job._id}`}
                        type="file"
                        name="cvName"
                        accept=".pdf,.doc,.docx"
                        onChange={handleApplicationChange}
                        disabled={applyingJobId === job._id}
                      />
                      {application.cvName && <span className="file-name">Selected: {application.cvName}</span>}
                      {applyErrors.cvName && <span className="apply-error-text">{applyErrors.cvName}</span>}
                    </div>
                    <div className="apply-field">
                      <label htmlFor={`cvUrl-${job._id}`}>CV / Portfolio Link Optional</label>
                      <input
                        id={`cvUrl-${job._id}`}
                        type="url"
                        name="cvUrl"
                        placeholder="https://drive.google.com/your-cv"
                        value={application.cvUrl}
                        onChange={handleApplicationChange}
                        disabled={applyingJobId === job._id}
                      />
                    </div>
                    <div className="apply-field">
                      <label htmlFor={`message-${job._id}`}>Detailed Message to Employer</label>
                      <textarea
                        id={`message-${job._id}`}
                        name="message"
                        rows="5"
                        placeholder="Explain your experience, why you fit this job, your availability, and any related projects."
                        value={application.message}
                        onChange={handleApplicationChange}
                        disabled={applyingJobId === job._id}
                      />
                      {applyErrors.message && <span className="apply-error-text">{applyErrors.message}</span>}
                    </div>
                    <div className="apply-actions">
                      <button
                        type="submit"
                        className="btn btn-primary btn-small"
                        disabled={applyingJobId === job._id}
                      >
                        {applyingJobId === job._id ? 'Sending...' : 'Submit Application'}
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary btn-small"
                        onClick={() => setActiveJobId(null)}
                        disabled={applyingJobId === job._id}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function hasUserApplied(job, userId) {
  return Boolean(getUserApplication(job, userId));
}

function getUserApplication(job, userId) {
  if (!userId) return null;
  return job.applications?.find((application) => {
    const applicantId = application.userId?._id || application.userId;
    return applicantId === userId;
  }) || null;
}

function getStatusClass(status = 'in-process') {
  return status.replace(/\s+/g, '-');
}

function formatStatus(status = 'in-process') {
  if (status === 'accepted') return 'Accepted';
  if (status === 'rejected') return 'Rejected';
  return 'In Process';
}

function formatSalary(salary) {
  if (!salary?.min && !salary?.max) {
    return 'Salary not listed';
  }

  if (salary.min && salary.max) {
    return `$${salary.min} - $${salary.max}`;
  }

  return salary.min ? `From $${salary.min}` : `Up to $${salary.max}`;
}
