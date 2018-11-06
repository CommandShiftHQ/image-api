const Images = require('../lib/images');

exports.create = (req, res) => {
  const { file } = req;
  Promise.all([
    Images.upload(file, 'main'),
    Images.upload(file, 'thumbnail'),
  ])
    .then(([main, thumbnail]) => {
      res.status(201).json({
        main,
        thumbnail,
      });
    })
    .catch(() => {
      res.sendStatus(500);
    });
};
