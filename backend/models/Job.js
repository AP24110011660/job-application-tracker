const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      maxlength: [100, 'Company name cannot exceed 100 characters'],
    },
    role: {
      type: String,
      required: [true, 'Job role is required'],
      trim: true,
      maxlength: [100, 'Role cannot exceed 100 characters'],
    },
    status: {
      type: String,
      enum: ['Applied', 'Interview', 'Offer', 'Rejected'],
      default: 'Applied',
    },
    appliedDate: {
      type: Date,
      required: [true, 'Applied date is required'],
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
      default: '',
    },
  },
  { timestamps: true }
);

// Index for faster queries by userId
JobSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Job', JobSchema);
