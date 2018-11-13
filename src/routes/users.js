const express = require('express');
const UsersController = require('../controllers/users');

const router = express.Router();

router.route('/')
  .post(UsersController.create);

router.route('/:username')
  .get(UsersController.find);

module.exports = router;
