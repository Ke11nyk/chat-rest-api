import Fastify from 'fastify';
import basicAuth from './plugins/basicAuth';
import accountRoutes from './routes/accountRoutes';

const fastify = Fastify({ logger: true });

fastify.register(basicAuth);
fastify.register(accountRoutes);

// Start a server
const start = async () => {
    try {
        await fastify.listen({port: 3000});
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};
start();