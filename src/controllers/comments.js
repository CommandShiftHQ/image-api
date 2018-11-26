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

  const image = await Image.findById(params.id);

  const user = await User.findById(authorizer.id);

  if (!image) {
    res.sendStatus(404);
  } else {
    const comment = image.comments.create({
      content,
      author: authorizer.id,
      timestamp: moment.utc().valueOf(),
    });

    image.comments.addToSet(comment);

    await image.save();

    res.status(201).json({
      ...comment.toObject(),
      author: safeUser(user.toObject()),
    });
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
  } else {
    const comment = image.comments.id(params.commentId);

    if (!comment) {
      res.sendStatus(404);
    } else if (comment.author !== authorizer.id) {
      res.sendStatus(403);
    } else {
      comment.remove();
      await image.save();
      res.sendStatus(204);
    }
  }
};
