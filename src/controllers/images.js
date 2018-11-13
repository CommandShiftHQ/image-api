const Image = require('../models/image');
const Images = require('../lib/images');

exports.index = async (req, res) => {
  try {
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

    const payload = images.map(image => image.toObject());

    res.status(200).json(payload);
  } catch (error) {
    res.sendStatus(500);
  }
};

exports.create = async (req, res) => {
  try {
    const {
      file,
      body: { caption, tags },
      authorizer: { username },
    } = req;

    const [src, thumb] = await Promise.all([
      Images.upload(file, 'main'),
      Images.upload(file, 'thumbnail'),
    ]);

    const image = await new Image({
      user: username,
      src,
      thumb,
      caption,
      tags,
    }).save();

    const { likedBy, ...payload } = image.toObject();

    payload.likes = image.likes;
    payload.liked = image.isLikedBy(username);

    res.status(201).json(payload);
  } catch (error) {
    res.sendStatus(500);
  }
};
