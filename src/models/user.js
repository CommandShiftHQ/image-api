const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const isEmail = require('isemail');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required.'],
    minlength: [1, 'First name is required.'],
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required.'],
    minlength: [1, 'Last name is required.'],
  },
  email: {
    type: String,
    required: [true, 'Email is required.'],
    validate: {
      validator: email => isEmail.validate(email),
      message: 'Invalid email address',
    },
    index: { unique: true, sparse: true },
  },
  password: {
    type: String,
    required: [function isPasswordRequired() {
      return !this.access_token;
    }, 'Password is required.'],
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
  access_token: String,
}, {
  autoIndex: false,
});

userSchema.virtual('images', {
  ref: 'Image',
  localField: '_id',
  foreignField: 'user',
});

userSchema.methods.validatePassword = function validatePassword(password) {
  return bcrypt.compareSync(password, this.password);
};

userSchema.statics.findOneOrCreate = function findOneOrCreate(key, data) {
  return this.findOne(key).then((user) => {
    if (user) {
      return user;
    }
    return this.create(data).then((newUser) => {
      return newUser;
    });
  });
};

const User = mongoose.model('User', userSchema);

module.exports = User;
