const express = require('express');
const router = express.Router();
const {
  getJobs,
  createJob,
  updateJob,
  deleteJob,
} = require('../controllers/jobController');
const { protect } = require('../middleware/authMiddleware');

// All job routes are protected
router.use(protect);

// GET /api/jobs  |  POST /api/jobs
router.route('/').get(getJobs).post(createJob);

// PUT /api/jobs/:id  |  DELETE /api/jobs/:id
router.route('/:id').put(updateJob).delete(deleteJob);

module.exports = router;
