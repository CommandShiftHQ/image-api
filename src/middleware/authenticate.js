const jwt = require('jsonwebtoken');

exports.authenticate = (req, res, next) => {
  const token = req.get('Authorization');

  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, (error, authorizer) => {
      if (error) {
        res.status(401).json({ message: 'Unable to authenticate token' });
      } else {
        req.authorizer = { id: authorizer._id };
        next();
      }
    });
  } else {
    res.status(401).json({ message: 'No token provided' });
  }
};

exports.getAuthorizer = (req, res, next) => {
  const token = req.get('Authorization');

  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, (error, authorizer) => {
      if (error) {
        req.authorizer = { id: null };
      } else {
        req.authorizer = { id: authorizer._id };
      }
    });
  } else {
    req.authorizer = { id: null };
  }
  next();
};
