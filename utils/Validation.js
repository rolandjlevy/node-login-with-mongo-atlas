// express-validator for controlling sanitization / validation
const { check } = require('express-validator');
class Validation {
  constructor() {
    this.rules = {
      login: [        check('username').not().isEmpty().trim().escape().isLength({ min:6, max:24 }),        check('password').not().isEmpty().trim().escape().isLength({ min:6, max:24 }),
      ],
      register: [          check('username').not().isEmpty().trim().escape().isLength({ min:6, max:24 }),          check('email').not().isEmpty().trim().isEmail().isLength({ max:128 }),          check('password').not().isEmpty().trim().escape().isLength({ min:6, max:24 }),          check('confirmedpassword').not().isEmpty().trim().escape().isLength({ min:6, max:24 })
      ],
    }
  }
}

module.exports = Validation;