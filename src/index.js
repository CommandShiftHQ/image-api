const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const routes = require('./routes');

const app = express();

app.use(morgan('dev'));
app.use(cors());
app.use(express.json());

app.use('/auth', routes.auth);
app.use('/users', routes.users);
app.use('/images', routes.images);

mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true }, () => {
  app.listen(process.env.PORT || 3000);
});
