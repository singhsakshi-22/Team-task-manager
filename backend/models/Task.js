const { mongoose, USE_MOCK_DB, MockModel } = require('../config/db');

let TaskModel;

if (USE_MOCK_DB) {
  TaskModel = new MockModel('tasks');
} else {
  const taskSchema = new mongoose.Schema({
    title: {
      type: String,
      required: [true, 'Please add a task title'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters']
    },
    description: {
      type: String,
      trim: true
    },
    project: {
      type: mongoose.Schema.ObjectId,
      ref: 'Project',
      required: true
    },
    assignee: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Completed'],
      default: 'Pending'
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium'
    },
    dueDate: {
      type: Date,
      required: [true, 'Please add a due date']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  });

  TaskModel = mongoose.model('Task', taskSchema);
}

module.exports = TaskModel;
