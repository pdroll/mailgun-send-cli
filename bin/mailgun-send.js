#!/usr/bin/env node
const runCli = require('../lib/runCli.js');

runCli(process.argv)
  .then((msg) => {
    console.log(`\n✅  Success!\n\t${msg}`);
  }).catch((e) => {
    // Remove extraneous 'Error:' if present
    const errMsg = `${e}`.replace('Error:', '');
    console.log(`\n🚨  Error:${errMsg}\n`);
    process.exit(1);
  });
