const jwt = require('jsonwebtoken');

exports.authenticate = (req, res, next) => {
  const token = req.get('Authorization');

  console.log('token', token);

  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, (error, authorizer) => {
      console.error('verify error', error);
      if (error) {
        res.status(401).json({ message: 'Unable to authenticate token' });
      } else {
        console.error('request authorizer', authorizer);
        req.authorizer = { id: authorizer._id };
        next();
      }
    });
  } else {
    console.log('no token');

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
