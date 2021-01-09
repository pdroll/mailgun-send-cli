const path = require('path');
const { exec } = require('child_process');

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

it('prints help text', async () => {
  const result = await cli(['-h']);

  expect(result.code).toBe(0);
  expect(result.stdout).toMatchSnapshot();
});
