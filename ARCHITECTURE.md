# 🎯 Production-Grade Prompt Community Platform Architecture

## 1. HIGH-LEVEL ARCHITECTURE DIAGRAM

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT (React + Tailwind)                      │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐   │
│  │   Pages     │  │ Components  │  │   Hooks     │  │  Context/Store  │   │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼ (REST API / GraphQL)
┌─────────────────────────────────────────────────────────────────────────────┐
│                              SERVER (Node.js + Express)                     │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                         API Gateway / Routes                         │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│          │                    │                    │                    │
│          ▼                    ▼                    ▼                    │
│  ┌─────────────┐      ┌─────────────┐      ┌─────────────┐               │
│  │  Auth API   │      │  Prompt API │      │  User API   │               │
│  └─────────────┘      └─────────────┘      └─────────────┘               │
│          │                    │                    │                    │
│          └────────────────────┼────────────────────┘                    │
│                               ▼                                           │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                      CONTROLLERS (Business Logic)                    │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                               │                                           │
│          ┌────────────────────┼────────────────────┐                    │
│          ▼                    ▼                    ▼                    │
│  ┌─────────────┐      ┌─────────────┐      ┌─────────────┐               │
│  │   Services   │      │  Utilities  │      │   Models    │               │
│  │ (Trending,   │      │ (JWT,       │      │  (Mongoose) │               │
│  │  Analytics)  │      │  Validation)│      │             │               │
│  └─────────────┘      └─────────────┘      └─────────────┘               │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DATABASE LAYER (MongoDB)                          │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐   │
│  │    User     │  │   Prompt    │  │   Comment   │  │    Project      │   │
│  │   (Auth,    │  │  (Content,  │  │ (Threaded,  │  │  (Collaboration)│   │
│  │  Profile)   │  │   Likes)    │  │   Nested)   │  │                 │   │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────────┘   │
│                                                                             │
│  ┌─────────────────────┐  ┌─────────────────────────────────────────┐      │
│  │     Analytics       │  │              Indexes                     │      │
│  │  (Views, Engmt)     │  │  (trending, search, user_prompts)       │      │
│  └─────────────────────┘  └─────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼ (Optional)
┌─────────────────────────────────────────────────────────────────────────────┐
│                            CACHE LAYER (Redis - Optional)                    │
│  - Trending scores precomputed                                                │
│  - Session management                                                        │
│  - Rate limiting counters                                                    │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. FOLDER STRUCTURE

