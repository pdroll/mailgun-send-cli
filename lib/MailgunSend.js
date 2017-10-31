'use strict';

const mailgun = require('mailgun-js');
const validate = require('./validate');
const mailcomposer = require('mailcomposer');
const fs = require('fs');

class MailgunSend {

  /**
   * constructor
   * @param  {object} creds object containing apiKey and domain properties
   * @return {object}       MailgunSend instance
   */
  constructor(creds) {
    this.mailgun = mailgun({
      apiKey: creds.apiKey,
      domain: creds.domain,
    });

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

    throw new Error(`\n\t❌  ${errors.join(`\n\t❌  `)}`);
  }

  /**
   * send email
   * @param  {object} creds Object of options for sending an email
   * @return {Promise}      Promise that will complete when email sends
   */
  send(options) {
    return new Promise((fulfill, reject) => {
      if (!MailgunSend.validate(options)) {
        reject('Invalid options were supplied');
      }

      const mailOpts = {
        from: options.from,
        to: options.to,
        subject: options.subject,
        text: options.text,
      };

      if (options.htmlpath) {
        mailOpts.html = fs.readFileSync(options.htmlpath, 'utf8');
      }

      if (options.reply) {
        mailOpts.replyTo = options.reply;
      }

      if (options.cc) {
        mailOpts.cc = options.cc;
      }

      if (options.bcc) {
        mailOpts.bcc = options.bcc;
      }

      mailcomposer(mailOpts).build((mailBuildError, message) => {
        const dataToSend = {
          to: options.to,
          message: message.toString('ascii'),
        };

        if (options.bcc) {
          dataToSend.to = `${options.to}, ${options.bcc}`;
        }

        this.mailgun.messages().sendMime(dataToSend, (sendError) => {
          if (sendError) {
            if (sendError.statusCode === 401) {
              reject(`\n\t🚫  Your Mailgun API key and/or domain are incorrect.\n\t🔁  Rerun your command with -R flag to re-enter you credentials.`);
            } else if (sendError.syscall === 'getaddrinfo' && sendError.errno === 'ENOTFOUND') {
              reject(`\n\t‼️ 🌐  Looks like you may not be connected to the internet. Check your network settings and try again.`);
            } else {
              reject(sendError);
            }
            return false;
          }
          fulfill(`\n\t🚀  ✉️  Email was successfully sent to ${options.to}!  \n`);
          return true;
        });
      });
    });
  }
}

module.exports = MailgunSend;
