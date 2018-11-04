const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const routes = require('./routes');

const app = express();

app.use(morgan('dev'));
app.use(cors());
app.use(express.json());

app.use('/images', routes.images);

app.listen(3000);
