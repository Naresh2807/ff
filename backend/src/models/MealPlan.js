import mongoose from 'mongoose';

const mealPlanSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  day: {
    type: String,
    required: [true, 'Day is required'],
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  },
  breakfast: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recipe'
  },
  lunch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recipe'
  },
  dinner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recipe'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Ensure unique meal plan per user per day
mealPlanSchema.index({ user: 1, day: 1 }, { unique: true });

const MealPlan = mongoose.model('MealPlan', mealPlanSchema);
export default MealPlan;