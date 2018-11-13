const User = require('../models/user');

exports.create = async (req, res) => {
  try {
    const user = await new User({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      username: req.body.username,
      password: req.body.password,
    }).save();

    const { password, ...payload } = user.toObject();

    res.status(201).json(payload);
  } catch (error) {
    res.sendStatus(500);
  }
};

exports.find = async (req, res) => {
  try {
    const { params: { username } } = req;
    const user = await User.findOne({ username })
      .populate('images')
      .select('-password')
      .exec();

    const payload = user.toObject({ virtuals: true });

    res.json(payload);
  } catch (error) {
    res.sendStatus(500);
  }
};
