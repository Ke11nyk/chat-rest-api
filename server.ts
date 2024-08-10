const fastify = require('fastify');

const server = fastify({ logger: true });

server.get('/', async() => {
  return 'ok'
})

server.listen({ port: 3000 }, (err: Error, address: string) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(`Server listening at ${address}`)
})

module.exports = { server };