const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Message = require('../models/Message');
const Project = require('../models/Project');
const Task = require('../models/Task');

// Get project messages
router.get('/:projectId', auth, async (req, res) => {
  try {
    const messages = await Message.find({ project: req.params.projectId })
      .populate('sender', 'username')
      .sort({ createdAt: -1 })
      .limit(50);

    messages.forEach(msg => {
      msg.content = msg.decryptContent();
    });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Process bot commands
async function processBotCommand(projectId, command, args, userId) {
  const project = await Project.findOne({
    _id: projectId,
    'members.user': userId
  });

  if (!project) {
    return 'Project not found or unauthorized';
  }

  switch (command) {
    case 'create-task':
      if (args.length < 2) return 'Usage: /create-task <title> <description>';
      const task = new Task({
        title: args[0],
        description: args.slice(1).join(' '),
        project: projectId,
        createdBy: userId
      });
      await task.save();
      return `Task created: ${task.title}`;

    case 'delete-task':
      if (args.length < 1) return 'Usage: /delete-task <taskId>';
      const taskToDelete = await Task.findOneAndDelete({
        _id: args[0],
        project: projectId
      });
      return taskToDelete 
        ? `Task deleted: ${taskToDelete.title}`
        : 'Task not found';

    case 'list-tasks':
      const tasks = await Task.find({ project: projectId })
        .select('title status progress')
        .limit(10);
      return tasks.length > 0
        ? tasks.map(t => `${t.title} (${t.status} - ${t.progress}%)`).join('\n')
        : 'No tasks found';

    default:
      return 'Unknown command. Available commands: /create-task, /delete-task, /list-tasks';
  }
}

module.exports = { router, processBotCommand };
