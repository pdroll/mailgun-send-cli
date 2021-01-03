function mailgunMock(options) {
  if (!options.apiKey) {
    throw new Error('apiKey value must be defined!');
  }

  this.apiKey = options.apiKey;
  this.domain = options.domain;

  this.sendMimeMock = jest.fn((data, callback) => {
    if (this.apiKey === 'FAIL_UNAUTHORIZED') {
      callback({ statusCode: 401 });
      return;
    }

    if (this.apiKey === 'FAIL_NETWORK') {
      callback({ syscall: 'getaddrinfo', errno: 'ENOTFOUND' });
      return;
    }

    if (this.apiKey === 'FAIL_OTHER') {
      callback({});
      return;
    }

    callback();
  });

  this.messages = () => ({
    sendMime: this.sendMimeMock,
  });

  return this;
}

module.exports = mailgunMock;
