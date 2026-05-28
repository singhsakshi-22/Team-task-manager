const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const Task = require('../models/Task');
const ActivityLog = require('../models/ActivityLog');
const { protect, authorize } = require('../middleware/auth');

// @desc    Get all projects (Admins see all; Members see projects they are assigned to)
// @route   GET /api/projects
// @access  Private
router.get('/', protect, async (req, res, next) => {
  try {
    const projects = await Project.find({}).populate('owner').populate('members');
    
    // Filters based on User role
    const filteredProjects = req.user.role === 'Admin' 
      ? projects 
      : projects.filter(p => {
          const ownerId = p.owner && (p.owner._id || p.owner);
          const isOwner = ownerId && ownerId.toString() === req.user._id.toString();
          
          const isMember = p.members && p.members.some(m => {
            const memberId = m._id || m;
            return memberId.toString() === req.user._id.toString();
          });
          
          return isOwner || isMember;
        });

    res.status(200).json({
      success: true,
      count: filteredProjects.length,
      projects: filteredProjects
    });
  } catch (err) {
    next(err);
  }
});

// @desc    Create new project
// @route   POST /api/projects
// @access  Private/Admin
router.post('/', protect, authorize('Admin'), async (req, res, next) => {
  try {
    const { name, description, members } = req.body;

    if (!name || !description) {
      return res.status(400).json({ success: false, message: 'Please provide name and description' });
    }

    const project = await Project.create({
      name,
      description,
      owner: req.user._id,
      members: members || []
    });

    // Populate owner & members details
    const populatedProject = await Project.findById(project._id).populate('owner').populate('members');

    // Create Activity Log
    await ActivityLog.create({
      user: req.user._id,
      userName: req.user.name,
      action: 'created project',
      project: project._id,
      projectName: project.name
    });

    res.status(201).json({
      success: true,
      project: populatedProject
    });
  } catch (err) {
    next(err);
  }
});

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private/Admin
router.put('/:id', protect, authorize('Admin'), async (req, res, next) => {
  try {
    let project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('owner').populate('members');

    // Create Activity Log
    await ActivityLog.create({
      user: req.user._id,
      userName: req.user.name,
      action: 'updated project settings',
      project: project._id,
      projectName: project.name
    });

    res.status(200).json({
      success: true,
      project
    });
  } catch (err) {
    next(err);
  }
});

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private/Admin
router.delete('/:id', protect, authorize('Admin'), async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const projectName = project.name;

    // Delete associated tasks
    // In our mock model we delete manually:
    if (Task.deleteMany) {
      await Task.deleteMany({ project: req.params.id });
    } else {
      const allTasks = await Task.find({ project: req.params.id });
      for (let task of allTasks) {
        await Task.findByIdAndDelete(task._id);
      }
    }

    await Project.findByIdAndDelete(req.params.id);

    // Create Activity Log
    await ActivityLog.create({
      user: req.user._id,
      userName: req.user.name,
      action: `deleted project '${projectName}'`,
    });

    res.status(200).json({
      success: true,
      message: 'Project and all associated tasks deleted successfully'
    });
  } catch (err) {
    next(err);
  }
});

// @desc    Add member to a project
// @route   POST /api/projects/:id/members
// @access  Private/Admin
router.post('/:id/members', protect, authorize('Admin'), async (req, res, next) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ success: false, message: 'Please provide user ID to add' });
    }

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Check if user already member
    const alreadyMember = project.members.some(m => m.toString() === userId.toString());
    if (alreadyMember) {
      return res.status(400).json({ success: false, message: 'User is already a member of this project' });
    }

    project.members.push(userId);
    await project.save();

    const populatedProject = await Project.findById(project._id).populate('owner').populate('members');

    // Create Activity Log
    await ActivityLog.create({
      user: req.user._id,
      userName: req.user.name,
      action: 'added team member to',
      project: project._id,
      projectName: project.name
    });

    res.status(200).json({
      success: true,
      project: populatedProject
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
