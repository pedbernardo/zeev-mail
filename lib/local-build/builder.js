const fs = require('fs')
const posthtml = require('posthtml')
const { insertAt } = require('posthtml-insert-at')
const chokidar = require('chokidar')
const { compile } = require('../compiler')
const server = require('./server')

require('colors')

const {
  BASE_INDEX,
  BASE_EMAIL,
  FAVICON,
  PLAYGROUND_FOLDER,
  COMPILED_FOLDER
} = require('../config')

function createOutputDirectory (dir) {
  if (fs.existsSync(dir)) return
  fs.mkdirSync(dir)
}

function createFavicon (origin, dest) {
  fs.copyFileSync(origin, `${dest}/favicon.ico`)
}

function createIndex (emails) {
  const baseIndex = fs.readFileSync(BASE_INDEX)
  const navItems = emails.map(({ filename }) =>
    `<li class="zeev-mail-list-item">
      <a href="${filename}">${filename}</a>
    </li>`
  ).join('')

  return posthtml()
    .use(
      insertAt({
        selector: '#nav',
        append: navItems
      })
    )
    .process(baseIndex)
    .then(result => {
      fs.writeFileSync(`${COMPILED_FOLDER}/index.html`, result.html)
    })
}

function createEmails (emails) {
  const baseEmail = fs.readFileSync(BASE_EMAIL)

  return emails.map(email =>
    posthtml()
      .use(
        insertAt({
          selector: '#mail',
          append: email.content
        })
      )
      .process(baseEmail)
      .then(result => {
        fs.writeFileSync(`${COMPILED_FOLDER}/${email.filename}`, result.html)
      })
  )
}

async function build () {
  const emails = await compile({
    inputGlob: `${PLAYGROUND_FOLDER}/*.html`,
    minifyHtml: true,
    sasspath: './styles/external.scss'
  })

  await Promise.all([
    createIndex(emails), ...createEmails(emails)
  ])
}

async function start () {
  createOutputDirectory(COMPILED_FOLDER)
  createFavicon(FAVICON, COMPILED_FOLDER)

  await build()

  server.start()

  chokidar
    .watch(`${PLAYGROUND_FOLDER}/*.html`, {
      ignoreInitial: true
    })
    .on('all', async (event, path) => {
      await build()
      server.refresh()
      console.log('Emails builded!'.green, 'Browser', 'refreshed'.magenta)
    })
}

start()
