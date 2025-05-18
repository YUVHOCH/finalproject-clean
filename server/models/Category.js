const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  categoryId: {
    type: Number,
    required: true,
    unique: true,
  },
  categoryName: {
    type: String,
    required: true,
  },
  categoryLevel: {
    type: Number,
    required: true,
    enum: [1, 2, 3],
  },
  parentId: {
    type: Number,
    default: null,
  },
  position: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  slug: {
    type: String,
    default: function() {
      return this.categoryName?.replace(/\s+/g, '-') || '';
    }
  },
  description: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// אינדקסים
categorySchema.index({ categoryId: 1 }, { unique: true });
categorySchema.index({ parentId: 1 });
categorySchema.index({ slug: 1 });
categorySchema.index({ categoryName: 1 });

// וידוא שיש slug לפני שמירה
categorySchema.pre('save', function(next) {
  if (!this.slug && this.categoryName) {
    this.slug = this.categoryName.replace(/\s+/g, '-');
  }
  next();
});

module.exports = mongoose.model("Category", categorySchema); 