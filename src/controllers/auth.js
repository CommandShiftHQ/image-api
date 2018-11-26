const jwt = require('jsonwebtoken');
const decode = require('jwt-decode');
const request = require('request-promise');
const User = require('../models/user');

const createToken = (user, expiresIn = '1d') => new Promise((resolve, reject) => {
  const payload = {
    _id: user._id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    avatar: user.avatar,
    bio: user.bio,
  };

  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn }, (err, token) => {
    if (err) {
      reject(err);
    } else {
      resolve(token);
    }
  });
});

exports.login = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (user && user.validatePassword(req.body.password)) {
    const token = await createToken(user);
    res.status(200).json({ token });
  } else {
    res.status(401).json({
      message: 'The email/password combination is incorrect.',
    });
  }
};

exports.google = async (req, res) => {
  const response = await request.post('https://www.googleapis.com/oauth2/v4/token', {
    body: {
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      code: req.body.code,
      grant_type: 'authorization_code',
      redirect_uri: 'http://localhost:8080/google-auth',
    },
    json: true,
  });

  const { access_token, id_token, expires_in } = response; // eslint-disable-line camelcase
  const {
    email, picture, name, givenName, familyName,
  } = decode(id_token);

  if (!email) {
    res.status(400).json({
      message: 'Unable to retrieve email address from Google.',
    });
  } else {
    const user = await User.findOneOrCreate({ email }, {
      email,
      firstName: givenName || (name && name.substr(0, name.indexOf(' '))) || '',
      lastName: familyName || (name && name.substr(name.indexOf(' ') + 1)) || '',
      avatar: picture,
      access_token,
    });

    if (!user.access_token) {
      user.set({ access_token });
    }

    await user.save();

    const token = await createToken(user, expires_in);

    res.status(200).json({ token });
  }
};
