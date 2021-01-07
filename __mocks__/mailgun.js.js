const faker = require('faker');

function mailgunClientMock({ key, username }) {
  this.apiKey = key;
  this.username = username;

  this.messages = {
    create: jest.fn(async () => {
      if (this.apiKey === 'FAIL_UNAUTHORIZED') {
        throw new Error({ status: 401 });
      }

      if (this.apiKey === 'FAIL_NETWORK') {
        throw new Error({ type: 'EUNAVAILABLE' });
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
