const MailgunSend = require('./MailgunSend.js');
const faker = require('faker');

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
      expect(mailgunSend.mailgun.createMessageMock).toHaveBeenCalled();
    });


    // it calls validate before sending

    // it doesn't call createMessageMock if invalid

    // it passes the correct data to createMessageMock

    // it handles 401 error

    // it handles network error

    // it handles other errors

    // Logs verbose stuff
  });
});
