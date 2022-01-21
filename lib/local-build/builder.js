const fs = require('fs')
const posthtml = require('posthtml')
const { insertAt } = require('posthtml-insert-at')
const chokidar = require('chokidar')
const { compile } = require('../compiler')
const server = require('./server')

const {
  BASE_INDEX,
  BASE_EMAIL,
  FAVICON,
  PLAYGROUND_FOLDER,
  COMPILED_FOLDER
} = require('../config')

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
      console.log('index created')
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
        console.log('email created')
      })
  )
}

async function build () {
  const emails = await compile({
    inputdir: PLAYGROUND_FOLDER
  })

  await Promise.all([
    createIndex(emails), ...createEmails(emails)
  ])
}

fs.copyFileSync(FAVICON, `${COMPILED_FOLDER}/favicon.ico`)
server.start()

chokidar
  .watch(`${PLAYGROUND_FOLDER}/*.html`, {
    ignoreInitial: true
  })
  .on('all', async (event, path) => {
    console.log(event, path)

    await build()

    console.log('build done')

    // server.refresh()
  })
