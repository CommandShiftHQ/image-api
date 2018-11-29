const moment = require('moment');
const Image = require('../models/image');
const User = require('../models/user');
const ImageUtils = require('../lib/images');

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

exports.index = async (req, res) => {
  const { authorizer, query } = req;

  let tags = null;
  if (query.tags) {
    tags = [].concat(query.tags);
  }

  let images;
  if (tags) {
    images = await Image.findByTags(tags).populate('user, comments.author').exec();
  } else {
    images = await Image.find({}).populate('user comments.author').exec();
  }

  const payload = images.map(image => {
    const {
      id, __v, likedBy, comments, user, ...img
    } = image.toObject({ virtuals: true });
    return {
      ...img,
      user: safeUser(user),
      comments: comments.map(({ id, author, ...comment }) => ({ // eslint-disable-line no-shadow
        ...comment,
        author: safeUser(author),
      })),
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

  const image = await Image.findById(params.id).populate('user comments.author').exec();

  if (!image) {
    res.sendStatus(404);
  } else {
    const {
      id, __v, likedBy, comments, user, ...payload // eslint-disable-line no-shadow
    } = image.toObject({ virtuals: true });

    res.status(200).json({
      ...payload,
      user: safeUser(user),
      comments: comments.map(({ id, author, ...comment }) => ({ // eslint-disable-line no-shadow
        ...comment,
        author: safeUser(author),
      })),
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


  if (!file) {
    return res.status(400).json({ message: 'Image file is required' });
  }

  if (!caption) {
    return res.status(400).json({ message: 'Caption is required' });
  }

  let src, thumb;

  try {
    [src, thumb] = await Promise.all([
      ImageUtils.upload(file, authorizer.id, 'main'),
      ImageUtils.upload(file, authorizer.id, 'thumbnail'),
    ]);
  } catch (error) {
    console.error(error.stack); // eslint-disable-line no-console
    return res.status(500).json({ message: 'Error uploading image' });
  }

  let image;

  try {
    image = await new Image({
      src,
      thumb,
      caption,
      tags,
      user: authorizer.id,
      timestamp: moment.utc().valueOf(),
    }).save();
  } catch (error) {
    console.error(error.stack); // eslint-disable-line no-console
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Error uploading image' });
  }

  let user;
  try {
    user = await User.findById(authorizer.id);
  } catch (error) {
    console.error(error.stack); // eslint-disable-line no-console
    return res.status(500).json({ message: 'Image saved - error formatting image json.' });
  }

  const {
    id, __v, likedBy, ...payload
  } = image.toObject({ virtuals: true });

  return res.status(201).json({
    ...payload,
    user: safeUser(user),
    isLiked: image.isLikedBy(authorizer.id),
  });
};

exports.update = async (req, res) => {
  const {
    authorizer,
    body: { caption, tags },
    params,
  } = req;

  const image = await Image.findById(params.id).populate('user comments.author').exec();

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
        id, __v, likedBy, comments, user, ...payload // eslint-disable-line no-shadow
      } = image.toObject({ virtuals: true });

      res.status(200).json({
        ...payload,
        user: safeUser(user),
        isLiked: image.isLikedBy(authorizer.id),
        comments: comments.map(({ id, author, ...comment }) => ({ // eslint-disable-line no-shadow
          ...comment,
          author: safeUser(author),
        })),
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
  } else if (!image.user.equals(authorizer.id)) {
    res.sendStatus(403);
  } else {
    await image.remove();
    res.sendStatus(204);
  }
};
