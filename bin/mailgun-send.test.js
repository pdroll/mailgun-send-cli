const path = require('path');
const { exec } = require('child_process');
const { version } = require('../package.json');

const cli = (args) => new Promise((resolve) => {
  exec(`node ${path.resolve('bin/mailgun-send.js')} ${args.join(' ')}`,
    { cwd: '.' },
    (error, stdout, stderr) => {
      resolve({
        code: error && error.code ? error.code : 0,
        error,
        stdout,
        stderr,
      });
    });
});

describe('help option', () => {
  it('returns a zero code', async () => {
    const result = await cli(['-h']);

    expect(result.code).toBe(0);
  });

  it('prints help text', async () => {
    const result = await cli(['-h']);

    expect(result.stdout).toMatchSnapshot();
  });
});

describe('version option', () => {
  it('returns a zero code', async () => {
    const result = await cli(['-V']);

    expect(result.code).toBe(0);
  });

  it('prints the version from the package.json file', async () => {
    const result = await cli(['-V']);

    expect(result.stdout).toMatch(version);
  });
});

describe('error handling', () => {
  it('returns error code of 1', async () => {
    const result = await cli(['-t error']);
    expect(result.code).toBe(1);
  });

  it('prints a friendly error message for commander errors', async () => {
    const result = await cli(['-W']);
    expect(result.stdout).toMatch(/🚨 {2}Error:/);
    expect(result.stdout).toMatch(/unknown option/i);
  });

  it('prints a friendly error message for mailgun errors', async () => {
    const result = await cli(['-t notanemail']);
    expect(result.stdout).toMatch(/🚨 {2}Error:/);
    expect(result.stdout).toMatch(/to is not a valid email/i);
    expect(result.stdout).toMatch(/text or htmlpath must be provided/i);
  });
});
