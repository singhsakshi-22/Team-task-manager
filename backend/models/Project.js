const { mongoose, USE_MOCK_DB, MockModel } = require('../config/db');

let ProjectModel;

if (USE_MOCK_DB) {
  ProjectModel = new MockModel('projects');
} else {
  const projectSchema = new mongoose.Schema({
    name: {
      type: String,
      required: [true, 'Please add a project name'],
      trim: true,
      maxlength: [100, 'Project name cannot be more than 100 characters']
    },
    description: {
      type: String,
      required: [true, 'Please add a project description'],
      maxlength: [500, 'Description cannot be more than 500 characters']
    },
    owner: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    },
    members: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      }
    ],
    createdAt: {
      type: Date,
      default: Date.now
    }
  });

  ProjectModel = mongoose.model('Project', projectSchema);
}

module.exports = ProjectModel;
