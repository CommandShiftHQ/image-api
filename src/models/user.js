const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required.'],
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required.'],
  },
  username: {
    type: String,
    required: [true, 'Username is required.'],
    match: [
      /^[a-zA-Z\d]{3,16}$/,
      'Username must be between 3 and 16 characters and contain letters and numbers only.',
    ],
    index: { unique: true, sparse: true },
  },
  password: {
    type: String,
    required: [true, 'Password is required.'],
    match: [
      /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/,
      'Password must be at least 8 characters long and contain at least 1 upper case character, 1 lower case character and 1 number.',
    ],
    set: password => bcrypt.hashSync(password, 10),
  },
  avatar: {
    type: String,
    default: `https://s3-eu-west-1.amazonaws.com/${process.env.S3_BUCKET_NAME}/avatar.jpeg`,
  },
}, {
  autoIndex: false,
});

userSchema.virtual('images', {
  ref: 'Image',
  localField: 'username',
  foreignField: 'user',
});

userSchema.methods.validatePassword = function validatePassword(password) {
  return bcrypt.compareSync(password, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