```
mini-project/
├── client/                          # React Frontend (NEW)
│   ├── public/
│   │   ├── index.html
│   │   └── favicon.ico
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Input.jsx
│   │   │   │   ├── Modal.jsx
│   │   │   │   ├── Loader.jsx
│   │   │   │   └── Toast.jsx
│   │   │   ├── prompts/
│   │   │   │   ├── PromptCard.jsx
│   │   │   │   ├── PromptForm.jsx
│   │   │   │   ├── PromptGrid.jsx
│   │   │   │   └── TrendingPrompts.jsx
│   │   │   ├── comments/
│   │   │   │   ├── CommentThread.jsx
│   │   │   │   ├── CommentForm.jsx
│   │   │   │   └── CommentItem.jsx
│   │   │   ├── analytics/
│   │   │   │   ├── AnalyticsPanel.jsx
│   │   │   │   ├── StatsCard.jsx
│   │   │   │   └── Chart.jsx
│   │   │   ├── collaboration/
│   │   │   │   ├── ProjectCard.jsx
│   │   │   │   ├── TeamMember.jsx
│   │   │   │   └── ProjectSettings.jsx
│   │   │   └── layout/
│   │   │       ├── Navbar.jsx
│   │   │       ├── Sidebar.jsx
│   │   │       ├── Footer.jsx
│   │   │       └── Layout.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── CreatePrompt.jsx
│   │   │   ├── PromptDetail.jsx
│   │   │   ├── Trending.jsx
│   │   │   ├── Search.jsx
│   │   │   ├── Analytics.jsx
│   │   │   ├── Projects.jsx
│   │   │   └── Settings.jsx
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   ├── usePrompts.js
│   │   │   ├── useAnalytics.js
│   │   │   └── useSearch.js
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   ├── authService.js
│   │   │   ├── promptService.js
│   │   │   ├── analyticsService.js
│   │   │   └── projectService.js
│   │   ├── utils/
│   │   │   ├── formatDate.js
│   │   │   ├── truncate.js
│   │   │   └── constants.js
│   │   ├── styles/
│   │   │   └── index.css
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── server/                          # Express Backend (REFACTORED)
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js              # MongoDB connection
│   │   │   ├── env.js             # Environment variables
│   │   │   └── redis.js           # Redis connection (optional)
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Prompt.js
│   │   │   ├── Comment.js
│   │   │   ├── Project.js
│   │   │   └── Analytics.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── promptController.js
│   │   │   ├── commentController.js
│   │   │   ├── userController.js
│   │   │   ├── projectController.js
│   │   │   └── analyticsController.js
│   │   ├── services/
│   │   │   ├── trendingService.js
│   │   │   ├── analyticsService.js
│   │   │   ├── searchService.js
│   │   │   └── notificationService.js
│   │   ├── middleware/
│   │   │   ├── auth.js            # JWT verification
│   │   │   ├── validate.js        # Request validation
│   │   │   ├── errorHandler.js    # Error handling
│   │   │   └── rateLimiter.js      # Rate limiting
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── prompts.js
│   │   │   ├── comments.js
│   │   │   ├── users.js
│   │   │   ├── projects.js
│   │   │   ├── analytics.js
│   │   │   └── search.js
│   │   ├── utils/
│   │   │   ├── ApiError.js
│   │   │   ├── catchAsync.js
│   │   │   ├── jwt.js
│   │   │   └── validators.js
│   │   └── app.js                  # Express app setup
│   ├── package.json
│   └── .env.example
│
├── shared/                         # Shared types/constants
│   └── index.js
│
├── package.json                     # Root package.json (workspaces)
├── .env                             # Environment variables
└── README.md
```

---

## 3. MONGODB SCHEMA DESIGN

### 3.1 User Schema
```javascript
// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    index: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  username: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  avatar: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    maxlength: 500
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'moderator'],
    default: 'user'
  },
  // Social features
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  bookmarks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prompt'
  }],
  // Analytics
  totalPrompts: { type: Number, default: 0 },
  totalLikes: { type: Number, default: 0 },
  totalViews: { type: Number, default: 0 },
  // Timestamps
  lastActive: Date,
  createdAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Indexes
userSchema.index({ createdAt: -1 });
userSchema.index({ username: 'text' });

// Password hashing middleware
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// JSON transformation
userSchema.set('toJSON', {
  transform: function(doc, ret) {
    ret.id = ret._id;
    delete ret.password;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('User', userSchema);
```

### 3.2 Prompt Schema
```javascript
// models/Prompt.js
const mongoose = require('mongoose');

const promptSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['writing', 'coding', 'design', 'marketing', 'education', 'other'],
    default: 'other'
  },
  tags: [String],
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  // Engagement metrics
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  views: {
    type: Number,
    default: 0
  },
  uniqueViews: {
    type: Number,
    default: 0
  },
  // Analytics
  viewHistory: [{
    date: Date,
    count: Number
  }],
  likeHistory: [{
    date: Date,
    count: Number
  }],
  // Version history for collaboration
  versions: [{
    content: String,
    timestamp: Date,
    editedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  // Visibility
  isPublic: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  // Collaboration
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  },
  // Soft delete
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Compound indexes for performance
promptSchema.index({ author: 1, createdAt: -1 });
promptSchema.index({ category: 1, createdAt: -1 });
promptSchema.index({ createdAt: -1 });
promptSchema.index({ isPublic: 1, createdAt: -1 });
promptSchema.index({ title: 'text', content: 'text' }); // Full-text search

// Virtual for like count
promptSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

// Ensure virtuals are included in JSON
promptSchema.set('toJSON', { virtuals: true });
promptSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Prompt', promptSchema);
```

