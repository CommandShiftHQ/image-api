const express = require('express');
const multer = require('multer');
const checkMimetype = require('../middleware/check-mimetype');
const { getAuthorizer } = require('../middleware/authenticate');
const UsersController = require('../controllers/users');

const router = express.Router();

router.route('/')
  .post(multer().single('avatar'), checkMimetype, UsersController.create);

router.route('/:id')
  .get(getAuthorizer, UsersController.find);

module.exports = router;
