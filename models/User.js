const mongoose = require('mongoose');
const { Schema } = mongoose;
const bcrypt = require('bcrypt');
    
const schemaOptions = {
  timestamps: { 
    createdAt: 'created_at', 
    updatedAt: 'updated_at' 
  },
};

const UserSchema = new Schema(
  {
  username: {
    type: String,
    required: true,
    index: { unique: true }
  },
  password: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  }
},
  schemaOptions
);

// use mongoose's middleware to hash password before save
UserSchema.pre('save', async (next) => {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(this.password, salt);
    this.password = hashedPassword;
    next();
  } catch (error) {
    next(error);
  }
});

UserSchema.methods.comparePassword = (password, callback) => {
  bcrypt.compare(password, this.password, (err, isMatch) => {
    if (err) return callback(err);
    callback(null, isMatch);
  });
}

module.exports = mongoose.model('User', UserSchema);