const express = require('express');
const multer = require('multer');
const checkMimetype = require('../middleware/check-mimetype');
const { authenticate, getAuthorizer } = require('../middleware/authenticate');
const ImageController = require('../controllers/images');
const CommentController = require('../controllers/comments');
const LikeController = require('../controllers/likes');

const router = express.Router();

const log = i => (req, res, next) => {
  console.log(i, 'here!!!!');
  next();
};

router.route('/')
  .get(getAuthorizer, ImageController.index)
  .post(log(1), authenticate, log(2), multer().single('image'), log(3), checkMimetype, log(4), ImageController.create);

router.route('/:id')
  .get(getAuthorizer, ImageController.find)
  .patch(authenticate, ImageController.update)
  .delete(authenticate, ImageController.delete);

router.route('/:id/comments')
  .post(authenticate, CommentController.create);

router.route('/:id/comments/:commentId')
  .delete(authenticate, CommentController.delete);

router.route('/:id/likes')
  .patch(authenticate, LikeController.toggle);

module.exports = router;