### 3.3 Comment Schema (Nested/Threaded)
```javascript
// models/Comment.js
const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    maxlength: 2000
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  prompt: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prompt',
    required: true,
    index: true
  },
  // Threaded comments (parent-child)
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null
  },
  replies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  // Engagement
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  // Moderation
  isEdited: { type: Boolean, default: false },
  isDeleted: { type: Boolean, default: false },
  deletedAt: Date
}, {
  timestamps: true
});

// Indexes
commentSchema.index({ prompt: 1, createdAt: -1 });
commentSchema.index({ parent: 1, createdAt: -1 });

// Recursive delete for threaded comments
commentSchema.methods.softDelete = async function() {
  this.isDeleted = true;
  this.deletedAt = new Date();
  await this.save();
  
  // Delete all replies
  for (const replyId of this.replies) {
    const reply = await this.constructor.findById(replyId);
    if (reply) await reply.softDelete();
  }
};

module.exports = mongoose.model('Comment', commentSchema);
```

### 3.4 Project Schema (Collaboration)
```javascript
// models/Project.js
const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    maxlength: 1000
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['admin', 'editor', 'viewer'],
      default: 'viewer'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  prompts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prompt'
  }],
  // Settings
  isPrivate: {
    type: Boolean,
    default: true
  },
  // Activity log
  activityLog: [{
    action: String,
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: Date,
    details: String
  }]
}, {
  timestamps: true
});

// Indexes
projectSchema.index({ owner: 1 });
projectSchema.index({ 'members.user': 1 });

module.exports = mongoose.model('Project', projectSchema);
```

### 3.5 Analytics Schema
```javascript
// models/Analytics.js
const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  prompt: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prompt',
    required: true,
    index: true
  },
  date: {
    type: Date,
    required: true
  },
  // Daily metrics
  views: {
    total: { type: Number, default: 0 },
    unique: { type: Number, default: 0 }
  },
  likes: {
    total: { type: Number, default: 0 },
    unique: { type: Number, default: 0 }
  },
  comments: {
    total: { type: Number, default: 0 }
  },
  shares: {
    type: Number,
    default: 0
  },
  // Engagement rate
  engagementRate: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Compound index for time-series queries
analyticsSchema.index({ prompt: 1, date: -1 });

module.exports = mongoose.model('Analytics', analyticsSchema);
```

---

## 4. API ROUTES DESIGN

### Authentication Routes (`/api/auth`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/register` | Register new user | No |
| POST | `/login` | Login user | No |
| POST | `/logout` | Logout user | Yes |
| GET | `/me` | Get current user | Yes |
| PUT | `/password` | Change password | Yes |
| POST | `/forgot-password` | Request password reset | No |
| POST | `/reset-password` | Reset password | No |

### User Routes (`/api/users`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/:id` | Get user profile | No |
| PUT | `/:id` | Update user profile | Yes |
| GET | `/:id/prompts` | Get user's prompts | No |
| GET | `/:id/followers` | Get user's followers | No |
| GET | `/:id/following` | Get user's following | No |
| POST | `/:id/follow` | Follow user | Yes |
| DELETE | `/:id/follow` | Unfollow user | Yes |
| GET | `/:id/analytics` | Get user analytics | Yes |
| POST | `/:id/bookmark` | Bookmark a prompt | Yes |
| DELETE | `/:id/bookmark/:promptId` | Remove bookmark | Yes |

