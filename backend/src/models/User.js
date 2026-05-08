const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, select: false },
}, { timestamps: true });

userSchema.methods.comparePassword = async function(candidate) {
  const bcrypt = require('bcryptjs');
  return await bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('User', userSchema);