const express = require('express');
const multer = require('multer');
const checkMimetype = require('../middleware/check-mimetype');
const { authenticate, getAuthorizer } = require('../middleware/authenticate');
const ImageController = require('../controllers/images');
const CommentController = require('../controllers/comments');

const router = express.Router();

router.route('/')
  .get(getAuthorizer, ImageController.index)
  .post(authenticate, multer().single('image'), checkMimetype, ImageController.create);

router.route('/:id')
  .get(getAuthorizer, ImageController.find)
  .patch(authenticate, ImageController.update)
  .delete(authenticate, ImageController.delete);

router.route('/:id/comments')
  .post(authenticate, CommentController.create);

router.route('/:id/comments/:commentId')
  .delete(authenticate, CommentController.delete);

// TODO: add likes / dislikes

module.exports = router;
