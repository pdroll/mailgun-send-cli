const faker = require('faker');

function mailgunClientMock({ key, username }) {
  this.apiKey = key;
  this.username = username;

  this.messages = {
    create: jest.fn(async () => {
      if (this.apiKey === 'FAIL_UNAUTHORIZED') {
        const e = new Error();
        e.status = 401;
        throw e;
      }

      if (this.apiKey === 'FAIL_NETWORK') {
        const e = new Error();
        e.type = 'EUNAVAILABLE';
        throw e;
      }

      if (this.apiKey === 'FAIL_OTHER') {
        throw new Error('Failed');
      }

      return {
        id: faker.random.uuid(),
        message: 'Queued. Thank you.',
      };
    }),
  };

  return this;
}

module.exports = { client: mailgunClientMock };
