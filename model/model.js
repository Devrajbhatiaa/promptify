const mongoose = require('mongoose');

const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/promptify';

mongoose.connect(mongoUri)
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.error('MongoDB connection failed:', err.message));

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  name: String,
  username: String,
  age: Number,
  post:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:"post"
  }]
})

module.exports = mongoose.model('user', userSchema);