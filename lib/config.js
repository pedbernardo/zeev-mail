const fs = require('fs')
const path = require('path')

exports.BASE_INDEX = './lib/local-build/templates/index.html'
exports.BASE_EMAIL = './lib/local-build/templates/mail.html'
exports.FAVICON = './lib/local-build/templates/favicon.ico'
exports.PLAYGROUND_FOLDER = './playground'
exports.COMPILED_FOLDER = './compiled'
exports.LOCAL_STYLES = fs.readFileSync(path.resolve(__dirname, '../dist/zeev-mail.css')).toString()

exports.HTML_NANO_OPTIONS = {
  collapseWhitespace: true,
  removeComments: true,
  removeRedundantAttributes: true,
  removeOptionalTags: true
}

exports.POST_HTML_OPTIONS = {
  lowerCaseTags: true,
  quoteAllAttributes: false
}
