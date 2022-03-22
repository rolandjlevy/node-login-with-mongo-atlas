const express = require('express');
const router = express.Router();
const moment = require('moment');
const { check, validationResult } = require('express-validator');

router.use(express.json());
router.use(express.urlencoded({ extended: false }));
router.use(express.static('public'));

const User = require('./models/User.js');
const Validation = require('./utils/Validation.js');
const validate = new Validation();
const loginAgainLink = '<a href="/login-page">Please try again</a>';
const tryAgainLink = (link) => `<a href="/${link}">Please try again</a>`;
const unprocessableEntityStatus = 403;

// Homepage
router.get('/', (req, res) => {
  res.status(200).sendFile('/index.html', { root: './public' });
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
  const result = validationResult(req);
  if (!result.isEmpty()) {
    let errorMessage = 'Invalid input. ';
    errorMessage += 'Email address must be valid, and the username and password must be 6 - 24 characters long. ';
    if (result.errors.length == 1 && result.errors[0].param === 'confirmedpassword') {
      errorMessage = 'The password and confirmation password do not match. ';
    }
    errorMessage += tryAgainLink('register');
    const error = new Error(errorMessage);
    error.status = unprocessableEntityStatus;
    return next(error);
  }
  User.findOne({ username })
  .then(user => {
    if (user) {
      const error = new Error(`Sorry, the username ${username} already exists. ${tryAgainLink('register')}`);
      error.status = unprocessableEntityStatus;
      return next(error);
    } else {
      const newUser = new User({ username, email, password });
      newUser.save()
      .then(data => {
        return res.status(200).send(`
        <h1>Successful registration</h1>
        <p>Welcome ${data.username}, thank you for registering</p>
        <p><a href="/">⬅ Home</a></p>
        `);
      })
    }
  })
  .catch(err => {
    return next(err);
  });
});

// Login page
router.get('/login-page', (req, res) => {
  res.status(200).sendFile('/login-page.html', { root: './public' });
});

// Login result
router.post('/login', validate.rules.login, (req, res, next) => {
  const { username, password } = req.body;
  const result = validationResult(req);
  if (!result.isEmpty()) {
    const error = new Error(`Invalid input. The username and password must be completed and be 6 - 24 characters long. ${tryAgainLink('login-page')}`);
    error.status = unprocessableEntityStatus;
    return next(error);
  }
  User.findOne({ username })
    .then(user => {
      if (!user) {
        const error = new Error(`Username does not exist. ${tryAgainLink('login-page')}`);
        error.status = unprocessableEntityStatus;
        return next(error);
      } else {
        user.comparePassword(password)
        .then(matched => {
          if (matched) {
            const page = (`
              <h1>Successful login</h1>
              <p>${user.username} you are now logged in</p>
              <p><a href="/">⬅ Home</a> | <a href="/user/${user._id}">View your details</a></p>
            `);
            return res.status(200).send(page);
          } else {
            const error = {
              message: `Incorrect password`,
              statusCode: unprocessableEntityStatus
            }
            return next(error);
          }
        })
        .catch((error) => {
          return next(error);
        });
      }
    })
    .catch((error) => {
      next(error);
    });
});

const displayUser = (user) => {
  const { username, email, created_at, _id } = user;
  return `<ul>
    <li>Username: ${username}</li>
    <li>Email: ${email}</li>
    <li>Registered: ${moment(created_at).format('Do MMMM, YYYY')}</li>
    <li>ID: ${_id}</li>
  </ul>`;
};

// View one user
router.get('/user/:id', (req, res, next) => {
  User.findOne({ _id: req.params.id })
  .then(user => {
    res.status(200).send(`
    <h1>View user details</h1>
    ${displayUser(user)}
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
    users.forEach(user => str += displayUser(user));
    str += '<p><a href="/">⬅ Home</a></p>';
    res.status(200).send(str);
  })
  .catch(err => {
    return next(err);
  });
});

// Page not found
router.get('*', (req, res, next) => {
  var url = req.protocol + '://' + req.get('host') + req.originalUrl;
  res.status(404).send(`
    <h1>Error 404</h1>
    <p>Page not found. Error trying to access ${url}</p>
    <p><a href="/">⬅ Home</a></p>
  `);
});

router.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || 'unknown';
  return res.status(status).send(`
    <h1>Error</h1>
    <p>${message}</p>
    <p><a href="/">⬅ Home</a></p>
  `);
});

module.exports = router;