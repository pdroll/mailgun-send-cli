const keytar = require('keytar');
const readlineSync = require('readline-sync');
const packageJson = require('../package.json');

const fetchCredentials = async ({ reset = false }) => {
  /**
   * Get/Set Mailgun creds from keychain.
   * Prompt user for them if they are not found.
   */
  if (reset) {
    await keytar.deletePassword(packageJson.name, 'apiKey');
    await keytar.deletePassword(packageJson.name, 'domain');
  }

  let apiKey = await keytar.getPassword(packageJson.name, 'apiKey');
  let domain = await keytar.getPassword(packageJson.name, 'domain');

  if (!domain) {
    domain = readlineSync.question('Mailgun Domain (e.g. mg.example.com): ');
    if (!domain) {
      console.log('\n\t🚨  Domain is required\n');
      return false;
    }
    await keytar.setPassword(packageJson.name, 'domain', domain);
  }

  if (!apiKey) {
    apiKey = readlineSync.question('Mailgun API Key (e.g. key-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX): ', {
      hideEchoBack: true,
    });

    if (!apiKey) {
      console.log('\n\t🚨  API Key is required\n');
      return false;
    }
    await keytar.setPassword(packageJson.name, 'apiKey', apiKey);
  }

  return { domain, apiKey };
};

module.exports = fetchCredentials;
