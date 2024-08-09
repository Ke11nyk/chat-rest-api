const fastify = require('fastify');

const server = fastify({ logger: true });

server.get('/', async (request, reply) => {
  reply.send({ hello: 'world' });
});

async function start() {
  try {
    await server.listen({ port: 3000 });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

start();