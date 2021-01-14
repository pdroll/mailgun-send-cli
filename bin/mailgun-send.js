#!/usr/bin/env node

const { Command } = require('commander');
const keytar = require('keytar');
const readlineSync = require('readline-sync');
const MailgunSend = require('../lib/MailgunSend');
const packageJson = require('../package.json');

const program = new Command();

/**
 * Configure Program options and parse arguments
 */
program
  .version(packageJson.version)
  .usage('[options]')
  .description('You will be prompted to enter your Mailgun API Key [https://app.mailgun.com/app/account/security/api_keys] and Domain [https://app.mailgun.com/app/sending/domains/] on your first use.')
  .option('-s, --subject <value>', 'Subject of Email')
  .option('-t, --to <value>', 'Email address of recipient of email')
  .option('-f, --from <value>', 'Email address of email sender')
  .option('-r, --reply <value>', 'ReplyTo email address. Optional')
  .option('-c, --cc <value>', 'Email address to CC. Optional')
  .option('-b, --bcc <value>', 'Email address to BCC. Optional')
  .option('-T, --text <value>', 'Text to send as body of email. Must specify this or --htmlpath.')
  .option('-H, --htmlpath <value>', 'Path to HTML file to send as email. Must specify this or --text.')
  .option('-R, --reset', 'Reset Mailgun API key and Domain. You will be prompted to enter these again.')
  .option('-v, --verbose', 'Output more detailed information, such as message id')
  .parse(process.argv);

(async () => {
  /**
   * Get/Set Mailgun creds from keychain.
   * Prompt user for them if they are not found.
   */
  if (program.reset) {
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

  /**
   * Attempt to send email
   */
  const mg = new MailgunSend({ apiKey, domain });

  return mg.send({
    subject: program.subject,
    to: program.to,
    from: program.from,
    reply: program.reply,
    cc: program.cc,
    bcc: program.bcc,
    text: program.text,
    htmlpath: program.htmlpath,
    verbose: program.verbose,
  }).then((msg) => {
    console.log(`\n✅  Success!\n\t${msg}`);
  }).catch((e) => {
    // Remove extraneous 'Error:' if present
    const errMsg = `${e}`.replace('Error:', '');
    console.log(`\n🚨  Error:${errMsg}\n`);
  });
})();
