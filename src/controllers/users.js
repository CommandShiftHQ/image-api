const User = require('../models/user');
const ImageUtils = require('../lib/images');

exports.create = async (req, res) => {
  try {
    const { file, body } = req;

    let avatar;

    if (file) {
      avatar = await ImageUtils.upload(file, body.username, 'avatar');
    }

    const user = await new User({
      avatar,
      firstName: body.firstName,
      lastName: body.lastName,
      username: body.username,
      password: body.password,
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

    const { id, __v, ...payload } = user.toObject({ virtuals: true });

    res.status(200).json({
      ...payload,
      images: user.images.map((image) => {
        const {
          id, __v, likedBy, ...img // eslint-disable-line no-shadow
        } = image.toObject({ virtuals: true });

        return {
          ...img,
          isLiked: req.authorizer.username ? image.isLikedBy(req.authorizer.username) : false,
        };
      }),
    });
  } catch (error) {
    res.sendStatus(500);
  }
};
