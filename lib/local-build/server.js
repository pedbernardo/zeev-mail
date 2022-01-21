const { COMPILED_FOLDER } = require('../config')
const liveServer = require('live-server')

function start () {
  liveServer.start({
    root: COMPILED_FOLDER,
    logLevel: 2
  })
}

function refresh () {
  liveServer
    .watcher
    ._events
    .change(`${COMPILED_FOLDER}/index.html`)
}

module.exports = {
  server: liveServer,
  start,
  refresh
}
