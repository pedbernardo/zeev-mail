const fs = require('fs')
const path = require('path')
const sass = require('sass')
const juice = require('juice')
const glob = require('glob')
const htmlnano = require('htmlnano')

const {
  HTML_NANO_OPTIONS,
  POST_HTML_OPTIONS,
  LOCAL_STYLES
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

exports.compile = async function ({ inputGlob, sasspath, minifyHtml }) {
  const EXTERNAL_STYLES = resolveExternalSass(sasspath)
  const INPUT_FILES = glob.sync(inputGlob)

  const contents = await Promise.all(
    INPUT_FILES
      .filter(filepath => path.extname(filepath) === '.html')
      .map(async filepath => {
        const filename = path.basename(filepath)
        const filecontent = fs.readFileSync(filepath).toString()

        return {
          filename,
          content: minifyHtml
            ? await htmlMinify(filecontent)
            : filecontent
        }
      })
  )

  const emails = contents.map(({ filename, content }) => ({
    filename,
    content: cssInline(content.html, [LOCAL_STYLES, EXTERNAL_STYLES])
  }))

  return emails
}

exports.save = function ({ emails, outdir }) {
  const OUTPUT_DIR = `./${outdir}`

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR)
  }

  emails.forEach(email =>
    fs.writeFileSync(`${OUTPUT_DIR}/${email.filename}`, email.content)
  )
}
