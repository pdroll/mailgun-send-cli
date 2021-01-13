const faker = require('faker');
const runCli = require('./runCli.js');
const fetchCredentials = require('./fetchCredentials.js');
const MailgunSend = require('./MailgunSend.js');
const { version } = require('../package.json');

const { stringMatching, objectContaining } = expect;

const exitOverrideMock = jest.fn(() => { throw new Error('Exited'); });

jest.mock('./fetchCredentials.js');
jest.mock('./MailgunSend.js');

jest.spyOn(process, 'exit').mockImplementation(() => {});
jest.spyOn(process.stdout, 'write').mockImplementation(() => {});

const opts = {
  to: faker.internet.email(),
  from: faker.internet.email(),
  cc: faker.internet.email(),
  bcc: faker.internet.email(),
  reply: faker.internet.email(),
  subject: faker.lorem.sentence(),
  text: faker.lorem.paragraph(),
  htmlPath: faker.system.filePath(),

};

// TODO: build this out for all opts
const argv = ['-t', opts.to, '-f', opts.from, '-s', opts.subject, '-T', opts.text];

const cli = (args) => (
  runCli({ argv: ['node', 'mailgun-send.js', ...args], exitOverride: exitOverrideMock })
);

it('initializes MailgunSend with credentials', async () => {
  await cli(argv);

  expect(MailgunSend).toHaveBeenCalledWith({
    apiKey: 'MOCKAPIKEY',
    domain: 'MOCKDOMAIN',
  });
});

// it sends reset option to fetchCreds
// it blows up when given rando args

describe('passing parsed options to MailgunSend', () => {
  it('passes from, to, subject', async () => {
    await cli(argv);
    expect(MailgunSend.mock.instances[0].send).toHaveBeenCalledWith(
      objectContaining({
        from: opts.from,
        to: opts.to,
        subject: opts.subject,
        text: opts.text,
      }),
    );
  });
});

describe('version option', () => {
  it('exits before fetching credentials or calling MailgunSend', async () => {
    await expect(cli(['-V'])).rejects.toThrow(/exited/i);

    expect(fetchCredentials).not.toHaveBeenCalled();
    expect(MailgunSend).not.toHaveBeenCalled();
  });

  it('writes the version to stdout', async () => {
    await expect(cli(['-V'])).rejects.toThrow(/exited/i);

    expect(process.stdout.write).toHaveBeenCalledWith(stringMatching(version));
  });
});

describe('help option', () => {
  it('exits before fetching credentials or calling MailgunSend', async () => {
    await expect(cli(['-h'])).rejects.toThrow(/exited/i);

    expect(fetchCredentials).not.toHaveBeenCalled();
    expect(MailgunSend).not.toHaveBeenCalled();
  });

  it('writes the version to stdout', async () => {
    await expect(cli(['-h'])).rejects.toThrow(/exited/i);

    expect(process.stdout.write).toHaveBeenCalledWith(
      stringMatching(/usage: mailgun-send \[options\]/i),
    );
  });
});
