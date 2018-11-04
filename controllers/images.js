const Images = require('../lib/images');

exports.create = (req, res) => {
  const { file } = req;
  Promise.all([
    Images.createMain(file),
    Images.createThumbnail(file),
  ])
    .then(() => {
      res.sendStatus(201);
    })
    .catch(() => {
      res.sendStatus(500);
    });
};
