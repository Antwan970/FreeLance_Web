const express = require('express');
const Job = require('../models/Job');
const auth = require('../middleware/auth');
const { sendApplicationDecisionEmail } = require('../utils/mailer');

const router = express.Router();

// Get all jobs
router.get('/', async (req, res) => {
  try {
    const jobs = await Job.find().populate('postedBy', 'name company');
    res.json(jobs);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Get job by ID
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('postedBy', 'name company').populate('applications.userId', 'name email');
    if (!job) {
      return res.status(404).json({ msg: 'Job not found' });
    }
    res.json(job);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Create job (employer only)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'employer') {
      return res.status(403).json({ msg: 'Only employers can post jobs' });
    }

    const { title, description, company, location, salary, jobType, experienceLevel, skills } = req.body;

    const job = new Job({
      title,
      description,
      company,
      location,
      salary,
      jobType,
      experienceLevel,
      skills,
      postedBy: req.user.id,
    });

    await job.save();
    res.json(job);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Apply to job
router.post('/:id/apply', auth, async (req, res) => {
  try {
    if (req.user.role !== 'jobseeker') {
      return res.status(403).json({ msg: 'Only job seekers can apply to jobs' });
    }

    const name = req.body.name?.trim();
    const email = req.body.email?.trim();
    const phone = req.body.phone?.trim();
    const cvName = req.body.cvName?.trim();
    const cvUrl = req.body.cvUrl?.trim();
    const message = req.body.message?.trim();

    if (!name || !phone) {
      return res.status(400).json({ msg: 'Name and phone number are required' });
    }

    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ msg: 'Job not found' });
    }

    // Check if already applied
    const alreadyApplied = job.applications.find(app => app.userId.toString() === req.user.id);
    if (alreadyApplied) {
      return res.status(400).json({ msg: 'Already applied to this job' });
    }

    job.applications.push({
      userId: req.user.id,
      name,
      email,
      phone,
      cvName,
      cvUrl,
      message,
    });
    await job.save();
    res.json(job);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Update application status (job owner only)
router.put('/:jobId/applications/:applicationId/status', auth, async (req, res) => {
  try {
    const { status } = req.body;

    if (!['in-process', 'accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ msg: 'Invalid application status' });
    }

    const job = await Job.findById(req.params.jobId);
    if (!job) {
      return res.status(404).json({ msg: 'Job not found' });
    }

    if (job.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized to update this application' });
    }

    const application = job.applications.find((app) => {
      const appId = app._id?.toString();
      const userId = app.userId?.toString();
      return appId === req.params.applicationId || userId === req.params.applicationId;
    });

    if (!application) {
      return res.status(404).json({ msg: 'Application not found' });
    }

    const previousStatus = application.status;
    application.status = status;
    await job.save();

    if (status !== previousStatus && ['accepted', 'rejected'].includes(status)) {
      sendApplicationDecisionEmail({
        to: application.email,
        applicantName: application.name,
        status,
        jobTitle: job.title,
        company: job.company,
      }).catch((mailErr) => {
        console.error('Failed to send application decision email:', mailErr.message);
      });
    }

    res.json(job);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Update job (employer only)
router.put('/:id', auth, async (req, res) => {
  try {
    let job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ msg: 'Job not found' });
    }

    if (job.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized to update this job' });
    }

    job = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(job);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Delete job (employer only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ msg: 'Job not found' });
    }

    if (job.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized to delete this job' });
    }

    await Job.findByIdAndRemove(req.params.id);
    res.json({ msg: 'Job deleted' });
  } catch (err) {
    res.status(500).send('Server error');
  }
});

module.exports = router;
