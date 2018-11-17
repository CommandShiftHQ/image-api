const Image = require('../models/image');

exports.toggle = async (req, res) => {
  const {
    authorizer: { username },
    params: { id },
  } = req;

  const image = await Image.findById(id);

  if (!image) {
    res.sendStatus(404);
  } else {
    if (image.isLikedBy(username)) {
      image.unlike(username);
    } else {
      image.like(username);
    }

    await image.save();

    {
      const {
        id, __v, likedBy, comments, ...payload // eslint-disable-line no-shadow
      } = image.toObject({ virtuals: true });

      res.status(200).json({
        ...payload,
        isLiked: image.isLikedBy(username),
        comments: comments.map(({ id, ...comment }) => comment), // eslint-disable-line no-shadow
      });
    }
  }
};
