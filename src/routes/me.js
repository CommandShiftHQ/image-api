const express = require('express');
const MeController = require('../controllers/me');

const router = express.Router();

router.route('/')
  .get(MeController.profile)
  .patch(MeController.update)
  .delete(MeController.delete);

module.exports = router;
