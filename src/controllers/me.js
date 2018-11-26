const User = require('../models/user');
const Image = require('../models/image');
const ImageUtils = require('../lib/images');

exports.profile = async (req, res) => {
  const { authorizer } = req;
  const user = await User.findById(authorizer.id)
    .populate('images')
    .select('-password -access_token')
    .exec();

  if (!user) {
    res.sendStatus(404);
  } else {
    {
      const { id, __v, ...payload } = user.toObject({
        virtuals: true,
      });
      res.status(200).json(payload);
    }
  }
};

exports.update = async (req, res) => {
  const {
    authorizer,
    body,
    file,
  } = req;

  const user = await User.findById(authorizer.id);

  if (!user) {
    res.sendStatus(404);
  } else {
    if (body.firstName) {
      user.set('firstName', body.firstName);
    }
    if (body.lastName) {
      user.set('lastName', body.lastName);
    }
    if (body.bio) {
      user.set('bio', body.bio);
    }
    if (body.password) {
      user.set('password', body.password);
    }

    if (file) {
      let avatar;
      try {
        avatar = await ImageUtils.upload(file, authorizer.id, 'avatar');
        user.set('avatar', avatar);
      } catch (error) {
        console.error(error.stack); // eslint-disable-line no-console
      }
    }

    let updatedUser;
    try {
      updatedUser = await user.save();
    } catch (error) {
      console.error(error.stack); // eslint-disable-line no-console
      if (error.name === 'ValidationError') {
        return res.status(400).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Error updating user' });
    }

    const {
      id, __v, password, access_token, ...payload // eslint-disable-line camelcase
    } = updatedUser;

    res.status(200).json(payload);
  }
};

exports.delete = async (req, res) => {
  const { authorizer: { id } } = req;
  await Image.deleteMany({ user: id });
  await User.findByIdAndDelete(id);
  res.sendStatus(204);
};
