const User = require('../models/user');
const ImageUtils = require('../lib/images');

exports.create = async (req, res) => {
  const { file, body } = req;

  const existing = await User.findOne({ email: body.email });

  if (existing) {
    res.status(400).json({ message: 'Email address is taken' });
  } else {
    let user;
    try {
      user = await new User({
        email: body.email,
        firstName: body.firstName,
        lastName: body.lastName,
        password: body.password,
      }).save();
    } catch (error) {
      console.error(error.stack); // eslint-disable-line no-console
      if (error.name === 'ValidationError') {
        return res.status(400).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Error creating user' });
    }

    if (file) {
      let avatar;
      try {
        avatar = await ImageUtils.upload(file, user.id, 'avatar');
        user.set('avatar', avatar);
        await user.save();
      } catch (error) {
        console.error(error.stack); // eslint-disable-line no-console
      }
    }

    const {
      email, password, access_token, ...payload // eslint-disable-line camelcase
    } = user.toObject();

    return res.status(201).json(payload);
  }
};

exports.find = async (req, res) => {
  const { params, authorizer } = req;
  const user = await User.findById(params.id)
    .populate('images')
    .select('-password -email -access_token')
    .exec();

  {
    const { id, __v, ...payload } = user.toObject({ virtuals: true });

    res.status(200).json({
      ...payload,
      images: user.images.map((image) => {
        const {
          id, __v, likedBy, ...img // eslint-disable-line no-shadow
        } = image.toObject({ virtuals: true });

        return {
          ...img,
          isLiked: authorizer.id ? image.isLikedBy(authorizer.id) : false,
        };
      }),
    });
  }
};
