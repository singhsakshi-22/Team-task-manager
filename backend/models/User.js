const { mongoose, USE_MOCK_DB, MockModel } = require('../config/db');
const bcrypt = require('bcryptjs');

let UserModel;

if (USE_MOCK_DB) {
  UserModel = new MockModel('users');
  
  // Custom helper on MockModel class for auth
  UserModel.comparePassword = async function(candidatePassword, hashedReal) {
    return await bcrypt.compare(candidatePassword, hashedReal);
  };
  
  UserModel.hashPassword = async function(password) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  };
} else {
  const userSchema = new mongoose.Schema({
    name: {
      type: String,
      required: [true, 'Please add a name'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email'
      ]
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: 6,
      select: false
    },
    role: {
      type: String,
      enum: ['Admin', 'Member'],
      default: 'Member'
    },
    avatarColor: {
      type: String,
      default: 'from-blue-500 to-indigo-500' // Sleek Tailwind gradient classes
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  });

  // Encrypt password using bcrypt
  userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
      next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  });

  // Match user entered password to hashed password in database
  userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
  };

  UserModel = mongoose.model('User', userSchema);
}

module.exports = UserModel;
