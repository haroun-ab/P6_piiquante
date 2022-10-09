const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const errorValidator = require('mongoose-mongodb-errors');
const userSchema = mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

userSchema.plugin(uniqueValidator);
userSchema.plugin(errorValidator);

module.exports = mongoose.model('User', userSchema);
