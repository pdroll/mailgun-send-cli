const { Command } = require('commander');
const MailgunSend = require('./MailgunSend.js');
const packageJson = require('../package.json');
const fetchCredentials = require('./fetchCredentials.js');

const runCli = async (argv) => {
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
    .parse(argv);

  const { reset } = program;
  const { apiKey, domain } = await fetchCredentials({ reset });

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
  });
};

module.exports = runCli;
