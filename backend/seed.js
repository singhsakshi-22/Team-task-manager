require('dotenv').config();
const { connectDB, USE_MOCK_DB, mongoose } = require('./config/db');
const User = require('./models/User');
const Project = require('./models/Project');
const Task = require('./models/Task');
const ActivityLog = require('./models/ActivityLog');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const seed = async () => {
  try {
    await connectDB();

    console.log('Clearing database records...');
    if (!USE_MOCK_DB) {
      await User.deleteMany({});
      await Project.deleteMany({});
      await Task.deleteMany({});
      await ActivityLog.deleteMany({});
    } else {
      // In mock DB mode, wipe the mock database file structure
      const MOCK_DB_FILE = path.join(__dirname, 'data', 'local_db.json');
      const blankData = { users: [], projects: [], tasks: [], activitylogs: [] };
      fs.writeFileSync(MOCK_DB_FILE, JSON.stringify(blankData, null, 2), 'utf8');
      
      // Reload our module instances (or they reload on write)
      const dbConfig = require('./config/db');
      // Set in-memory data directly to blank
      const usersCol = require('./models/User');
      const projectsCol = require('./models/Project');
      const tasksCol = require('./models/Task');
      const logsCol = require('./models/ActivityLog');
      
      usersCol.collection.length = 0;
      projectsCol.collection.length = 0;
      tasksCol.collection.length = 0;
      logsCol.collection.length = 0;
    }

    console.log('Hashing passwords...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    console.log('Seeding Users...');
    const usersData = [
      {
        name: 'Aether Admin',
        email: 'admin@aether.com',
        password: hashedPassword,
        role: 'Admin',
        avatarColor: 'from-cyan-500 to-blue-500'
      },
      {
        name: 'Sakshi Sharma',
        email: 'sakshi@aether.com',
        password: hashedPassword,
        role: 'Member',
        avatarColor: 'from-violet-500 to-purple-500'
      },
      {
        name: 'Liam Chen',
        email: 'liam@aether.com',
        password: hashedPassword,
        role: 'Member',
        avatarColor: 'from-emerald-500 to-teal-500'
      },
      {
        name: 'Sophia Rodriguez',
        email: 'sophia@aether.com',
        password: hashedPassword,
        role: 'Member',
        avatarColor: 'from-rose-500 to-red-500'
      }
    ];

    const seededUsers = [];
    for (let u of usersData) {
      const user = await User.create(u);
      seededUsers.push(user);
    }

    const adminUser = seededUsers[0];
    const sakshiUser = seededUsers[1];
    const liamUser = seededUsers[2];
    const sophiaUser = seededUsers[3];

    console.log('Seeding Projects...');
    const projectsData = [
      {
        name: 'Chronos AI Engine',
        description: 'Scheduling machine learning training pipelines and auto-deploying models into edge clusters.',
        owner: adminUser._id,
        members: [sakshiUser._id, liamUser._id, sophiaUser._id]
      },
      {
        name: 'Cybersecurity Vault',
        description: 'Building an enterprise decentralized ledger to manage Zero Trust API authentication credentials.',
        owner: adminUser._id,
        members: [sakshiUser._id, liamUser._id]
      },
      {
        name: 'Aero UI Framework',
        description: 'Frictionless, responsive, and component-driven glassmorphism dashboard system designed with Tailwind.',
        owner: adminUser._id,
        members: [sakshiUser._id, sophiaUser._id]
      }
    ];

    const seededProjects = [];
    for (let p of projectsData) {
      const project = await Project.create(p);
      seededProjects.push(project);
    }

    const chronosProj = seededProjects[0];
    const vaultProj = seededProjects[1];
    const aeroProj = seededProjects[2];

    console.log('Seeding Tasks...');
    const now = new Date();
    
    // Future dates
    const inThreeDays = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString();
    const inSevenDays = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const tomorrow = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString();
    
    // Overdue dates (past)
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString();
    const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString();

    const tasksData = [
      // Chronos Project Tasks
      {
        title: 'Design GPU Scheduling Algorithm',
        description: 'Develop dynamic load-balancer to queue Deep Learning models matching host memory availability.',
        project: chronosProj._id,
        assignee: sakshiUser._id,
        status: 'In Progress',
        priority: 'High',
        dueDate: tomorrow
      },
      {
        title: 'Implement Prometheus Metrics Agent',
        description: 'Configure real-time scraping interval on CUDA drivers to expose temperature and usage stats.',
        project: chronosProj._id,
        assignee: liamUser._id,
        status: 'Pending',
        priority: 'Medium',
        dueDate: inThreeDays
      },
      {
        title: 'Audit AI Model Permissions Layer',
        description: 'Validate JWT scope assertions before serving pipeline endpoint responses.',
        project: chronosProj._id,
        assignee: adminUser._id,
        status: 'Completed',
        priority: 'High',
        dueDate: twoDaysAgo
      },
      // Vault Project Tasks
      {
        title: 'Draft Ledger Security Architecture',
        description: 'Create multi-signature block structure specification document for team authorization review.',
        project: vaultProj._id,
        assignee: sakshiUser._id,
        status: 'Completed',
        priority: 'High',
        dueDate: fiveDaysAgo
      },
      {
        title: 'Perform Cryptographic Security Audit',
        description: 'Identify potential side-channel threats inside bcrypt and RSA decryption procedures.',
        project: vaultProj._id,
        assignee: liamUser._id,
        status: 'Pending',
        priority: 'High',
        dueDate: twoDaysAgo // OVERDUE!
      },
      {
        title: 'Integrate OAuth2 Endpoint Registry',
        description: 'Establish registration routing table mapping secure client IDs to token signing chains.',
        project: vaultProj._id,
        assignee: sakshiUser._id,
        status: 'In Progress',
        priority: 'Medium',
        dueDate: inSevenDays
      },
      // Aero UI Project Tasks
      {
        title: 'Assemble Glassmorphism Styling Utility',
        description: 'Implement modern translucent CSS filters, glowing border shades, and dark/light support config.',
        project: aeroProj._id,
        assignee: sophiaUser._id,
        status: 'In Progress',
        priority: 'High',
        dueDate: tomorrow
      },
      {
        title: 'Build Collaborative Chat Sidebar UI',
        description: 'Craft dynamic scrolling feed of project updates with soft gradient indicators for user states.',
        project: aeroProj._id,
        assignee: sakshiUser._id,
        status: 'Completed',
        priority: 'Low',
        dueDate: now.toISOString()
      }
    ];

    for (let t of tasksData) {
      await Task.create(t);
    }

    console.log('Seeding Activity Logs...');
    const activityLogsData = [
      {
        user: adminUser._id,
        userName: adminUser.name,
        action: 'created project',
        project: chronosProj._id,
        projectName: chronosProj.name,
        createdAt: new Date(now.getTime() - 10 * 60 * 60 * 1000).toISOString()
      },
      {
        user: adminUser._id,
        userName: adminUser.name,
        action: 'created project',
        project: vaultProj._id,
        projectName: vaultProj.name,
        createdAt: new Date(now.getTime() - 9 * 60 * 60 * 1000).toISOString()
      },
      {
        user: adminUser._id,
        userName: adminUser.name,
        action: 'created project',
        project: aeroProj._id,
        projectName: aeroProj.name,
        createdAt: new Date(now.getTime() - 8 * 60 * 60 * 1000).toISOString()
      },
      {
        user: adminUser._id,
        userName: adminUser.name,
        action: 'created task',
        project: chronosProj._id,
        projectName: chronosProj.name,
        taskTitle: 'Design GPU Scheduling Algorithm',
        createdAt: new Date(now.getTime() - 5 * 60 * 60 * 1000).toISOString()
      },
      {
        user: sakshiUser._id,
        userName: sakshiUser.name,
        action: "updated task status to 'In Progress' on",
        project: chronosProj._id,
        projectName: chronosProj.name,
        taskTitle: 'Design GPU Scheduling Algorithm',
        createdAt: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString()
      },
      {
        user: sakshiUser._id,
        userName: sakshiUser.name,
        action: "updated task status to 'Completed' on",
        project: vaultProj._id,
        projectName: vaultProj.name,
        taskTitle: 'Draft Ledger Security Architecture',
        createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        user: sophiaUser._id,
        userName: sophiaUser.name,
        action: "updated task status to 'In Progress' on",
        project: aeroProj._id,
        projectName: aeroProj.name,
        taskTitle: 'Assemble Glassmorphism Styling Utility',
        createdAt: new Date(now.getTime() - 30 * 60 * 1000).toISOString()
      }
    ];

    for (let log of activityLogsData) {
      await ActivityLog.create(log);
    }

    console.log('Database Seeding Successful!');
    if (!USE_MOCK_DB) {
      await mongoose.disconnect();
    }
    process.exit(0);
  } catch (err) {
    console.error('Failed to seed database:', err);
    process.exit(1);
  }
};

seed();