### Prompt Routes (`/api/prompts`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | Get all prompts (paginated) | No |
| GET | `/trending` | Get trending prompts | No |
| GET | `/:id` | Get single prompt | No |
| POST | `/` | Create new prompt | Yes |
| PUT | `/:id` | Update prompt | Yes |
| DELETE | `/:id` | Delete prompt | Yes |
| POST | `/:id/like` | Like a prompt | Yes |
| DELETE | `/:id/like` | Unlike a prompt | Yes |
| POST | `/:id/view` | Track view | No |
| GET | `/:id/comments` | Get prompt comments | No |
| POST | `/:id/comments` | Add comment | Yes |
| GET | `/:id/analytics` | Get prompt analytics | Yes |

### Comment Routes (`/api/comments`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/:id` | Get comment | No |
| PUT | `/:id` | Update comment | Yes |
| DELETE | `/:id` | Delete comment | Yes |
| POST | `/:id/like` | Like comment | Yes |
| POST | `/:id/reply` | Reply to comment | Yes |

### Project Routes (`/api/projects`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | Get user's projects | Yes |
| GET | `/:id` | Get project details | Yes |
| POST | `/` | Create project | Yes |
| PUT | `/:id` | Update project | Yes |
| DELETE | `/:id` | Delete project | Yes |
| POST | `/:id/members` | Add member | Yes |
| DELETE | `/:id/members/:userId` | Remove member | Yes |
| PUT | `/:id/members/:userId` | Update member role | Yes |
| GET | `/:id/prompts` | Get project prompts | Yes |
| POST | `/:id/prompts` | Add prompt to project | Yes |

### Analytics Routes (`/api/analytics`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/overview` | Get dashboard overview | Yes |
| GET | `/prompts/:id` | Get prompt analytics | Yes |
| GET | `/users/:id` | Get user analytics | Yes |
| GET | `/trends` | Get trending data | No |

### Search Routes (`/api/search`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/prompts` | Search prompts | No |
| GET | `/users` | Search users | No |
| GET | `/suggestions` | Get search suggestions | No |

---

## 5. CORE BACKEND LOGIC

### 5.1 Trending/Ranking Service
```javascript
// services/trendingService.js
const Prompt = require('../models/Prompt');

class TrendingService {
  /**
   * Calculate trending score using weighted formula:
   * score = (likes * 2) + (comments * 3) + (views * 1) - decay(hours)
   */
  static calculateScore(prompt) {
    const hoursOld = (Date.now() - prompt.createdAt.getTime()) / (1000 * 60 * 60);
    const decay = Math.log1p(hoursOld) * 2; // Logarithmic decay
    
    const likeScore = prompt.likes.length * 2;
    const viewScore = prompt.views * 1;
    const commentScore = (prompt.commentCount || 0) * 3;
    
    return (likeScore + viewScore + commentScore) - decay;
  }

  /**
   * Get trending prompts with pagination
   */
  static async getTrending({ page = 1, limit = 20, category = null } = {}) {
    const query = { isPublic: true, isDeleted: false };
    if (category) query.category = category;

    const prompts = await Prompt.find(query)
      .populate('author', 'name username avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // Calculate scores and sort
    const scored = prompts.map(p => ({
      ...p.toObject(),
      trendingScore: this.calculateScore(p)
    })).sort((a, b) => b.trendingScore - a.trendingScore);

    return scored;
  }

  /**
   * Precompute trending scores (for caching)
   */
  static async precomputeTrending() {
    const prompts = await Prompt.find({ isPublic: true })
      .populate('author', 'name username')
      .limit(1000);

    const scores = prompts.map(p => ({
      promptId: p._id,
      score: this.calculateScore(p),
      updatedAt: new Date()
    }));

    // Store in cache or analytics collection
    return scores;
  }
}

module.exports = TrendingService;
```

