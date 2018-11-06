const express = require('express');
const UsersController = require('../controllers/users');

const router = express.Router();

router.route('/')
  .post(UsersController.create);

module.exports = router;
