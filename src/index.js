const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const routes = require('./routes');
const { authenticate } = require('./middleware/authenticate');

const app = express();

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

app.use(cors());
app.use(express.json());
app.use(express.static(path.resolve(__dirname, './public')));

app.use('/auth', routes.auth);
app.use('/users', routes.users);
app.use('/images', routes.images);
app.use('/me', authenticate, routes.me);

app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  console.log(err.stack); // eslint-disable-line no-console
  if (['MulterError', 'ValidationError'].includes(err.name)) {
    res.status(400).json({ message: err.message });
  } else {
    res.sendStatus(500);
  }
});

mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true }, () => {
  app.listen(process.env.PORT || 7890, () => {
    console.log(`http://127.0.0.1:${process.env.PORT || 7890}`); // eslint-disable-line no-console
  });
});
