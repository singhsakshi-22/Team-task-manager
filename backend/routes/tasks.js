const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const Project = require('../models/Project');
const ActivityLog = require('../models/ActivityLog');
const { protect, authorize } = require('../middleware/auth');

// @desc    Get all tasks for a specific project
// @route   GET /api/tasks/project/:projectId
// @access  Private
router.get('/project/:projectId', protect, async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Role verification (Admin can see all; Member must be owner/member)
    const ownerId = project.owner && (project.owner._id || project.owner);
    const isOwner = ownerId && ownerId.toString() === req.user._id.toString();
    const isMember = project.members && project.members.some(m => {
      const memberId = m._id || m;
      return memberId.toString() === req.user._id.toString();
    });

    if (req.user.role !== 'Admin' && !isOwner && !isMember) {
      return res.status(403).json({ success: false, message: 'Not authorized to view tasks for this project' });
    }

    const tasks = await Task.find({ project: req.params.projectId }).populate('assignee').populate('project');

    res.status(200).json({
      success: true,
      count: tasks.length,
      tasks
    });
  } catch (err) {
    next(err);
  }
});

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private/Admin
router.post('/', protect, authorize('Admin'), async (req, res, next) => {
  try {
    const { title, description, project, assignee, status, priority, dueDate } = req.body;

    if (!title || !project || !assignee || !dueDate) {
      return res.status(400).json({ success: false, message: 'Please provide title, project, assignee and dueDate' });
    }

    // Verify project exists
    const projectDoc = await Project.findById(project);
    if (!projectDoc) {
      return res.status(404).json({ success: false, message: 'Associated project not found' });
    }

    // Create task
    const task = await Task.create({
      title,
      description,
      project,
      assignee,
      status: status || 'Pending',
      priority: priority || 'Medium',
      dueDate
    });

    const populatedTask = await Task.findById(task._id).populate('assignee').populate('project');

    // Create Activity Log
    await ActivityLog.create({
      user: req.user._id,
      userName: req.user.name,
      action: 'created task',
      project: projectDoc._id,
      projectName: projectDoc.name,
      taskTitle: task.title
    });

    res.status(201).json({
      success: true,
      task: populatedTask
    });
  } catch (err) {
    next(err);
  }
});

// @desc    Update task (Admin only)
// @route   PUT /api/tasks/:id
// @access  Private/Admin
router.put('/:id', protect, authorize('Admin'), async (req, res, next) => {
  try {
    let task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('assignee').populate('project');

    // Create Activity Log
    await ActivityLog.create({
      user: req.user._id,
      userName: req.user.name,
      action: 'updated task details of',
      project: task.project && (task.project._id || task.project),
      projectName: task.project && task.project.name,
      taskTitle: task.title
    });

    res.status(200).json({
      success: true,
      task
    });
  } catch (err) {
    next(err);
  }
});

// @desc    Update task status (Admin & assigned Members)
// @route   PATCH /api/tasks/:id/status
// @access  Private
router.patch('/:id/status', protect, async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, message: 'Please provide status' });
    }

    if (!['Pending', 'In Progress', 'Completed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    let task = await Task.findById(req.params.id).populate('project');
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Verify role permissions
    // Member must be a member of the project or assignee of the task
    const project = task.project;
    const isOwner = project && project.owner && project.owner.toString() === req.user._id.toString();
    const isMember = project && project.members && project.members.some(m => m.toString() === req.user._id.toString());
    const isAssignee = task.assignee && task.assignee.toString() === req.user._id.toString();

    if (req.user.role !== 'Admin' && !isOwner && !isMember && !isAssignee) {
      return res.status(403).json({ success: false, message: 'Not authorized to update task status' });
    }

    task.status = status;
    await task.save();

    // Re-populate for response
    const populatedTask = await Task.findById(task._id).populate('assignee').populate('project');

    // Create Activity Log
    await ActivityLog.create({
      user: req.user._id,
      userName: req.user.name,
      action: `updated task status to '${status}' on`,
      project: project && project._id,
      projectName: project && project.name,
      taskTitle: task.title
    });

    res.status(200).json({
      success: true,
      task: populatedTask
    });
  } catch (err) {
    next(err);
  }
});

// @desc    Delete task (Admin only)
// @route   DELETE /api/tasks/:id
// @access  Private/Admin
router.delete('/:id', protect, authorize('Admin'), async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id).populate('project');
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    await Task.findByIdAndDelete(req.params.id);

    // Create Activity Log
    await ActivityLog.create({
      user: req.user._id,
      userName: req.user.name,
      action: `deleted task '${task.title}' from`,
      project: task.project && task.project._id,
      projectName: task.project && task.project.name
    });

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