### 5.2 Analytics Service
```javascript
// services/analyticsService.js
const Analytics = require('../models/Analytics');
const Prompt = require('../models/Prompt');

class AnalyticsService {
  /**
   * Track view for a prompt
   */
  static async trackView(promptId, userId = null) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Update prompt view count
    const prompt = await Prompt.findById(promptId);
    if (!prompt) throw new Error('Prompt not found');

    prompt.views += 1;
    
    // Track unique view (simple approach - use userId if logged in)
    if (userId) {
      // Check if user already viewed (would need separate collection)
      prompt.uniqueViews += 1;
    }
    
    await prompt.save();

    // Update daily analytics
    await Analytics.findOneAndUpdate(
      { prompt: promptId, date: today },
      {
        $inc: {
          'views.total': 1,
          'views.unique': userId ? 1 : 0
        }
      },
      { upsert: true }
    );
  }

  /**
   * Get analytics for a prompt
   */
  static async getPromptAnalytics(promptId, { days = 30 } = {}) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const analytics = await Analytics.find({
      prompt: promptId,
      date: { $gte: startDate }
    }).sort({ date: -1 });

    // Aggregate data
    const totals = analytics.reduce((acc, day) => ({
      views: acc.views + day.views.total,
      uniqueViews: acc.uniqueViews + day.views.unique,
      likes: acc.likes + day.likes.total,
      comments: acc.comments + day.comments.total,
      shares: acc.shares + day.shares
    }), { views: 0, uniqueViews: 0, likes: 0, comments: 0, shares: 0 });

    // Calculate engagement rate
    const totalViews = totals.views || 1;
    totals.engagementRate = ((totals.likes + totals.comments) / totalViews * 100).toFixed(2);

    return {
      summary: totals,
      daily: analytics,
      trend: this.calculateTrend(analytics)
    };
  }

  /**
   * Get user analytics dashboard
   */
  static async getUserAnalytics(userId) {
    const prompts = await Prompt.find({ author: userId, isDeleted: false });
    const promptIds = prompts.map(p => p._id);

    // Get total metrics
    const totalPrompts = prompts.length;
    const totalLikes = prompts.reduce((sum, p) => sum + p.likes.length, 0);
    const totalViews = prompts.reduce((sum, p) => sum + p.views, 0);

    // Get recent analytics
    const recentAnalytics = await Analytics.find({
      prompt: { $in: promptIds }
    }).sort({ date: -1 }).limit(30);

    return {
      totalPrompts,
      totalLikes,
      totalViews,
      engagement: ((totalLikes + totalComments) / totalViews * 100).toFixed(2) || 0,
      recentPerformance: this.formatPerformanceData(recentAnalytics)
    };
  }

  static calculateTrend(analytics) {
    if (analytics.length < 2) return 'stable';
    
    const recent = analytics.slice(0, Math.floor(analytics.length / 2));
    const older = analytics.slice(Math.floor(analytics.length / 2));
    
    const recentAvg = recent.reduce((s, a) => s + a.views.total, 0) / recent.length;
    const olderAvg = older.reduce((s, a) => s + a.views.total, 0) / older.length;
    
    if (recentAvg > olderAvg * 1.1) return 'up';
    if (recentAvg < olderAvg * 0.9) return 'down';
    return 'stable';
  }
}

module.exports = AnalyticsService;
```

### 5.3 Auth Middleware
```javascript
// middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user;
    req.userId = user._id;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    next(error);
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);
      if (user) {
        req.user = user;
        req.userId = user._id;
      }
    }
    next();
  } catch (error) {
    // Continue without auth
    next();
  }
};

module.exports = { authenticate, optionalAuth };
```

### 5.4 Error Handling Middleware
```javascript
// middleware/errorHandler.js
class ApiError extends Error {
  constructor(statusCode, message, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      error: 'Validation failed',
      details: messages
    });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      error: `${field} already exists`
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      error: 'Invalid ID format'
    });
  }

  // Default error
  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : 'Internal server error';

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = { ApiError, errorHandler };
```

---

## 6. FRONTEND COMPONENT STRUCTURE

