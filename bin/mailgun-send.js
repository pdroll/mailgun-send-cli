#!/usr/bin/env node
const runCli = require('../lib/runCli.js');

const { argv } = process;

// Suppress commander error logging,
// since we're handling them ourselves
global.console.error = () => {};

const exitOverride = (e) => {
  // Don't treat help or version commands as errors
  if (['commander.helpDisplayed', 'commander.version'].includes(e.code)) {
    process.exit(0);
  }

  throw new Error(e.message);
};

(async () => {
  try {
    const msg = await runCli({ argv, exitOverride });
    console.log(`\n✅  Success!\n\t${msg}`);
  } catch (e) {
    // Remove extraneous 'Error:' if present
    const errMsg = `${e.message || e}`.replace(/error:/i, '');
    console.log(`\n🚨  Error:${errMsg}\n`);
    process.exit(1);
  }
})();
