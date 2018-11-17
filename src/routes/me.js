const express = require('express');
const multer = require('multer');
const checkMimetype = require('../middleware/check-mimetype');
const MeController = require('../controllers/me');

const router = express.Router();

router.route('/')
  .get(MeController.profile)
  .patch(multer().single('avatar'), checkMimetype, MeController.update)
  .delete(MeController.delete);

module.exports = router;
