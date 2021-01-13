const fetchCredentialsMock = jest.fn(async () => ({
  apiKey: 'MOCKAPIKEY',
  domain: 'MOCKDOMAIN',
}));

module.exports = fetchCredentialsMock;
