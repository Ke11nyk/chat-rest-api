import { FastifyInstance } from 'fastify';
import { registerUser } from '../controllers/accountController';
import { registerSchema } from '../schemas/accountSchema';

export default async function accountRoutes(fastify: FastifyInstance) {
    fastify.route({
        method: 'POST',
        url: '/account/register',
        schema: registerSchema,
        handler: registerUser
    });
}