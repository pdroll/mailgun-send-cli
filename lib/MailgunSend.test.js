const faker = require('faker');
const MailgunSend = require('./MailgunSend.js');

const defaultOptions = {
  to: faker.internet.email(),
  from: faker.internet.email(),
  subject: faker.lorem.sentence(),
  text: faker.lorem.paragraph(),
};

describe(MailgunSend, () => {
  describe('.validate', () => {
    describe('with valid options', () => {
      it('returns true', () => {
        expect(MailgunSend.validate({ ...defaultOptions })).toBe(true);
      });
    });

    describe('to', () => {
      it('is required', () => {
        expect(() => MailgunSend.validate({
          ...defaultOptions,
          to: null,
        })).toThrow(/to can't be blank/i);
      });

      it('is required to be an email address', () => {
        expect(() => MailgunSend.validate({
          ...defaultOptions,
          to: faker.lorem.word(),
        })).toThrow(/to is not a valid email/i);
      });
    });

    describe('from', () => {
      it('is required', () => {
        expect(() => MailgunSend.validate({
          ...defaultOptions,
          from: null,
        })).toThrow(/from can't be blank/i);
      });

      it('is required to be an email address', () => {
        expect(() => MailgunSend.validate({
          ...defaultOptions,
          from: faker.lorem.word(),
        })).toThrow(/from is not a valid email/i);
      });
    });

    describe('reply', () => {
      it('is required to be an email address, if supplied', () => {
        expect(() => MailgunSend.validate({
          ...defaultOptions,
          reply: faker.lorem.word(),
        })).toThrow(/reply is not a valid email/i);
      });
    });

    describe('cc', () => {
      it('is required to be an email address, if supplied', () => {
        expect(() => MailgunSend.validate({
          ...defaultOptions,
          cc: faker.lorem.word(),
        })).toThrow(/cc is not a valid email/i);
      });
    });

    describe('bcc', () => {
      it('is required to be an email address, if supplied', () => {
        expect(() => MailgunSend.validate({
          ...defaultOptions,
          bcc: faker.lorem.word(),
        })).toThrow(/bcc is not a valid email/i);
      });
    });

    describe('subject', () => {
      it('is required', () => {
        expect(() => MailgunSend.validate({
          ...defaultOptions,
          subject: null,
        })).toThrow(/subject can't be blank/i);
      });
    });

    describe('text or htmlpath', () => {
      it('accepts just text', () => {
        expect(MailgunSend.validate({
          ...defaultOptions,
          text: faker.lorem.words(),
          htmlpath: null,
        })).toBe(true);
      });

      it('requires at least one of those two', () => {
        expect(() => MailgunSend.validate({
          ...defaultOptions,
          text: null,
          htmlpath: null,
        })).toThrow(/text or htmlpath must be provided/i);
      });
    });
  });
});
