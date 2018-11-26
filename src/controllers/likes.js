const Image = require('../models/image');

const safeUser = (user) => {
  const {
    email,
    password,
    access_token, // eslint-disable-line camelcase
    id,
    __v,
    images,
    ...safe
  } = user;

  return safe;
};

exports.toggle = async (req, res) => {
  const { authorizer, params } = req;

  const image = await Image.findById(params.id)
    .populate('user comments.author')
    .exec();

  if (!image) {
    return res.sendStatus(404);
  }

  if (image.isLikedBy(authorizer.id)) {
    image.unlike(authorizer.id);
  } else {
    image.like(authorizer.id);
  }

  await image.save();

  const {
    id, __v, likedBy, user, comments, ...payload
  } = image.toObject({ virtuals: true });

  return res.status(200).json({
    ...payload,
    user: safeUser(user),
    isLiked: image.isLikedBy(authorizer.id),
    comments: comments.map(({ id, author, ...comment }) => ({ // eslint-disable-line no-shadow
      ...comment,
      author: safeUser(author),
    })),
  });
};
