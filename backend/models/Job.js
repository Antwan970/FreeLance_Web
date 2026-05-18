const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  company: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  salary: {
    min: Number,
    max: Number,
  },
  jobType: {
    type: String,
    enum: ['full-time', 'part-time', 'contract', 'temporary'],
    default: 'full-time',
  },
  experienceLevel: {
    type: String,
    enum: ['entry', 'intermediate', 'senior'],
    default: 'intermediate',
  },
  skills: [String],
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  applications: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    name: {
      type: String,
    },
    phone: {
      type: String,
    },
    email: {
      type: String,
    },
    cvName: {
      type: String,
    },
    cvUrl: {
      type: String,
    },
    message: {
      type: String,
    },
    status: {
      type: String,
      enum: ['in-process', 'accepted', 'rejected'],
      default: 'in-process',
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
  }],
}, {
  timestamps: true,
});

module.exports = mongoose.model('Job', jobSchema);
