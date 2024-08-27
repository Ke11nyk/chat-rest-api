import fastifyMultipart from '@fastify/multipart';
import Fastify from 'fastify';
import basicAuth from './plugins/basicAuth';

import accountRoutes from './routes/accountRoutes';
import messageRoutes from './routes/messageRoutes';

import {
  FileNotFoundError,
  InternalServerError,
  MessageNotFoundError,
  NoFileUploadedError,
  UnsupportedMessageTypeError,
  UserExistsError
} from './errors/customErrors';

const server = Fastify({ logger: true });

// Limit file size to 5MB
server.register(fastifyMultipart, {
    limits: {
      fileSize: 5 * 1024 * 1024
    }
});

// Register basicAuth plugin
server.register(basicAuth);

server.register(async (instance) => {
    // Hook with basicAuth for all routes except /account/register
    server.addHook("onRequest", async (request, reply) => {
        const publicRoutes = ['/account/register'];
        if (!publicRoutes.includes(request.url)) return server.authenticate(request, reply);
      });

    // Register routes
    instance.register(accountRoutes);
    instance.register(messageRoutes);
});

// Error handling
server.setErrorHandler((error, request, reply) => {
    request.log.error(error);
    
    if (error instanceof UserExistsError) {
      reply.status(400).send({ message: error.message });
    } else if (error instanceof InternalServerError) {
      reply.status(500).send({ message: 'Internal Server Error' });
    } else if (error instanceof NoFileUploadedError) {
      reply.status(400).send({ message: error.message });
    } else if (error instanceof MessageNotFoundError) {
      reply.status(404).send({ message: error.message });
    } else if (error instanceof UnsupportedMessageTypeError) {
      reply.status(400).send({ message: error.message });
    } else if (error instanceof FileNotFoundError) {
      reply.status(404).send({ message: error.message });
    } else {
      reply.status(500).send({ message: 'An unexpected error occurred' });
    }
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