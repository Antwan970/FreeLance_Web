import { API_BASE_URL } from './config';

export const loginDemoUser = (type) => {
  const demoUsers = {
    seeker: {
      id: 'demo-seeker',
      _id: 'demo-seeker',
      name: 'Demo Job Seeker',
      email: 'seeker@test.com',
      role: 'jobseeker',
      isAdmin: false,
    },
    employer: {
      id: 'demo-employer',
      _id: 'demo-employer',
      name: 'Demo Employer',
      email: 'employer@test.com',
      role: 'employer',
      isAdmin: false,
    },
    admin: {
      id: 'demo-admin',
      _id: 'demo-admin',
      name: 'Demo Admin',
      email: 'admin@test.com',
      role: 'admin',
      isAdmin: true,
    },
  };

  return demoUsers[type] || demoUsers.seeker;
};

export const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;

  const token = localStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['x-auth-token'] = token;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.msg || 'API request failed');
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'An error occurred',
    };
  }
};

export const authApi = {
  register: async (userData) => {
    return apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  login: async (credentials) => {
    return apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  getCurrentUser: async () => {
    return apiCall('/auth/me');
  },
};

export const jobApi = {
  getAll: async () => {
    return apiCall('/jobs');
  },

  getById: async (id) => {
    return apiCall(`/jobs/${id}`);
  },

  create: async (jobData) => {
    return apiCall('/jobs', {
      method: 'POST',
      body: JSON.stringify(jobData),
    });
  },

  update: async (id, jobData) => {
    return apiCall(`/jobs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(jobData),
    });
  },

  delete: async (id) => {
    return apiCall(`/jobs/${id}`, {
      method: 'DELETE',
    });
  },

  apply: async (jobId, applicationData) => {
    return apiCall(`/jobs/${jobId}/apply`, {
      method: 'POST',
      body: JSON.stringify(applicationData),
    });
  },

  updateApplicationStatus: async (jobId, applicationId, status) => {
    return apiCall(`/jobs/${jobId}/applications/${applicationId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },
};

export const userApi = {
  getProfile: async () => {
    return apiCall('/users/profile');
  },

  updateProfile: async (userId, userData) => {
    return apiCall(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },

  getCurrentUser: async () => {
    return apiCall('/auth/me');
  },
};
