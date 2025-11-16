import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username cannot exceed 30 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't return password by default
  },
  avatar: {
    type: String,
    default: null
  },
  preferences: {
    language: {
      type: String,
      default: 'en'
    },
    autoplay: {
      type: Boolean,
      default: true
    },
    quality: {
      type: String,
      default: 'auto'
    },
    favoriteGenres: {
      type: [Number],
      default: []
    }
  },
  watchlist: [{
    id: Number,
    mediaType: String,
    title: String,
    poster: String,
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  favorites: [{
    id: Number,
    mediaType: String,
    title: String,
    poster: String,
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  viewingHistory: [{
    id: Number,
    mediaType: String,
    title: String,
    poster: String,
    watchedAt: {
      type: Date,
      default: Date.now
    }
  }],
  continueWatching: [{
    id: Number,
    mediaType: String,
    title: String,
    poster: String,
    progress: Number,
    duration: Number,
    updatedAt: {
      type: Date,
      default: Date.now
    }
  }],
  ratings: [{
    id: Number,
    mediaType: String,
    rating: Number,
    ratedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

const User = mongoose.model('User', userSchema);

export default User;

