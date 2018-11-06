const express = require('express');
const multer = require('multer');
const checkMimetype = require('../middleware/check-mimetype');
const authenticate = require('../middleware/authenticate');
const ImageController = require('../controllers/images');

const router = express.Router();

router.route('/')
  .post(authenticate, multer().single('image'), checkMimetype, ImageController.create);

module.exports = router;
