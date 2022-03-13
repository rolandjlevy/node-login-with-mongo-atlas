const mongoose = require('mongoose');
const express = require('express');
const app = require('./app.js');

const { MONGODB_URI, PORT } = process.env;
const port = PORT || 8080;

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(client => {
  console.log('Mongoose is connected...');
  app.listen(port, () => {
    console.log(`Server started at port ${port}`);
  });
})
.catch(error => {
  console.error(error.stack);
  process.exit(1);
});