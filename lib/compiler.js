const fs = require('fs')
const path = require('path')
const sass = require('sass')
const juice = require('juice')
const htmlnano = require('htmlnano')

const {
  HTML_NANO_OPTIONS,
  POST_HTML_OPTIONS
} = require('./config')

function cssInline (content, styles) {
  const allStyles = `<style>${styles.join('')}</style>`

  return juice(`${allStyles}${content}`)
}

function htmlMinify (content) {
  return htmlnano
    .process(
      content,
      HTML_NANO_OPTIONS,
      {},
      POST_HTML_OPTIONS
    )
}

function resolveExternalSass (sasspath) {
  return sasspath
    ? sass.compile(sasspath, { style: 'compressed' })?.css
    : ''
}

exports.compile = async function ({ inputdir, sasspath }) {
  // @todo deixar CSS de dist na memória
  const styles = fs.readFileSync('dist/zeev-mail.css').toString()
  const externalStyles = resolveExternalSass(sasspath)

  const contents = await Promise.all(
    fs.readdirSync(inputdir)
      .filter(filename => path.extname(filename) === '.html')
      .map(async filename => ({
        filename,
        content: await htmlMinify(
          fs.readFileSync(`${inputdir}/${filename}`).toString()
        )
      }))
  )

  const emails = contents.map(({ filename, content }) => ({
    filename,
    content: cssInline(content.html, [styles, externalStyles])
  }))

  return emails
}

exports.save = function ({ emails, outdir }) {
  emails.forEach(email =>
    fs.writeFileSync(`${outdir}/${email.filename}`, email.content)
  )
}
