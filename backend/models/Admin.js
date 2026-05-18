const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  role: {
    type: String,
    enum: ['superadmin', 'admin'],
    default: 'admin',
  },
  permissions: {
    viewUsers: { type: Boolean, default: true },
    editUsers: { type: Boolean, default: true },
    deleteUsers: { type: Boolean, default: false },
    viewJobs: { type: Boolean, default: true },
    editJobs: { type: Boolean, default: true },
    viewStats: { type: Boolean, default: true },
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  },
  lastAdminLogin: {
    type: Date,
    default: null,
  },
  adminLoginCount: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// Index for faster queries
adminSchema.index({ email: 1 });
adminSchema.index({ userId: 1 });

module.exports = mongoose.model('Admin', adminSchema);
