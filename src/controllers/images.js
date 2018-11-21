const moment = require('moment');
const Image = require('../models/image');
const ImageUtils = require('../lib/images');

exports.index = async (req, res) => {
  const { authorizer, query } = req;

  let tags = null;
  if (query.tags) {
    tags = [].concat(query.tags);
  }

  let images;
  if (tags) {
    images = await Image.findByTags(tags);
  } else {
    images = await Image.find({});
  }

  const payload = images.map(image => {
    const {
      id, __v, likedBy, comments, ...img
    } = image.toObject({ virtuals: true });
    return {
      ...img,
      comments: comments.map(({ id, ...comment }) => comment), // eslint-disable-line no-shadow
      isLiked: authorizer.id ? image.isLikedBy(authorizer.id) : false,
    };
  });

  res.status(200).json(payload);
};

exports.find = async (req, res) => {
  const {
    authorizer,
    params,
  } = req;

  const image = await Image.findById(params.id);

  if (!image) {
    res.sendStatus(404);
  } else {
    const {
      id, __v, likedBy, comments, ...payload // eslint-disable-line no-shadow
    } = image.toObject({ virtuals: true });

    res.status(200).json({
      ...payload,
      comments: comments.map(({ id, ...comment }) => comment), // eslint-disable-line no-shadow
      isLiked: authorizer.id ? image.isLikedBy(authorizer.id) : false,
    });
  }
};

exports.create = async (req, res) => {
  const {
    file,
    authorizer,
    body: { caption, tags },
  } = req;

  console.log(file);

  const [src, thumb] = await Promise.all([
    ImageUtils.upload(file, authorizer.id, 'main'),
    ImageUtils.upload(file, authorizer.id, 'thumbnail'),
  ]);

  const image = await new Image({
    src,
    thumb,
    caption,
    tags,
    user: authorizer.id,
    timestamp: moment.utc().valueOf(),
  }).save();

  const {
    id, __v, likedBy, ...payload
  } = image.toObject({ virtuals: true });

  payload.isLiked = image.isLikedBy(authorizer.id);

  res.status(201).json(payload);
};

exports.update = async (req, res) => {
  const {
    authorizer,
    body: { caption, tags },
    params,
  } = req;

  const image = await Image.findById(params.id);

  if (!image) {
    res.sendStatus(404);
  } else if (image.user !== authorizer.id) {
    res.sendStatus(403);
  } else {
    if (caption) {
      image.set('caption', caption);
    }
    if (tags) {
      image.set('tags', tags);
    }

    await image.save();

    {
      const {
        id, __v, likedBy, comments, ...payload // eslint-disable-line no-shadow
      } = image.toObject({ virtuals: true });

      res.status(200).json({
        ...payload,
        isLiked: image.isLikedBy(authorizer.id),
        comments: comments.map(({ id, ...comment }) => comment), // eslint-disable-line no-shadow
      });
    }
  }
};

exports.delete = async (req, res) => {
  const {
    authorizer,
    params,
  } = req;

  const image = await Image.findById(params.id);

  if (!image) {
    res.sendStatus(404);
  } else if (image.user !== authorizer.id) {
    res.sendStatus(403);
  } else {
    await image.remove();
    res.sendStatus(204);
  }
};
