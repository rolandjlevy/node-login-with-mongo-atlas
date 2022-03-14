// express-validator for controlling sanitization / validation
const { check } = require('express-validator');
class Validation {
  constructor() {
    this.registrationMessage = 'Email address must be valid, and the username and password must be 6 - 24 characters long.';
    this.loginMessage = 'The username and password must be 6 - 24 characters long.';
    this.rules = {
      register: [
        check('username').not().isEmpty().trim().escape().isLength({ min: 6, max: 24 }).withMessage(this.registrationMessage),
        check('email').not().isEmpty().trim().isEmail().isLength({ max: 128 }).withMessage(this.registrationMessage),
        check('password').not().isEmpty().trim().escape().isLength({ min: 6, max: 24 }),
        check('confirmedpassword').not().isEmpty().trim().escape().isLength({ min: 6, max: 24 })
      ],
      login: [
        check('username').not().isEmpty().trim().escape().isLength({ min: 6, max: 24 }).withMessage(this.loginMessage),
        check('password').not().isEmpty().trim().escape().isLength({ min: 6, max: 24 }).withMessage(this.loginMessage),
      ],
    }
  }
}

module.exports = Validation;