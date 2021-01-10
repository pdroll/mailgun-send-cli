#!/usr/bin/env node
const runCli = require('../lib/runCli.js');

const exitOverride = (e) => {
  if (['commander.helpDisplayed', 'commander.version'].includes(e.code)) {
    return true;
  }

  throw new Error(e.message);
};

const { argv } = process;

runCli({ argv, exitOverride })
  .then((msg) => {
    console.log(`\n✅  Success!\n\t${msg}`);
  }).catch((e) => {
    // Remove extraneous 'Error:' if present
    const errMsg = `${e.message || e}`.replace(/error:/i, '');
    console.log(`\n🚨  Error:${errMsg}\n`);
    process.exit(1);
  });
