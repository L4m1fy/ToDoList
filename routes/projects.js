const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Project = require('../models/Project');
const Task = require('../models/Task');

// Create project
router.post('/', auth, async (req, res) => {
  try {
    const project = new Project({
      ...req.body,
      owner: req.user._id,
      members: [{ user: req.user._id, role: 'owner' }]
    });
    await project.save();
    res.status(201).json(project);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get user's projects
router.get('/', auth, async (req, res) => {
  try {
    const projects = await Project.find({
      'members.user': req.user._id
    }).populate('owner', 'username email');
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update project progress
router.patch('/:id/progress', auth, async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      'members.user': req.user._id
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const tasks = await Task.find({ project: project._id });
    if (tasks.length > 0) {
      const totalProgress = tasks.reduce((sum, task) => sum + task.progress, 0);
      project.progress = Math.round(totalProgress / tasks.length);
    } else {
      project.progress = req.body.progress;
    }

    await project.save();
    res.json(project);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Add member to project
router.post('/:id/members', auth, async (req, res) => {
  try {
    const { email, role } = req.body;
    const project = await Project.findOne({
      _id: req.params.id,
      'members.user': req.user._id,
      'members.role': 'owner'
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found or unauthorized' });
    }

    const newMember = await User.findOne({ email });
    if (!newMember) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (project.members.some(m => m.user.toString() === newMember._id.toString())) {
      return res.status(400).json({ error: 'User already a member' });
    }

    project.members.push({ user: newMember._id, role });
    await project.save();
    res.json(project);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update member role
router.patch('/:id/members/:userId', auth, async (req, res) => {
  try {
    const { role } = req.body;
    const project = await Project.findOne({
      _id: req.params.id,
      'members.user': req.user._id,
      'members.role': 'owner'
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found or unauthorized' });
    }

    const memberIndex = project.members.findIndex(
      m => m.user.toString() === req.params.userId
    );

    if (memberIndex === -1) {
      return res.status(404).json({ error: 'Member not found' });
    }

    project.members[memberIndex].role = role;
    await project.save();
    res.json(project);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Remove member
router.delete('/:id/members/:userId', auth, async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      'members.user': req.user._id,
      'members.role': 'owner'
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found or unauthorized' });
    }

    project.members = project.members.filter(
      m => m.user.toString() !== req.params.userId
    );
    await project.save();
    res.json(project);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
