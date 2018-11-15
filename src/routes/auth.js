const express = require('express');
const AuthController = require('../controllers/auth');

const router = express.Router();

router.post('/login', AuthController.login);

// TODO: google oauth

module.exports = router;
