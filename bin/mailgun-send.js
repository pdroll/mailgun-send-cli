#!/usr/bin/env node

'use strict';

const program = require('commander');
const keytar = require('keytar');
const readlineSync = require('readline-sync');
const MailgunSend = require('../lib/MailgunSend');
const packageJson = require('../package.json');

/**
 * Configure Program options and parse arguments
 */
program
  .version(packageJson.version)
  .usage('[options]')
  .description('You will be prompted to enter your Mailgun API Key [https://mailgun.com/app/account/security] and Domain [https://mailgun.com/app/domains] on your first use.')
  .option('-s, --subject <value>', 'Subject of Email')
  .option('-t, --to <value>', 'Email address of recipient of email')
  .option('-f, --from <value>', 'Email address of email sender')
  .option('-r, --reply <value>', 'ReplyTo email address. Optional')
  .option('-T, --text <value>', 'Text to send as body of email. Must specify this or --htmlpath.')
  .option('-H, --htmlpath <value>', 'Path to HTML file to send as email. Must specify this or --text.')
  .option('-R, --reset', 'Reset Mailgun API key and Domain. You will be prompted to enter these again.')
  .parse(process.argv);

/**
 * Get/Set Mailgun creds from keychain.
 * Prompt user for them if they are not found.
 */
if (program.reset) {
  keytar.deletePassword(packageJson.name, 'apiKey');
  keytar.deletePassword(packageJson.name, 'domain');
}

let apiKey = keytar.getPassword(packageJson.name, 'apiKey');
let domain = keytar.getPassword(packageJson.name, 'domain');

if (!domain) {
  domain = readlineSync.question('Mailgun Domain (e.g. mg.example.com): ');
  keytar.replacePassword(packageJson.name, 'domain', domain);
}

if (!apiKey) {
  apiKey = readlineSync.question('Mailgun API (e.g. key-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX): ', {
    hideEchoBack: true,
  });
  keytar.replacePassword(packageJson.name, 'apiKey', apiKey);
}

/**
 * Attempt to send email
 */
const mg = new MailgunSend({ apiKey, domain });

mg.send({
  subject: program.subject,
  to: program.to,
  from: program.from,
  reply: program.reply,
  text: program.text,
  htmlpath: program.htmlpath,
}).then((msg) => {
  console.log(`\n✅  Success!\n\t${msg}`);
}).catch((e) => {
  // Remove extraneous 'Error:' if present
  const errMsg = `${e}`.replace('Error:', '');
  console.log(`\n🚨  Error:${errMsg}\n`);
});
