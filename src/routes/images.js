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
  .patch(authenticate, ImageController.update)
  .delete(authenticate, ImageController.delete);

module.exports = router;
