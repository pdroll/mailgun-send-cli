const faker = require('faker');
const runCli = require('./runCli.js');
const fetchCredentials = require('./fetchCredentials.js');
const MailgunSend = require('./MailgunSend.js');
const { version } = require('../package.json');

const originalConsoleError = global.console.error;

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
const argv = [
  '-t', opts.to,
  '-f', opts.from,
  '-s', opts.subject,
  '-T', opts.text,
  '-c', opts.cc,
  '-b', opts.bcc,
  '-r', opts.reply,
  '-H', opts.htmlPath,
];

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

describe('parsing options', () => {
  it('passes all parsed options to MailgunSend', async () => {
    await cli(argv);
    expect(MailgunSend.mock.instances[0].send).toHaveBeenCalledWith(
      objectContaining({
        from: opts.from,
        to: opts.to,
        subject: opts.subject,
        text: opts.text,
        cc: opts.cc,
        bcc: opts.bcc,
        reply: opts.reply,
        htmlpath: opts.htmlPath,
      }),
    );
  });

  it('passes verbose option to MailgunSend', async () => {
    await cli([...argv, '-v']);
    expect(MailgunSend.mock.instances[0].send).toHaveBeenCalledWith(
      objectContaining({
        verbose: true,
      }),
    );
  });

  it('uses reset option when fetching credentials', async () => {
    await cli([...argv, '-R']);
    expect(fetchCredentials).toHaveBeenCalledWith({ reset: true });
  });

  describe('invalid options', () => {
    beforeEach(() => {
      // prevent Commander from littering output
      // with its own calls to console.error
      global.console.error = jest.fn();
    });

    afterEach(() => {
      global.console.error = originalConsoleError;
    });

    it('raises an error when unknown options are passed', async () => {
      await expect(cli([...argv, '-W'])).rejects.toThrow(/exited/i);
      expect(exitOverrideMock.mock.calls[0][0].message).toMatch(/unknown option '-W'/i);
    });

    it('raises an error when options are missing arguments', async () => {
      const args = [...argv];
      args.splice(-1, 1);

      await expect(cli(args)).rejects.toThrow(/exited/i);
      expect(exitOverrideMock.mock.calls[0][0].message)
        .toMatch(/'-H, --htmlpath <value>' argument missing/i);
    });
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
