const User = require('../models/user');
const Image = require('../models/image');

exports.profile = async (req, res) => {
  try {
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
  } catch (error) {
    res.sendStatus(500);
  }
};

exports.update = async (req, res) => {
  try {
    const {
      authorizer: { username },
      body,
    } = req;

    const user = await User.findOne({ username });

    if (body.firstName) {
      user.set('firstName', body.firstName);
    }
    if (body.lastName) {
      user.set('lastName', body.lastName);
    }
    if (body.password) {
      user.set('password', body.password);
    }

    const updatedUser = await user.save();

    const { password, ...payload } = updatedUser;

    res.status(200).json(payload);
  } catch (error) {
    res.sendStatus(500);
  }
};

exports.delete = async (req, res) => {
  try {
    const { authorizer: { username } } = req;
    await Image.deleteMany({ user: username });
    await User.deleteOne({ username });
    res.sendStatus(204);
  } catch (error) {
    res.sendStatus(500);
  }
};
