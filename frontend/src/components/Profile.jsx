import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userApi } from '../api';
import { useAuth } from '../context/useAuth';
import '../styles/Profile.css';

export default function Profile() {
  const { user, isAuthenticated, updateUser } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    skills: '',
    experience: '',
    resume: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const loadProfile = async () => {
      const result = await userApi.getProfile(user.id);
      const profile = result.data?.profile || {};
      setFormData({
        name: result.data?.name || user?.name || '',
        bio: profile.bio || '',
        skills: Array.isArray(profile.skills) ? profile.skills.join(', ') : '',
        experience: profile.experience || '',
        resume: profile.resume || '',
      });
    };

    if (user?.id) loadProfile();
  }, [isAuthenticated, navigate, user?.id, user?.name]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    const result = await userApi.updateProfile(user.id, {
      name: formData.name.trim(),
      profile: {
        bio: formData.bio.trim(),
        skills: formData.skills.split(',').map((skill) => skill.trim()).filter(Boolean),
        experience: formData.experience.trim(),
        resume: formData.resume.trim(),
      },
    });

    setSaving(false);

    if (!result.success) {
      setError(result.error || 'Failed to update profile');
      return;
    }

    updateUser?.({ ...user, name: result.data.name, profile: result.data.profile });
    setMessage('Profile updated successfully.');
  };

  return (
    <div className="profile-container">
      <section className="profile-card">
        <div className="profile-header">
          <p className="eyebrow">Personal brand</p>
          <h1>Profile & CV</h1>
          <p>Add your CV link, skills, and previous experience to make your account look professional.</p>
        </div>

        {message && <div className="profile-message success">{message}</div>}
        {error && <div className="profile-message error">{error}</div>}

        <form className="profile-form" onSubmit={handleSubmit}>
          <div className="profile-field">
            <label htmlFor="name">Full Name</label>
            <input id="name" name="name" value={formData.name} onChange={handleChange} />
          </div>

          <div className="profile-field">
            <label htmlFor="bio">Professional Bio</label>
            <textarea
              id="bio"
              name="bio"
              rows="4"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Example: Frontend developer specialized in React dashboards and responsive UI."
            />
          </div>

          <div className="profile-field">
            <label htmlFor="skills">Skills</label>
            <input
              id="skills"
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              placeholder="React, JavaScript, MongoDB, CSS"
            />
          </div>

          <div className="profile-field">
            <label htmlFor="experience">Past Experience</label>
            <textarea
              id="experience"
              name="experience"
              rows="5"
              value={formData.experience}
              onChange={handleChange}
              placeholder="Write your previous projects, internships, or work experience."
            />
          </div>

          <div className="profile-field">
            <label htmlFor="resume">CV / Portfolio Link</label>
            <input
              id="resume"
              name="resume"
              value={formData.resume}
              onChange={handleChange}
              placeholder="https://drive.google.com/..."
            />
          </div>

          <button className="profile-save-btn" type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </section>
    </div>
  );
}
