import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import db from '../db';
import { textMessageSchema } from '../schemas/textMessageSchema.json';

export default async function textMessageRoutes(fastify: FastifyInstance) {
    fastify.route({
        method: 'POST',
        url: '/message/text',
        schema: textMessageSchema,
        handler: async (req: FastifyRequest, res: FastifyReply) => {
            const { content } = req.body as { content: string };
            const type = "text";
            const user_login = req.user.login;

            try {
                // Create new message
                await db.query(
                    'INSERT INTO messages (user_id, type, content)\
                     SELECT u.id, $type, $content\
                     FROM users u\
                     WHERE u.login = $user_login;',
                    { type, content, user_login }
                );

                res.send({ message: 'Message registered successfully' });
            } catch (error) {
                fastify.log.error(error);
                res.code(500).send({ message: 'Internal Server Error' });
            }
        },
    });
}