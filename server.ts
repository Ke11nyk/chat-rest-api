import fastifyMultipart from '@fastify/multipart';
import Fastify from 'fastify';
import basicAuth from './plugins/basicAuth';

import accountRoutes from './routes/accountRoutes';
import messageRoutes from './routes/messageRoutes';

const server = Fastify({ logger: true });

server.register(fastifyMultipart, {
    limits: {
      fileSize: 5 * 1024 * 1024 // limit file size to 5MB
    }
  });

// Register basicAuth plugin
server.register(basicAuth);

server.register(async (instance) => {
    // Register routes
    instance.register(accountRoutes);
    // Add a global hook with Basic Auth for other routes
    server.addHook("preHandler", server.authenticate);
    instance.register(messageRoutes);
});

// Start the server
const start = async () => {
    try {
        await server.listen({ port: 3000 });
        console.log('Server listening on port 3000');
    } catch (err) {
        server.log.error(err);
        process.exit(1);
    }
};

start();