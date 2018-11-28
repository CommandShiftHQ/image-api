const moment = require('moment');
const Image = require('../models/image');
const User = require('../models/user');

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

exports.create = async (req, res) => {
  const {
    authorizer,
    params,
    body: { content },
  } = req;

  if (!content) {
    return res.status(400).json({ message: 'Content is required.' });
  }

  const image = await Image.findById(params.id);

  const user = await User.findById(authorizer.id);

  if (!image) {
    return res.sendStatus(404);
  }

  const comment = image.comments.create({
    content,
    author: authorizer.id,
    timestamp: moment.utc().valueOf(),
  });

  image.comments.addToSet(comment);

  await image.save();

  return res.status(201).json({
    ...comment.toObject(),
    author: safeUser(user.toObject()),
  });
};

exports.delete = async (req, res) => {
  const {
    authorizer,
    params,
  } = req;

  const image = await Image.findById(params.id);

  if (!image) {
    return res.sendStatus(404);
  }

  const comment = image.comments.id(params.commentId);

  if (!comment) {
    return res.sendStatus(404);
  }
  if (comment.author !== authorizer.id) {
    return res.sendStatus(403);
  }

  comment.remove();
  await image.save();
  return res.sendStatus(204);
};
