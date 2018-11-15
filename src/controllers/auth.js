const jwt = require('jsonwebtoken');
const User = require('../models/user');

const login = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    if (!user) {
      res.status(401).json({
        message: 'User not found.',
      });
    } else if (user.validatePassword(req.body.password)) {
      const payload = {
        username: user.username,
      };

      jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1w' }, (err, token) => {
        if (err) {
          res.sendStatus(500);
        } else {
          res.status(200).json({ token });
        }
      });
    } else {
      res.status(401).json({
        message: 'The email/password combination is incorrect.',
      });
    }
  } catch (error) {
    res.sendStatus(500);
  }
};

module.exports = {
  login,
};
