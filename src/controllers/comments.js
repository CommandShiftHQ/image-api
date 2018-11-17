const moment = require('moment');
const Image = require('../models/image');

exports.create = async (req, res) => {
  const {
    authorizer: { username },
    params: { id },
    body: { content },
  } = req;

  const image = await Image.findById(id);

  if (!image) {
    res.sendStatus(404);
  } else {
    const comment = image.comments.create({
      content,
      author: username,
      timestamp: moment.utc().valueOf(),
    });

    image.comments.addToSet(comment);

    await image.save();

    res.status(201).json(comment.toObject());
  }
};

exports.delete = async (req, res) =>{
  const {
    authorizer: { username },
    params: { id, commentId },
  } = req;

  const image = await Image.findById(id);

  if (!image) {
    res.sendStatus(404);
  } else {
    const comment = image.comments.id(commentId);

    if (!comment) {
      res.sendStatus(404);
    } else if (comment.author !== username) {
      res.sendStatus(403);
    } else {
      comment.remove();
      await image.save();
      res.sendStatus(204);
    }
  }
};
