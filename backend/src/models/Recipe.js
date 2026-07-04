import mongoose from 'mongoose';

const ingredientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Ingredient name is required']
  },
  amount: {
    type: String,
    required: [true, 'Amount is required']
  }
});

const stepSchema = new mongoose.Schema({
  description: {
    type: String,
    required: [true, 'Step description is required']
  },
  order: {
    type: Number,
    required: true
  }
});

const commentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: [true, 'Comment text is required'],
    maxlength: [1000, 'Comment cannot exceed 1000 characters']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const ratingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  value: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  }
});

const recipeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  cuisine: {
    type: String,
    required: [true, 'Cuisine type is required'],
    enum: ['Italian', 'Chinese', 'Indian', 'Mexican', 'Japanese', 'Thai', 'French', 'Spanish', 'Greek', 'American', 'Mediterranean', 'Middle Eastern', 'African', 'Korean', 'Vietnamese', 'Other']
  },
  mealType: {
    type: String,
    required: [true, 'Meal type is required'],
    enum: ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert', 'Drink']
  },
  dietaryPreference: {
    type: [String],
    enum: ['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Keto', 'Paleo', 'Low-Carb', 'High-Protein', 'None']
  },
  ingredients: [ingredientSchema],
  steps: [stepSchema],
  prepTime: {
    type: Number,
    required: [true, 'Prep time is required'],
    min: [1, 'Prep time must be at least 1 minute']
  },
  cookTime: {
    type: Number,
    required: [true, 'Cook time is required'],
    min: [0, 'Cook time cannot be negative']
  },
  servings: {
    type: Number,
    required: [true, 'Servings is required'],
    min: [1, 'Servings must be at least 1']
  },
  image: {
    type: String,
    default: ''
  },
  video: {
    type: String,
    default: ''
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  ratings: [ratingSchema],
  comments: [commentSchema],
  averageRating: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Calculate average rating before saving
recipeSchema.pre('save', function(next) {
  if (this.ratings.length > 0) {
    const sum = this.ratings.reduce((acc, r) => acc + r.value, 0);
    this.averageRating = +(sum / this.ratings.length).toFixed(1);
  } else {
    this.averageRating = 0;
  }
  next();
});

const Recipe = mongoose.model('Recipe', recipeSchema);
export default Recipe;