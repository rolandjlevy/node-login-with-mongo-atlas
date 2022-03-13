const express = require('express');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const routes = require('./routes.js');
app.use('/', routes);

app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || 'unknown';
  return res.status(status).send(`
    <h1>Error ⚠️</h1>
    <p>${message}</p>
    <p><a href="/">⬅ Home</a></p>
  `);
});

module.exports = app;