const faker = require('faker');
const fs = require('fs');
const MailgunSend = require('./MailgunSend.js');

jest.mock('fs');

const options = {
  to: faker.internet.email(),
  from: faker.internet.email(),
  subject: faker.lorem.sentence(),
  text: faker.lorem.paragraph(),
};

const creds = {
  apiKey: faker.random.uuid(),
  domain: faker.internet.domainName(),
};

describe(MailgunSend, () => {
  describe('.validate', () => {
    describe('with valid options', () => {
      it('returns true', () => {
        expect(MailgunSend.validate({ ...options })).toBe(true);
      });
    });

    describe('to', () => {
      it('is required', () => {
        expect(() => MailgunSend.validate({
          ...options,
          to: null,
        })).toThrow(/to can't be blank/i);
      });

      it('is required to be an email address', () => {
        expect(() => MailgunSend.validate({
          ...options,
          to: faker.lorem.word(),
        })).toThrow(/to is not a valid email/i);
      });
    });

    describe('from', () => {
      it('is required', () => {
        expect(() => MailgunSend.validate({
          ...options,
          from: null,
        })).toThrow(/from can't be blank/i);
      });

      it('is required to be an email address', () => {
        expect(() => MailgunSend.validate({
          ...options,
          from: faker.lorem.word(),
        })).toThrow(/from is not a valid email/i);
      });
    });

    describe('reply', () => {
      it('is required to be an email address, if supplied', () => {
        expect(() => MailgunSend.validate({
          ...options,
          reply: faker.lorem.word(),
        })).toThrow(/reply is not a valid email/i);
      });
    });

    describe('cc', () => {
      it('is required to be an email address, if supplied', () => {
        expect(() => MailgunSend.validate({
          ...options,
          cc: faker.lorem.word(),
        })).toThrow(/cc is not a valid email/i);
      });
    });

    describe('bcc', () => {
      it('is required to be an email address, if supplied', () => {
        expect(() => MailgunSend.validate({
          ...options,
          bcc: faker.lorem.word(),
        })).toThrow(/bcc is not a valid email/i);
      });
    });

    describe('subject', () => {
      it('is required', () => {
        expect(() => MailgunSend.validate({
          ...options,
          subject: null,
        })).toThrow(/subject can't be blank/i);
      });
    });

    describe('text or htmlpath', () => {
      it('accepts just text', () => {
        expect(MailgunSend.validate({
          ...options,
          text: faker.lorem.words(),
          htmlpath: null,
        })).toBe(true);
      });

      it('accepts just htmlpath', () => {
        expect(MailgunSend.validate({
          ...options,
          text: null,
          htmlpath: faker.system.filePath(),
        })).toBe(true);
      });

      it('accepts both', () => {
        expect(MailgunSend.validate({
          ...options,
          text: faker.lorem.words(),
          htmlpath: faker.system.filePath(),
        })).toBe(true);
      });

      it('requires at least one of those two', () => {
        expect(() => MailgunSend.validate({
          ...options,
          text: null,
          htmlpath: null,
        })).toThrow(/text or htmlpath must be provided/i);
      });
    });
  });

  describe('.constructor', () => {
    it('requires apiKey', () => {
      expect(() => new MailgunSend({
        ...creds,
        apiKey: null,
      })).toThrow(/apikey is required/i);
    });
  });

  describe('#send', () => {
    const mailgunSend = new MailgunSend(creds);

    it('calls the mailgun create message function ', async () => {
      await mailgunSend.send(options);
      expect(mailgunSend.mailgun.messages.create).toHaveBeenCalled();
    });

    it('calls validates the options when sending', async () => {
      jest.spyOn(MailgunSend, 'validate');
      await mailgunSend.send(options);
      expect(MailgunSend.validate).toHaveBeenCalled();
    });

    it('does not call the mailgun api when the options are invalid', async () => {
      await expect(mailgunSend.send({ ...options, subject: null }))
        .rejects
        .toThrow(/subject can't be blank/i);

      expect(mailgunSend.mailgun.messages.create).not.toHaveBeenCalled();
    });

    describe('when successful', () => {
      it('returns a success message', async () => {
        const expectedMessage = new RegExp(`email was successfully sent to ${options.to}`, 'i');
        const successMessage = await mailgunSend.send(options);

        expect(successMessage).toMatch(expectedMessage);
      });

      it('returns verbose information from API call, when requested', async () => {
        const expectedApiMessage = /api message: "Queued\. Thank you\."/i;
        const expectedMessageId = /message id: */i;
        const successMessage = await mailgunSend.send({ ...options, verbose: true });

        expect(successMessage).toMatch(expectedApiMessage);
        expect(successMessage).toMatch(expectedMessageId);
      });
    });

    describe('Mailgun create message parameters', () => {
      it('passes the sending domain and correctly formatted options', async () => {
        await mailgunSend.send(options);
        expect(mailgunSend.mailgun.messages.create).toHaveBeenCalledWith(creds.domain, {
          to: options.to,
          from: options.from,
          subject: options.subject,
          text: options.text,
        });
      });

      it('includes emails addresses that were carbon copied', async () => {
        const cc = faker.internet.email();
        await mailgunSend.send({ ...options, cc });
        expect(mailgunSend.mailgun.messages.create).toHaveBeenCalledWith(creds.domain, {
          to: options.to,
          from: options.from,
          subject: options.subject,
          text: options.text,
          cc,
        });
      });

      it('includes emails addresses that were blind carbon copied', async () => {
        const bcc = faker.internet.email();
        await mailgunSend.send({ ...options, bcc });
        expect(mailgunSend.mailgun.messages.create).toHaveBeenCalledWith(creds.domain, {
          to: options.to,
          from: options.from,
          subject: options.subject,
          text: options.text,
          bcc,
        });
      });

      it('includes both CC and BCC', async () => {
        const bcc = faker.internet.email();
        const cc = faker.internet.email();
        await mailgunSend.send({ ...options, cc, bcc });
        expect(mailgunSend.mailgun.messages.create).toHaveBeenCalledWith(creds.domain, {
          to: options.to,
          from: options.from,
          subject: options.subject,
          text: options.text,
          bcc,
          cc,
        });
      });

      it('passes Reply To option as a header', async () => {
        const reply = faker.internet.email();
        await mailgunSend.send({ ...options, reply });
        expect(mailgunSend.mailgun.messages.create).toHaveBeenCalledWith(creds.domain, {
          to: options.to,
          from: options.from,
          subject: options.subject,
          text: options.text,
          'h:Reply-To': reply,
        });
      });

      it('passes the content of the html file', async () => {
        const htmlpath = faker.system.filePath();
        const fileContents = faker.lorem.paragraphs();

        fs.readFileSync.mockImplementationOnce((path, encoding) => {
          if (path === htmlpath && encoding === 'utf8') {
            return fileContents;
          }

          return undefined;
        });

        await mailgunSend.send({ ...options, htmlpath });
        expect(mailgunSend.mailgun.messages.create).toHaveBeenCalledWith(creds.domain, {
          to: options.to,
          from: options.from,
          subject: options.subject,
          text: options.text,
          html: fileContents,
        });
      });
    });

    // it handles 401 error

    // it handles network error

    // it handles other errors
  });
});
