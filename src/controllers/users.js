const User = require('../models/user');

const create = (req, res) => {
  const user = new User({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: req.body.password,
  });

  user.save()
    .then((data) => {
      res.status(201).json(data);
    })
    .catch(() => {
      res.sendStatus(500);
    });
};

module.exports = {
  create,
};
