const express = require('express');
const router = express.Router();
router.use(express.static('public'));
const Validation = require('./utils/Validation.js');
const validate = new Validation();
const moment = require('moment');
const { check, validationResult } = require('express-validator');
const loginAgainLink = '<a href="/login-page">Please try again</a>';
const User = require('./models/User.js');
const unprocessableEntityStatus = 403;

// Homepage
router.get('/', (req, res) => {
  res.status(200).sendFile('/index.html', { root: './public' });
});  

// Login page
router.get('/login-page', (req, res) => {
  res.status(200).sendFile('/login-page.html', { root: './public' });
});

// Login result
router.post('/login', validate.rules.login, (req, res, next) => {
  const { username, password } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error(`Invalid input. The username and password must be completed and be 6 - 24 characters long. <a href="/login-page">Please try again</a>`);
    error.status = unprocessableEntityStatus;
    return next(error);
  }
  User.findOne({ username })
    .then(user => {
      if (!user) {
        const error = new Error(`Username does not exist. ${loginAgainLink}`);
        error.status = unprocessableEntityStatus;
        return next(error);
      } else {
        user.comparePassword(password, function(error, isMatch) {
          if (error) return next(error);
          if (!isMatch) {
            const error = new Error(`Incorrect password. ${loginAgainLink}`);
            error.status = unprocessableEntityStatus;
            return next(error);
          } else {
            res.status(200).send(`
              <h1>Successful login</h1>
              <p>${user.username} you are now logged in</p>
              <p><a href="/">⬅ Home</a> | <a href="/user/${user._id}">View your details</a></p>
            `);
          }
        });
      }
    })
    .catch((error) => {
      next(error);
    });
});

// Registration page
router.get('/registration', (req, res) => {
  res.status(200).sendFile('./registration.html', { root: './public' });
});

// Registration result
router.post('/register', validate.rules.register, async (req, res, next) => {
  const { username, email, password } = req.body;
  if (password) {
    await check('confirmedpassword').equals(password).withMessage('passwords do not match').run(req);
  }
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    let errorMessage = 'Invalid input. ';
    errorMessage += 'Email address must be valid, and the username and password must be 6 - 24 characters long. ';
    if (errors.errors.length == 1 && errors.errors[0].param === 'confirmedpassword') {
      errorMessage = 'The password and confirmation password do not match. ';
    }
    errorMessage += `<a href="/registration">Please try again</a>`;
    const error = new Error(errorMessage);
    error.status = unprocessableEntityStatus;
    return next(error);
  }
  User.findOne({ username:username })
  .then(user => {
    if (user) {
      const error = new Error(`Sorry, the username ${username} already exists. ${loginAgainLink}`);
      error.status = unprocessableEntityStatus;
      return next(error);
    } else {
      const newUser = new User({ username, email, password });
      newUser.save()
      .then(data => {
        return res.status(200).send(`
        <h1>Successful registration</h1>
        <p>Welcome ${data.username}, thank you for registering as a new user</p>
        <p><a href="/">⬅ Home</a></p>
        `);
      })
    }
  })
  .catch(err => {
    return next(err);
  });
});

// View one user
router.get('/user/:id', (req, res, next) => {
  User.findOne({ _id: req.params.id })
    .then(user => {
      res.status(200).send(`
        <h1>View user details</h1>
        <p>Username: ${user.username}</p>
        <p>Email: ${user.email}</p>
        <p>Date registered: ${moment(user.created_at).format('Do MMMM, YYYY')})</p>
        <p>ID: ${user._id}</p>
        <p><a href="/">⬅ Home</a> | <a href="/users">All users</a></p>
    `);
    })
    .catch(err =>  {
      return next(err);
    });
});

// View all users
router.get('/users', (req, res, next) => {
    User.find({  })
    .then(users => {
      let str = '<h1>View all users</h1>';
      users.forEach(user => {
        str += `
        <ul>
          <li><a href="/user/${user._id}">View user</a></li>
          <li>Username: ${user.username}</li>
          <li>Email: ${user.email}</li>
          <li>Date registered: ${moment(user.created_at).format('Do MMMM, YYYY')}</li>
          <li>ID: ${user._id}</li>
        </ul>`;
      });
      str += '<p><a href="/">⬅ Home</a></p>';
      res.status(200).send(str);
    })
    .catch(err => {
      console.log(err)
      return next(err);
    });
});

// Page not found
router.get('*', (req, res, next) => {
  var url = req.protocol + '://' + req.get('host') + req.originalUrl;
  res.status(404).send(`
    <h1>Error 404!</h1>
    <p>Page not found. Error trying to access ${url}</p>
    <p><a href="/">⬅ Home</a></p>
  `);
});

module.exports = router;