const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
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
      enum: ['writing', 'coding', 'design', 'marketing', 'education', 'general', 'other'],
      default: 'general'
    },
    tags: [String],
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true
    },
    community: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Community'
    },
    likes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user'
    }],
    views: {
      type: Number,
      default: 0
    },
    isPublic: {
      type: Boolean,
      default: true
    },
    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ community: 1, createdAt: -1 });
postSchema.index({ createdAt: -1 });
postSchema.index({ isPublic: 1, createdAt: -1 });
postSchema.index({ title: 'text', content: 'text' });

postSchema.virtual('likeCount').get(function() {
  return this.likes ? this.likes.length : 0;
});

postSchema.virtual('commentCount', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'post',
  count: true
});

postSchema.set('toJSON', { virtuals: true });
postSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model("post", postSchema)