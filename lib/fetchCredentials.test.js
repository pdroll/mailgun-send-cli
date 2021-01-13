const faker = require('faker');
const keytar = require('keytar');
const readlineSync = require('readline-sync');
const { name: appName } = require('../package.json');
const fetchCredentials = require('./fetchCredentials.js');

const apiKey = faker.random.uuid();
const domain = faker.internet.domainName();

jest.mock('keytar');
jest.mock('readline-sync');

afterEach(() => {
  keytar.clearMockData();
});

describe('when creds were previously stored', () => {
  beforeEach(async () => {
    await Promise.all([
      keytar.setPassword(appName, 'apiKey', apiKey),
      keytar.setPassword(appName, 'domain', domain),
    ]);
  });

  it('returns the saved creds', async () => {
    const creds = await fetchCredentials();

    expect(creds).toEqual({ apiKey, domain });
  });

  describe('when resetting creds', () => {
    const newApiKey = faker.random.uuid();
    const newDomain = faker.internet.domainName();

    beforeEach(() => {
      readlineSync.question.mockImplementation((description) => {
        if (description.match(/mailgun domain/i)) {
          return newDomain;
        }

        if (description.match(/api key/i)) {
          return newApiKey;
        }

        return null;
      });
    });

    it('deletes the stored credentials', async () => {
      await fetchCredentials({ reset: true });

      expect(keytar.deletePassword).toHaveBeenCalledWith(appName, 'domain');
      expect(keytar.deletePassword).toHaveBeenCalledWith(appName, 'apiKey');
    });

    it('prompts the user for new creds', async () => {
      await fetchCredentials({ reset: true });

      expect(readlineSync.question).toHaveBeenCalledWith('Mailgun Domain (e.g. mg.example.com): ');
      expect(readlineSync.question)
        .toHaveBeenCalledWith('Mailgun API Key (e.g. key-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX): ', {
          hideEchoBack: true,
        });
    });
  });
});

describe('when creds were not previously stored', () => {
  const newApiKey = faker.random.uuid();
  const newDomain = faker.internet.domainName();

  beforeEach(() => {
    readlineSync.question.mockImplementation((description) => {
      if (description.match(/mailgun domain/i)) {
        return newDomain;
      }

      if (description.match(/api key/i)) {
        return newApiKey;
      }

      return null;
    });
  });

  it('prompts user to enter creds', async () => {
    await fetchCredentials();

    expect(readlineSync.question).toHaveBeenCalledWith('Mailgun Domain (e.g. mg.example.com): ');
    expect(readlineSync.question)
      .toHaveBeenCalledWith('Mailgun API Key (e.g. key-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX): ', {
        hideEchoBack: true,
      });
  });

  it('stores the creds for future use', async () => {
    await fetchCredentials();

    expect(keytar.setPassword).toHaveBeenCalledWith(appName, 'domain', newDomain);
    expect(keytar.setPassword).toHaveBeenCalledWith(appName, 'apiKey', newApiKey);
  });

  it('returns the input from the user', async () => {
    const creds = await fetchCredentials();

    expect(creds).toEqual({ apiKey: newApiKey, domain: newDomain });
  });

  describe('when the user does not enter a domain when prompted', () => {
    beforeEach(() => {
      readlineSync.question.mockImplementation((description) => {
        if (description.match(/mailgun domain/i)) {
          return null;
        }

        if (description.match(/api key/i)) {
          return newApiKey;
        }

        return null;
      });
    });

    it('raises an error', async () => {
      await expect(fetchCredentials())
        .rejects
        .toThrow(/domain is required/i);
    });
  });

  describe('when the user does not enter an api key when prompted', () => {
    beforeEach(() => {
      readlineSync.question.mockImplementation((description) => {
        if (description.match(/mailgun domain/i)) {
          return newDomain;
        }

        if (description.match(/api key/i)) {
          return null;
        }

        return null;
      });
    });

    it('raises an error', async () => {
      await expect(fetchCredentials())
        .rejects
        .toThrow(/api key is required/i);
    });
  });
});
