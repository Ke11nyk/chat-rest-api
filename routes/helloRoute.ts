import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { postSchema } from '../schemas/helloSchema.json';

export default async function helloRoute(fastify: FastifyInstance) {
    fastify.route({
        method: 'GET',
        url: '/hello',
        handler: async (req: FastifyRequest, res: FastifyReply) => {
            res.send({ message: 'Hello, world!' });
        },
    });

    fastify.route({
        method: 'POST',
        url: '/hello',
        schema: postSchema,
        handler: async (req: FastifyRequest, res: FastifyReply) => {
            const { name } = req.body as { name: string };
            res.send({ message: `Hello, ${name}!` });
        },
    });
}