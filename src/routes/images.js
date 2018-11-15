const express = require('express');
const multer = require('multer');
const checkMimetype = require('../middleware/check-mimetype');
const { authenticate, getAuthorizer } = require('../middleware/authenticate');
const ImageController = require('../controllers/images');

const router = express.Router();

router.route('/')
  .get(getAuthorizer, ImageController.index)
  .post(authenticate, multer().single('image'), checkMimetype, ImageController.create);

router.route('/:id')
  // TODO: GET by id - with getAuthorizer
  .patch(authenticate, ImageController.update)
  .delete(authenticate, ImageController.delete);

// TODO: add comments controller
// TODO: add likes / dislikes

module.exports = router;