### Component Hierarchy
```
App
├── AuthProvider
│   └── Routes
│       ├── PublicRoutes
│       │   ├── Home (Landing)
│       │   ├── Login
│       │   ├── Register
│       │   └── NotFound
│       │
│       └── ProtectedRoutes
│           ├── Layout
│           │   ├── Navbar
│           │   │   ├── Logo
│           │   │   ├── SearchBar
│           │   │   ├── NavLinks
│           │   │   └── UserMenu
│           │   │
│           │   └── Sidebar (optional)
│           │
│           ├── Dashboard (Home)
│           │   ├── ActivityFeed
│           │   ├── TrendingPrompts
│           │   └── SuggestedUsers
│           │
│           ├── CreatePrompt
│           │   └── PromptForm
│           │
│           ├── PromptDetail
│           │   ├── PromptContent
│           │   ├── LikeButton
│           │   ├── CommentThread
│           │   └── ShareModal
│           │
│           ├── Profile
│           │   ├── ProfileHeader
│           │   ├── PromptGrid
│           │   ├── FollowersList
│           │   └── AnalyticsPreview
│           │
│           ├── Analytics
│           │   ├── Overview
│           │   ├── ChartView
│           │   └── PromptTable
│           │
│           ├── Projects
│           │   ├── ProjectList
│           │   ├── ProjectDetail
│           │   └── TeamManagement
│           │
│           └── Settings
│               ├── AccountSettings
│               ├── PrivacySettings
│               └── NotificationSettings
```

### Key Components

**PromptCard.jsx**
```jsx
const PromptCard = ({ prompt, onLike, onBookmark, onEdit, onDelete }) => {
  const [isLiked, setIsLiked] = useState(false);
  
  const handleLike = async () => {
    // Optimistic update
    setIsLiked(!isLiked);
    await onLike(prompt._id);
  };

  return (
    <div className="prompt-card">
      <div className="card-header">
        <Avatar user={prompt.author} />
        <div className="meta">
          <span className="author">{prompt.author.name}</span>
          <span className="date">{formatDate(prompt.createdAt)}</span>
        </div>
      </div>
      
      <h3 className="title">{prompt.title}</h3>
      <p className="content">{truncate(prompt.content, 200)}</p>
      
      <div className="tags">
        {prompt.tags?.map(tag => (
          <span key={tag} className="tag">{tag}</span>
        ))}
      </div>
      
      <div className="stats">
        <button onClick={handleLike} className={isLiked ? 'liked' : ''}>
          <HeartIcon /> {prompt.likes.length}
        </button>
        <button>
          <CommentIcon /> {prompt.commentCount || 0}
        </button>
        <button onClick={() => onBookmark(prompt._id)}>
          <BookmarkIcon />
        </button>
      </div>
    </div>
  );
};
```

**CommentThread.jsx** (Nested Comments)
```jsx
const CommentThread = ({ comments, promptId, onAddComment, onLike }) => {
  return (
    <div className="comment-thread">
      <CommentForm promptId={promptId} onSubmit={onAddComment} />
      
      {comments.map(comment => (
        <CommentItem 
          key={comment._id} 
          comment={comment} 
          onLike={onLike}
          onReply={onAddComment}
        />
      ))}
    </div>
  );
};

const CommentItem = ({ comment, onLike, onReply, depth = 0 }) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  
  return (
    <div className="comment-item" style={{ marginLeft: depth * 20 }}>
      <div className="comment-content">
        <Avatar user={comment.author} size="sm" />
        <div className="comment-body">
          <span className="author-name">{comment.author.name}</span>
          <p>{comment.content}</p>
          <div className="comment-actions">
            <button onClick={() => onLike(comment._id)}>
              Like ({comment.likes.length})
            </button>
            <button onClick={() => setShowReplyForm(!showReplyForm)}>
              Reply
            </button>
          </div>
        </div>
      </div>
      
      {comment.replies?.map(reply => (
        <CommentItem 
          key={reply._id} 
          comment={reply} 
          onLike={onLike}
          onReply={onReply}
          depth={depth + 1}
        />
      ))}
    </div>
  );
};
```

