const faker = require('faker');

function mailgunClientMock({ apiKey, domain }) {
  this.apiKey = apiKey;
  this.domain = domain;

  this.createMessageMock = jest.fn(async (domain, data) => {
    // if (this.apiKey === 'FAIL_UNAUTHORIZED') {
    //   throw new Error('')
    // }

    return {
      id: faker.random.uuid(),
      message: 'Queued. Thank you.'
    }
  });

  this.messages = {
    create: this.createMessageMock,
  };

  return this;
}

module.exports = { client: mailgunClientMock };
