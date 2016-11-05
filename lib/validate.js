const validate = require('validate.js');

// Configure up custom validator
validate.validators.thisOrThat = (val, opts, key, attributes) => {
  if (!val && !attributes[opts]) {
    return `or ${opts} must be provided`;
  }
  return null;
};

module.exports = validate;
