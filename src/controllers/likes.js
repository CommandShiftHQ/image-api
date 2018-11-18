const Image = require('../models/image');

exports.toggle = async (req, res) => {
  const { authorizer, params } = req;

  const image = await Image.findById(params.id);

  if (!image) {
    res.sendStatus(404);
  } else {
    if (image.isLikedBy(authorizer.id)) {
      image.unlike(authorizer.id);
    } else {
      image.like(authorizer.id);
    }

    await image.save();

    {
      const {
        id, __v, likedBy, comments, ...payload
      } = image.toObject({ virtuals: true });

      res.status(200).json({
        ...payload,
        isLiked: image.isLikedBy(authorizer.id),
        comments: comments.map(({ id, ...comment }) => comment), // eslint-disable-line no-shadow
      });
    }
  }
};
