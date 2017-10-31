const validate = require('validate.js');

// Configure up custom validator
validate.validators.thisOrThat = (val, opts, key, attributes) => {
  if (!val && !attributes[opts]) {
    return `or ${opts} must be provided`;
  }
  return null;
};

// Allow name in emails
// i.e. "John Doe <john.doe@example.com>"
validate.validators.email.PATTERN = new RegExp(/(?:"?([^"]*)"?\s)?(?:<?(.+@[^>]+)>?)/);

module.exports = validate;
