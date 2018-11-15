const moment = require('moment');
const Image = require('../models/image');
const ImageUtils = require('../lib/images');

exports.index = async (req, res) => {
  const { username } = req.authorizer;

  let tags = null;
  if (req.query.tags) {
    tags = [].concat(req.query.tags);
  }

  let images;
  if (tags) {
    images = await Image.findByTags(tags);
  } else {
    images = await Image.find({});
  }

  const payload = images.map(image => {
    const {
      id, __v, likedBy, ...img
    } = image.toObject({ virtuals: true });
    return {
      ...img,
      isLiked: username ? image.isLikedBy(username) : false,
    };
  });

  res.status(200).json(payload);
};

exports.create = async (req, res) => {
  const {
    file,
    body: { caption, tags },
    authorizer: { username },
  } = req;

  const [src, thumb] = await Promise.all([
    ImageUtils.upload(file, username, 'main'),
    ImageUtils.upload(file, username, 'thumbnail'),
  ]);

  const image = await new Image({
    src,
    thumb,
    caption,
    tags,
    user: username,
    timestamp: moment.utc().valueOf(),
  }).save();

  const {
    id, __v, likedBy, ...payload
  } = image.toObject({ virtuals: true });

  payload.isLiked = image.isLikedBy(username);

  res.status(201).json(payload);
};

exports.update = async (req, res) => {
  const {
    authorizer: { username },
    body: { caption, tags },
    params: { id },
  } = req;

  const image = await Image.findById(id);

  if (!image) {
    res.sendStatus(404);
  } else if (image.user !== username) {
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
        id, __v, likedBy, ...payload // eslint-disable-line no-shadow
      } = image.toObject({ virtuals: true });

      payload.isLiked = image.isLikedBy(username);

      res.status(200).json(payload);
    }
  }
};

exports.delete = async (req, res) => {
  const {
    authorizer: { username },
    params: { id },
  } = req;

  const image = await Image.findById(id);

  if (!image) {
    res.sendStatus(404);
  } else if (image.user !== username) {
    res.sendStatus(403);
  } else {
    await image.remove();
    res.sendStatus(204);
  }
};
