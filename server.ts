import fastifyMultipart from '@fastify/multipart';
import Fastify from 'fastify';
import basicAuth from './plugins/basicAuth';

import accountRoutes from './routes/accountRoutes';
import fileMessageRoutes from './routes/fileMessageRoutes';
import textMessageRoutes from './routes/textMessageRoutes';

const fastify = Fastify({ logger: true });

fastify.register(fastifyMultipart, {
    limits: {
      fileSize: 5 * 1024 * 1024 // for example, limit file size to 5MB
    }
  });

// Register basicAuth plugin
fastify.register(basicAuth);

fastify.register(async (instance) => {
    // Register routes
    instance.register(accountRoutes);
    // Add a global hook with Basic Auth for other routes
    fastify.addHook("preHandler", fastify.authenticate);
    instance.register(textMessageRoutes);
    instance.register(fileMessageRoutes);
});

// Start the server
const start = async () => {
    try {
        await fastify.listen({ port: 3000 });
        console.log('Server listening on port 3000');
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();