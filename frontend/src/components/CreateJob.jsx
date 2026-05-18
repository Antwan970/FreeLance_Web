import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jobApi } from '../api';
import { useAuth } from '../context/useAuth';
import '../styles/CreateJob.css';

const initialFormData = {
  title: '',
  description: '',
  company: '',
  location: '',
  salary: {
    min: '',
    max: '',
  },
  jobType: 'full-time',
  experienceLevel: 'intermediate',
  skills: '',
};

export default function CreateJob() {
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Job title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Job description is required';
    } else if (formData.description.length < 50) {
      newErrors.description = 'Description must be at least 50 characters';
    }

    if (!formData.company.trim()) {
      newErrors.company = 'Company name is required';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    if (formData.salary.min && formData.salary.max) {
      if (Number(formData.salary.min) > Number(formData.salary.max)) {
        newErrors.salary = 'Minimum salary cannot be greater than maximum';
      }
    }

    if (!formData.skills.trim()) {
      newErrors.skills = 'Please add at least one required skill';
    }

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith('salary.')) {
      const salaryType = name.split('.')[1];
      setFormData((current) => ({
        ...current,
        salary: {
          ...current.salary,
          [salaryType]: value,
        },
      }));
    } else {
      setFormData((current) => ({
        ...current,
        [name]: value,
      }));
    }

    if (errors[name]) {
      setErrors((current) => ({ ...current, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (user?.role !== 'employer') {
      setErrors({ general: 'Only employer accounts can create job posts.' });
      return;
    }

    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const result = await jobApi.create({
        title: formData.title.trim(),
        description: formData.description.trim(),
        company: formData.company.trim(),
        location: formData.location.trim(),
        salary: {
          min: formData.salary.min ? Number(formData.salary.min) : null,
          max: formData.salary.max ? Number(formData.salary.max) : null,
        },
        jobType: formData.jobType,
        experienceLevel: formData.experienceLevel,
        skills: formData.skills
          .split(',')
          .map((skill) => skill.trim())
          .filter(Boolean),
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to create job');
      }

      setSuccess(true);
      setFormData(initialFormData);

      setTimeout(() => {
        navigate('/jobs');
      }, 2000);
    } catch (err) {
      setErrors({ general: err.message || 'Failed to create job' });
    } finally {
      setIsLoading(false);
    }
  };

  if (isAuthenticated && user?.role !== 'employer') {
    return (
      <div className="create-job-container">
        <div className="create-job-card">
          <h1 className="create-job-title">Post a New Job</h1>
          <p className="create-job-subtitle">
            Only employer accounts can create job posts.
          </p>
          <div className="error-message">
            Register or log in as an employer to use this page.
          </div>
          <button
            type="button"
            className="create-job-button"
            onClick={() => navigate('/jobs')}
          >
            Back to Jobs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="create-job-container">
      <div className="create-job-card">
        <h1 className="create-job-title">Post a New Job</h1>
        <p className="create-job-subtitle">Fill in the details below to create a job listing</p>

        {success && (
          <div className="success-message">
            Job posted successfully! Redirecting to jobs page...
          </div>
        )}

        {errors.general && (
          <div className="error-message">{errors.general}</div>
        )}

        <form onSubmit={handleSubmit} className="create-job-form">
          <div className="form-group">
            <label htmlFor="title" className="form-label">
              Job Title *
            </label>
            <input
              id="title"
              type="text"
              name="title"
              className={`form-input ${errors.title ? 'input-error' : ''}`}
              placeholder="e.g., Senior React Developer"
              value={formData.title}
              onChange={handleChange}
              disabled={isLoading}
            />
            {errors.title && <span className="error-text">{errors.title}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="company" className="form-label">
              Company Name *
            </label>
            <input
              id="company"
              type="text"
              name="company"
              className={`form-input ${errors.company ? 'input-error' : ''}`}
              placeholder="Your company name"
              value={formData.company}
              onChange={handleChange}
              disabled={isLoading}
            />
            {errors.company && <span className="error-text">{errors.company}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="location" className="form-label">
              Location *
            </label>
            <input
              id="location"
              type="text"
              name="location"
              className={`form-input ${errors.location ? 'input-error' : ''}`}
              placeholder="e.g., New York, NY or Remote"
              value={formData.location}
              onChange={handleChange}
              disabled={isLoading}
            />
            {errors.location && <span className="error-text">{errors.location}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="description" className="form-label">
              Job Description *
            </label>
            <textarea
              id="description"
              name="description"
              className={`form-textarea ${errors.description ? 'input-error' : ''}`}
              placeholder="Describe the job responsibilities, requirements, and benefits... (minimum 50 characters)"
              value={formData.description}
              onChange={handleChange}
              disabled={isLoading}
              rows="6"
            />
            {errors.description && (
              <span className="error-text">{errors.description}</span>
            )}
            <small className="help-text">
              {formData.description.length}/50 characters (minimum)
            </small>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="jobType" className="form-label">
                Job Type
              </label>
              <select
                id="jobType"
                name="jobType"
                className="form-input"
                value={formData.jobType}
                onChange={handleChange}
                disabled={isLoading}
              >
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="temporary">Temporary</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="experienceLevel" className="form-label">
                Experience Level
              </label>
              <select
                id="experienceLevel"
                name="experienceLevel"
                className="form-input"
                value={formData.experienceLevel}
                onChange={handleChange}
                disabled={isLoading}
              >
                <option value="entry">Entry Level</option>
                <option value="intermediate">Intermediate</option>
                <option value="senior">Senior</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="salary-min" className="form-label">
                Minimum Salary (Optional)
              </label>
              <input
                id="salary-min"
                type="number"
                name="salary.min"
                className={`form-input ${errors.salary ? 'input-error' : ''}`}
                placeholder="e.g., 50000"
                value={formData.salary.min}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="salary-max" className="form-label">
                Maximum Salary (Optional)
              </label>
              <input
                id="salary-max"
                type="number"
                name="salary.max"
                className={`form-input ${errors.salary ? 'input-error' : ''}`}
                placeholder="e.g., 100000"
                value={formData.salary.max}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
          </div>
          {errors.salary && <span className="error-text">{errors.salary}</span>}

          <div className="form-group">
            <label htmlFor="skills" className="form-label">
              Required Skills (comma-separated) *
            </label>
            <textarea
              id="skills"
              name="skills"
              className={`form-textarea ${errors.skills ? 'input-error' : ''}`}
              placeholder="e.g., React, Node.js, MongoDB, AWS"
              value={formData.skills}
              onChange={handleChange}
              disabled={isLoading}
              rows="3"
            />
            {errors.skills && <span className="error-text">{errors.skills}</span>}
            <small className="help-text">
              Separate multiple skills with commas
            </small>
          </div>

          <button
            type="submit"
            className="create-job-button"
            disabled={isLoading}
          >
            {isLoading ? 'Publishing Job...' : 'Post Job'}
          </button>
        </form>

        <p className="cancel-link">
          <button
            type="button"
            className="cancel-btn"
            onClick={() => navigate('/jobs')}
            disabled={isLoading}
          >
            Cancel and go back
          </button>
        </p>
      </div>
    </div>
  );
}
