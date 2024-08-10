import helloRoute from './routes/helloRoute';

const fastify = require('fastify');

const server = fastify();

// Виклик функції з модуля helloRoute
helloRoute(server);

server.listen({port: 3000}, (err: Error, address: string) => {
    if (err) {
        console.error('Error starting server:', err);
        process.exit(1);
    }
    console.log(`Server listening on ${address}`);
});