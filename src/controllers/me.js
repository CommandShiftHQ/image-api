const User = require('../models/user');
const Image = require('../models/image');
const ImageUtils = require('../lib/images');

exports.profile = async (req, res) => {
  const { authorizer: { username } } = req;
  const user = await User.findOne({ username })
    .populate('images')
    .select('-password')
    .exec();

  if (!user) {
    res.sendStatus(404);
  } else {
    const { id, __v, ...payload } = user.toObject({ virtuals: true });
    res.status(200).json(payload);
  }
};

exports.update = async (req, res) => {
  const {
    authorizer: { username },
    body,
    file,
  } = req;

  let avatar;

  const user = await User.findOne({ username });

  if (!user) {
    res.sendStatus(404);
  } else {
    if (file) {
      avatar = await ImageUtils.upload(file, username, 'avatar');
    }

    if (body.firstName) {
      user.set('firstName', body.firstName);
    }
    if (body.lastName) {
      user.set('lastName', body.lastName);
    }
    if (body.password) {
      user.set('password', body.password);
    }
    if (avatar) {
      user.set('avatar', avatar);
    }

    const updatedUser = await user.save();

    const {
      id, __v, password, ...payload
    } = updatedUser;

    res.status(200).json(payload);
  }
};

exports.delete = async (req, res) => {
  const { authorizer: { username } } = req;
  await Image.deleteMany({ user: username });
  await User.deleteOne({ username });
  res.sendStatus(204);
};
