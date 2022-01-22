#!/usr/bin/env node

const { Command } = require('commander')
const { compile, save } = require('../lib/compiler')
const pkg = require('../package.json')

const ZeevMail = new Command()
  .version(pkg.version)
  .description('Zeev Mail Compiler')
  .argument('<inputGlob>')
  .option('-d, --debug', 'output extra debugging')
  .option('-w, --watch <watchdir>', 'enable watch directory')
  .option('-s, --sass <sasspath>', 'external SASS file for mail styles')
  .option('-m, --minify', 'minify HTML output')
  .requiredOption('-o, --outdir <outdir>', 'output directory')
  .action(async (inputGlob, options) => {
    if (options.debug) {
      console.error('Zeev Mail called with options %o', options)
    }

    const emails = await compile({
      inputGlob,
      sasspath: options.sass,
      minifyHtml: options.minify || true
    })

    await save({
      emails,
      outdir: options.outdir
    })

    console.log(`emails created on ${options.outdir}`)
  })

ZeevMail.parse(process.argv)
