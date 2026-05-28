const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const USE_MOCK_DB = !process.env.MONGODB_URI;
const MOCK_DB_FILE = path.join(__dirname, '..', 'data', 'local_db.json');

// Ensure data folder exists
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// In-Memory & File-Persisted Fallback DB
class MockDatabase {
  constructor() {
    this.data = {
      users: [],
      projects: [],
      tasks: [],
      activitylogs: []
    };
    this.load();
  }

  load() {
    try {
      if (fs.existsSync(MOCK_DB_FILE)) {
        const fileContent = fs.readFileSync(MOCK_DB_FILE, 'utf8');
        this.data = JSON.parse(fileContent);
      } else {
        this.save();
      }
    } catch (err) {
      console.error('Error loading fallback database:', err);
    }
  }

  save() {
    try {
      fs.writeFileSync(MOCK_DB_FILE, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (err) {
      console.error('Error saving fallback database:', err);
    }
  }
}

const mockDbInstance = USE_MOCK_DB ? new MockDatabase() : null;

// Mock Query Class to chain Mongoose-like methods (populate, sort, select, etc.)
class MockQuery {
  constructor(data, modelName) {
    this.data = data;
    this.modelName = modelName;
  }

  then(onFulfilled, onRejected) {
    return Promise.resolve(this.data).then(onFulfilled, onRejected);
  }

  catch(onRejected) {
    return Promise.resolve(this.data).catch(onRejected);
  }

  populate(pathStr) {
    if (!this.data) return this;
    const paths = Array.isArray(pathStr) ? pathStr : [pathStr];
    
    const resolvePopulate = (item) => {
      if (!item) return item;
      const newItem = { ...item };
      paths.forEach(p => {
        // Handle path could be nested or simple
        if (p === 'owner' || p === 'assignee') {
          const userId = newItem[p];
          if (userId) {
            const user = mockDbInstance.data.users.find(u => u._id.toString() === userId.toString());
            if (user) {
              const { password, ...safeUser } = user;
              newItem[p] = safeUser;
            }
          }
        } else if (p === 'members') {
          const memberIds = newItem[p] || [];
          newItem[p] = memberIds.map(mId => {
            const user = mockDbInstance.data.users.find(u => u._id.toString() === mId.toString());
            if (user) {
              const { password, ...safeUser } = user;
              return safeUser;
            }
            return mId;
          });
        } else if (p === 'project') {
          const projId = newItem[p];
          if (projId) {
            const proj = mockDbInstance.data.projects.find(pr => pr._id.toString() === projId.toString());
            if (proj) newItem[p] = proj;
          }
        }
      });
      return newItem;
    };

    if (Array.isArray(this.data)) {
      this.data = this.data.map(resolvePopulate);
    } else {
      this.data = resolvePopulate(this.data);
    }
    return this;
  }

  sort(sortObj) {
    if (!Array.isArray(this.data)) return this;
    const keys = Object.keys(sortObj);
    if (keys.length === 0) return this;

    const key = keys[0];
    const order = sortObj[key] === -1 || sortObj[key] === 'desc' ? -1 : 1;

    this.data.sort((a, b) => {
      let valA = a[key];
      let valB = b[key];

      if (key === 'createdAt' || key === 'dueDate') {
        valA = new Date(valA || 0).getTime();
        valB = new Date(valB || 0).getTime();
      }

      if (valA < valB) return -1 * order;
      if (valA > valB) return 1 * order;
      return 0;
    });

    return this;
  }

  select(selectStr) {
    // Basic select emulation
    return this;
  }
}

// Custom Mock Model Emulating Mongoose Model
class MockModel {
  constructor(collectionName) {
    this.collectionName = collectionName;
  }

  get collection() {
    return mockDbInstance.data[this.collectionName];
  }

  generateId() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  find(query = {}) {
    this.collectionName === 'users' && mockDbInstance.load(); // Refresh state
    let results = this.collection.filter(item => {
      for (let key in query) {
        if (query[key] && typeof query[key] === 'object' && query[key].$in) {
          if (!query[key].$in.includes(item[key])) return false;
        } else if (item[key] !== query[key]) {
          return false;
        }
      }
      return true;
    });
    // Deep clone to prevent direct manipulation
    results = JSON.parse(JSON.stringify(results));
    return new MockQuery(results, this.collectionName);
  }

  findOne(query = {}) {
    const results = this.find(query);
    const item = results.data[0] || null;
    return new MockQuery(item, this.collectionName);
  }

  findById(id) {
    if (!id) return new MockQuery(null, this.collectionName);
    const item = this.collection.find(item => item._id.toString() === id.toString()) || null;
    const cloned = item ? JSON.parse(JSON.stringify(item)) : null;
    
    // Add Mongoose-like save method on instance
    if (cloned) {
      cloned.save = async () => {
        const index = this.collection.findIndex(x => x._id.toString() === cloned._id.toString());
        if (index !== -1) {
          const { save, ...pureData } = cloned;
          this.collection[index] = { ...this.collection[index], ...pureData };
          mockDbInstance.save();
        }
        return cloned;
      };
    }
    return new MockQuery(cloned, this.collectionName);
  }

  async create(data) {
    const newDoc = {
      _id: this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data
    };
    this.collection.push(newDoc);
    mockDbInstance.save();
    
    const cloned = JSON.parse(JSON.stringify(newDoc));
    cloned.save = async () => {
      const index = this.collection.findIndex(x => x._id.toString() === cloned._id.toString());
      if (index !== -1) {
        const { save, ...pureData } = cloned;
        this.collection[index] = { ...this.collection[index], ...pureData };
        mockDbInstance.save();
      }
      return cloned;
    };
    return cloned;
  }

  findByIdAndUpdate(id, update, options = {}) {
    const index = this.collection.findIndex(item => item._id.toString() === id.toString());
    if (index === -1) return new MockQuery(null, this.collectionName);

    let updatedDoc = { ...this.collection[index] };
    
    // Support basic $push
    if (update.$push) {
      for (let key in update.$push) {
        if (!updatedDoc[key]) updatedDoc[key] = [];
        if (!updatedDoc[key].includes(update.$push[key])) {
          updatedDoc[key].push(update.$push[key]);
        }
      }
    }

    // Support standard updates
    const cleanUpdate = { ...update };
    delete cleanUpdate.$push;
    delete cleanUpdate.$pull;
    
    updatedDoc = { ...updatedDoc, ...cleanUpdate, updatedAt: new Date().toISOString() };
    this.collection[index] = updatedDoc;
    mockDbInstance.save();
    
    const cloned = JSON.parse(JSON.stringify(updatedDoc));
    return new MockQuery(cloned, this.collectionName);
  }

  async findByIdAndDelete(id) {
    const index = this.collection.findIndex(item => item._id.toString() === id.toString());
    if (index === -1) return null;
    const deleted = this.collection.splice(index, 1)[0];
    mockDbInstance.save();
    return JSON.parse(JSON.stringify(deleted));
  }

  async countDocuments(query = {}) {
    const results = await this.find(query);
    return results.data.length;
  }
}

// Database Connector function
const connectDB = async () => {
  if (!USE_MOCK_DB) {
    try {
      const conn = await mongoose.connect(process.env.MONGODB_URI);
      console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
      console.error(`MongoDB Connection Error: ${error.message}`);
      console.log('Falling back to local file-based database...');
      process.env.MONGODB_URI = ''; // Set to mock mode
      return connectDB();
    }
  } else {
    console.log(`Database fallback active. Persisting to: ${MOCK_DB_FILE}`);
  }
};

module.exports = {
  connectDB,
  USE_MOCK_DB,
  MockModel,
  mongoose
};