**AnalyticsPanel.jsx**
```jsx
const AnalyticsPanel = ({ promptId }) => {
  const { data, loading } = useAnalytics(promptId);
  
  if (loading) return <Skeleton />;
  
  return (
    <div className="analytics-panel">
      <div className="stats-grid">
        <StatsCard 
          label="Total Views" 
          value={data.summary.views} 
          trend={data.trend.views}
        />
        <StatsCard 
          label="Unique Views" 
          value={data.summary.uniqueViews}
          trend={data.trend.uniqueViews}
        />
        <StatsCard 
          label="Likes" 
          value={data.summary.likes}
          trend={data.trend.likes}
        />
        <StatsCard 
          label="Engagement Rate" 
          value={data.summary.engagementRate + '%'}
          trend={data.trend.engagement}
        />
      </div>
      
      <Chart 
        data={data.daily} 
        type="line"
        title="Performance Over Time"
      />
    </div>
  );
};
```

---

## 7. IMPLEMENTATION PLAN

### Phase 1: Backend Foundation (Week 1)
1. **Day 1-2**: Set up project structure
   - Create server directory
   - Install dependencies
   - Set up MongoDB connection
   
2. **Day 3-4**: Create schemas
   - User, Prompt, Comment models
   - Add indexes for performance
   
3. **Day 5-7**: Build core APIs
   - Auth routes (register, login, JWT)
   - CRUD for prompts
   - Basic error handling

### Phase 2: Core Features (Week 2)
1. **Day 8-10**: Community features
   - Like/unlike system
   - Comments with threading
   - Follow/unfollow users
   
2. **Day 11-12**: Trending engine
   - Implement ranking algorithm
   - Add trending endpoint
   - Create caching strategy

3. **Day 13-14**: Analytics
   - View tracking
   - Analytics schema
   - Dashboard API

### Phase 3: Collaboration (Week 3)
1. **Day 15-17**: Projects/Teams
   - Project model
   - Role-based access
   - Shared prompts

2. **Day 18-19**: Search
   - Full-text search
   - Filters (category, date, popularity)
   
3. **Day 20**: Polish & testing

### Phase 4: Frontend (Week 4-5)
1. **Day 21-25**: React setup
   - Initialize Vite + React
   - Set up Tailwind
   - Create component library

2. **Day 26-30**: Core pages
   - Login/Register
   - Dashboard
   - Prompt creation/detail

3. **Day 31-35**: Advanced features
   - Analytics dashboard
   - Projects page
   - Search UI

### Phase 5: Integration & Polish (Week 6)
1. **Day 36-40**: Connect frontend to backend
2. **Day 41-42**: Testing & bug fixes
3. **Day 43-44**: Performance optimization
4. **Day 45**: Deployment

---

## 8. ENVIRONMENT VARIABLES

```env
# Server
NODE_ENV=development
PORT=3000

# Database
MONGODB_URI=mongodb://localhost:27017/promptify

# JWT
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=7d

# External APIs
GROQ_API_KEY=your-groq-api-key

# Redis (Optional)
REDIS_URL=redis://localhost:6379

# Frontend (for CORS)
CLIENT_URL=http://localhost:5173
```

---

## 9. KEY TRADE-OFFS & DECISIONS

1. **EJS vs React**: Current project uses EJS. Migration to React recommended but requires significant effort. Can run both in parallel during transition.

2. **Embedded vs Referenced Comments**: Used reference model for nested comments to avoid document size limits. Better for deeply nested threads.

3. **Real-time**: WebSocket not implemented initially. Can add later using Socket.io for live notifications.

4. **Caching**: Redis optional for now. Can add when trending queries become slow.

5. **Search**: Using MongoDB text search for simplicity. Can upgrade to Elasticsearch/Algolia later for better performance.

6. **Analytics**: Daily aggregation prevents write amplification. Trade-off: less real-time accuracy but better performance.

---

This architecture provides a solid foundation for a production-grade prompt community platform while maintaining flexibility for future enhancements.