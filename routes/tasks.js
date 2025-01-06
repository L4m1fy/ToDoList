const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Task = require('../models/Task');
const Project = require('../models/Project');

// Create task
router.post('/', auth, async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.body.project,
      'members.user': req.user._id
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found or unauthorized' });
    }

    const task = new Task({
      ...req.body,
      createdBy: req.user._id
    });
    await task.save();
    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get project tasks
router.get('/project/:projectId', auth, async (req, res) => {
  try {
    const tasks = await Task.find({ project: req.params.projectId })
      .populate('assignedTo', 'username email')
      .populate('createdBy', 'username email');
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update task progress
router.patch('/:id/progress', auth, async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      project: { $in: await getProjectIds(req.user._id) }
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found or unauthorized' });
    }

    task.progress = req.body.progress;
    if (task.progress === 100) {
      task.status = 'completed';
    } else if (task.progress > 0) {
      task.status = 'in_progress';
    }

    await task.save();
    await updateProjectProgress(task.project);
    res.json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete task
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      project: { $in: await getProjectIds(req.user._id) }
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found or unauthorized' });
    }

    await task.remove();
    await updateProjectProgress(task.project);
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper functions
async function getProjectIds(userId) {
  const projects = await Project.find({ 'members.user': userId });
  return projects.map(p => p._id);
}

async function updateProjectProgress(projectId) {
  const tasks = await Task.find({ project: projectId });
  if (tasks.length > 0) {
    const totalProgress = tasks.reduce((sum, task) => sum + task.progress, 0);
    const progress = Math.round(totalProgress / tasks.length);
    await Project.findByIdAndUpdate(projectId, { progress });
  }
}

module.exports = router;
