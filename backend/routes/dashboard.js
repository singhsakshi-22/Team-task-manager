const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const Project = require('../models/Project');
const ActivityLog = require('../models/ActivityLog');
const { protect } = require('../middleware/auth');

// @desc    Get dashboard analytics summary
// @route   GET /api/dashboard/summary
// @access  Private
router.get('/summary', protect, async (req, res, next) => {
  try {
    // Fetch all projects and tasks associated with the user
    const projects = await Project.find({}).populate('owner').populate('members');
    const tasks = await Task.find({}).populate('assignee').populate('project');

    // Filter projects based on membership/role
    const userProjects = req.user.role === 'Admin'
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

    const userProjectIds = userProjects.map(p => p._id.toString());

    // Filter tasks based on projects the user belongs to (unless Admin, who sees all)
    const userTasks = req.user.role === 'Admin'
      ? tasks
      : tasks.filter(t => {
          const taskProjId = t.project && (t.project._id || t.project);
          return taskProjId && userProjectIds.includes(taskProjId.toString());
        });

    // Compute Metrics
    const totalTasks = userTasks.length;
    const completedTasks = userTasks.filter(t => t.status === 'Completed').length;
    const pendingTasks = userTasks.filter(t => t.status === 'Pending').length;
    const inProgressTasks = userTasks.filter(t => t.status === 'In Progress').length;
    
    // Overdue tasks: status !== 'Completed' and dueDate < current local time
    const now = new Date();
    const overdueTasks = userTasks.filter(t => {
      return t.status !== 'Completed' && new Date(t.dueDate) < now;
    }).length;

    // Upcoming tasks: due in the next 72 hours, not completed
    const seventyTwoHoursLater = new Date(now.getTime() + 72 * 60 * 60 * 1000);
    const upcomingTasks = userTasks
      .filter(t => {
        const dDate = new Date(t.dueDate);
        return t.status !== 'Completed' && dDate > now && dDate <= seventyTwoHoursLater;
      })
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 5); // top 5 closest

    // Compute Project Analytics (progress per project)
    const projectProgress = userProjects.map(proj => {
      const projTasks = tasks.filter(t => {
        const taskProjId = t.project && (t.project._id || t.project);
        return taskProjId && taskProjId.toString() === proj._id.toString();
      });

      const total = projTasks.length;
      const completed = projTasks.filter(t => t.status === 'Completed').length;
      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

      return {
        _id: proj._id,
        name: proj.name,
        totalTasks: total,
        completedTasks: completed,
        percentage
      };
    });

    res.status(200).json({
      success: true,
      summary: {
        totalTasks,
        completedTasks,
        pendingTasks,
        inProgressTasks,
        overdueTasks,
        upcomingTasks,
        projectProgress
      }
    });
  } catch (err) {
    next(err);
  }
});

// @desc    Get recent activities (Timeline Feed)
// @route   GET /api/dashboard/activity
// @access  Private
router.get('/activity', protect, async (req, res, next) => {
  try {
    // Fetch logs
    const logs = await ActivityLog.find({}).sort({ createdAt: -1 });

    // Show recent 15 logs
    const recentLogs = logs.slice(0, 15);

    res.status(200).json({
      success: true,
      count: recentLogs.length,
      logs: recentLogs
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
