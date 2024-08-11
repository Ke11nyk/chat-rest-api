import Fastify from 'fastify';
import basicAuth from './plugins/basicAuth';
import accountRoutes from './routes/accountRoutes';
import messageRoutes from './routes/messageRoutes';

const fastify = Fastify({ logger: true });

// Register basicAuth plugin
fastify.register(basicAuth);

fastify.register(async (instance) => {
    // Register routes
    instance.register(accountRoutes);
    // Add a global hook with Basic Auth for other routes
    fastify.addHook("preHandler", fastify.authenticate);
    instance.register(messageRoutes);

    // Add the test route with authentication
    instance.get('/test', {
        preHandler: instance.authenticate
    }, async (request, reply) => {
        reply.send("Test authenticated route");
    });
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