const { mongoose, USE_MOCK_DB, MockModel } = require('../config/db');

let ActivityLogModel;

if (USE_MOCK_DB) {
  ActivityLogModel = new MockModel('activitylogs');
} else {
  const activityLogSchema = new mongoose.Schema({
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    },
    userName: {
      type: String,
      required: true
    },
    action: {
      type: String,
      required: true
    },
    project: {
      type: mongoose.Schema.ObjectId,
      ref: 'Project'
    },
    projectName: {
      type: String
    },
    taskTitle: {
      type: String
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  });

  ActivityLogModel = mongoose.model('ActivityLog', activityLogSchema);
}

module.exports = ActivityLogModel;
