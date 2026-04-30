const Job = require('../models/Job');

// @desc    Get all jobs for logged-in user
// @route   GET /api/jobs
// @access  Private
const getJobs = async (req, res, next) => {
  try {
    const { status, search, sort } = req.query;

    // Build query filter
    const filter = { userId: req.user._id };
    if (status && status !== 'All') {
      filter.status = status;
    }
    if (search) {
      filter.$or = [
        { company: { $regex: search, $options: 'i' } },
        { role: { $regex: search, $options: 'i' } },
      ];
    }

    // Build sort option
    let sortOption = { createdAt: -1 }; // default: newest first
    if (sort === 'oldest') sortOption = { createdAt: 1 };
    if (sort === 'company') sortOption = { company: 1 };
    if (sort === 'status') sortOption = { status: 1 };

    const jobs = await Job.find(filter).sort(sortOption);

    // Aggregate stats
    const stats = await Job.aggregate([
      { $match: { userId: req.user._id } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const statsMap = { Applied: 0, Interview: 0, Offer: 0, Rejected: 0 };
    stats.forEach((s) => (statsMap[s._id] = s.count));

    res.status(200).json({
      success: true,
      count: jobs.length,
      stats: statsMap,
      jobs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new job application
// @route   POST /api/jobs
// @access  Private
const createJob = async (req, res, next) => {
  try {
    const { company, role, status, appliedDate, notes } = req.body;

    if (!company || !role) {
      return res.status(400).json({
        success: false,
        message: 'Company and role are required.',
      });
    }

    const job = await Job.create({
      userId: req.user._id,
      company,
      role,
      status: status || 'Applied',
      appliedDate: appliedDate || Date.now(),
      notes: notes || '',
    });

    res.status(201).json({
      success: true,
      message: 'Job application added successfully!',
      job,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a job application
// @route   PUT /api/jobs/:id
// @access  Private
const updateJob = async (req, res, next) => {
  try {
    let job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job application not found.',
      });
    }

    // Verify ownership
    if (job.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this job application.',
      });
    }

    const { company, role, status, appliedDate, notes } = req.body;

    job = await Job.findByIdAndUpdate(
      req.params.id,
      { company, role, status, appliedDate, notes },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Job application updated successfully!',
      job,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a job application
// @route   DELETE /api/jobs/:id
// @access  Private
const deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job application not found.',
      });
    }

    // Verify ownership
    if (job.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this job application.',
      });
    }

    await job.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Job application deleted successfully!',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getJobs, createJob, updateJob, deleteJob };
