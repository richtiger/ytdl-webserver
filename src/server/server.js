const Hapi = require('@hapi/hapi')
const Inert = require('@hapi/inert')
const mkdirp = require('mkdirp')
const path = require('path')
const youtube = require('./handlers/youtube')

const server = new Hapi.Server({
  port: process.env.PORT || 3000,
  routes: {
    files: {
      relativeTo: path.join(__dirname, '../../public')
    }
  }
})

const provision = async () => {
  await server.register(Inert)

  // TODO add notifications to app
  // TODO remove duplicate downloads from ui
  server.route({
    method: 'GET',
    path: '/{path*}',
    handler: {
      directory: {
        path: '.',
        listing: false,
        index: true
      }
    }
  })

  server.route({
    method: 'POST',
    path: '/download',
    handler: (request) => {
      const url = request.payload.url
      const options = {
        path: path.join(__dirname, '../../public/temp'),
        audioOnly: false
      }

      mkdirp(options.path, err => {
        if (err) {
          throw err
        }
      })

      return youtube.download(url, options)
    }
  })

  server.route({
    method: 'GET',
    path: '/request/{video}',
    handler: (request, h) => {
      const videoName = encodeURIComponent(request.params.video)
      return h.file(path.join('temp', decodeURIComponent(videoName)))
    }
  })

  await server.start()

  console.log('Server running at:', server.info.uri)
}

provision()
