const mailgun = require('mailgun.js');
const fs = require('fs');
const validate = require('./validate');

class MailgunSend {
  /**
   * constructor
   * @param  {object} creds object containing apiKey and domain properties
   * @return {object}       MailgunSend instance
   */
  constructor({ apiKey, domain = '' }) {
    if (!apiKey) { throw new TypeError('apiKey is required'); }

    this.mailgun = mailgun.client({ username: 'api', key: apiKey });
    this.domain = domain;

    return this;
  }

  /**
   * Validate options to be passed to send method
   * @param  {object} creds Object of options for sending an email
   * @return {bool}         true if options are valid, false otherwise
   */
  static validate(options) {
    const constraints = {
      to: {
        presence: true,
        email: true,
      },
      from: {
        presence: true,
        email: true,
      },
      reply: {
        email: true,
      },
      cc: {
        email: true,
      },
      bcc: {
        email: true,
      },
      subject: {
        presence: true,
      },
      text: {
        thisOrThat: 'htmlpath',
      },
    };

    const errors = validate(options, constraints, {
      format: 'flat',
    });

    if (!errors) {
      return true;
    }

    throw new Error(`\n\t❌  ${errors.join('\n\t❌  ')}`);
  }

  /**
   * send email
   * @param  {object} creds Object of options for sending an email
   * @return {Promise}      Promise that will complete when email sends
   */
  async send(options) {
    try {
      MailgunSend.validate(options);

      const mailOpts = {
        from: options.from,
        to: options.to,
        subject: options.subject,
      };

      if (options.text) {
        mailOpts.text = options.text;
      }

      if (options.htmlpath) {
        mailOpts.html = fs.readFileSync(options.htmlpath, 'utf8');
      }

      if (options.reply) {
        mailOpts['h:Reply-To'] = options.reply;
      }

      if (options.cc) {
        mailOpts.cc = options.cc;
      }

      if (options.bcc) {
        mailOpts.bcc = options.bcc;
      }

      const response = await this.mailgun.messages.create(this.domain, mailOpts);

      const { id, message } = response;
      let successMessage = `\n\t🚀  ✉️  Email was successfully sent to ${options.to}!\n`;

      if (options.verbose) {
        successMessage += `\n\t🗒  API Message: "${message}"\n\n\t🆔  Message ID: ${id}\n`;
      }

      return successMessage;
    } catch (err) {
      if (err.status === 401) {
        throw new Error(
          '\n\t🚫  Your Mailgun API key and/or domain are incorrect.'
              + '\n\t🔁  Rerun your command with -R flag to re-enter you credentials.',
        );
      } else if (err.type === 'EUNAVAILABLE') {
        throw new Error(
          '\n\t‼️ 🌐  Looks like you may not be connected to the internet. '
              + 'Check your network settings and try again.',
        );
      } else {
        throw err;
      }
    }
  }
}

module.exports = MailgunSend;
