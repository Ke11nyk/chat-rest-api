import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import db from '../db';

import { messageListSchema } from '../schemas/messageSchema.json';
import { textMessageSchema } from '../schemas/textMessageSchema.json';

export default async function messageRoutes(fastify: FastifyInstance) {
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

    fastify.route({
        method: 'GET',
        url: '/message/list',
        schema: messageListSchema,
        preHandler: fastify.authenticate,
        handler: async (req: FastifyRequest<{
          Querystring: { page?: number; limit?: number }
        }>, res: FastifyReply) => {
          const { page = 1, limit = 20 } = req.query;
          const offset = (page - 1) * limit;
    
          try {
            // Get messages with pagination
            const messagesResult = await db.query(
              'SELECT m.*, u.login as user_login \
               FROM messages m \
               JOIN users u ON m.user_id = u.id \
               ORDER BY m.created_at DESC \
               LIMIT $limit OFFSET $offset;',
              { limit, offset }
            );
    
            // Get total count of messages
            const countResult = await db.query('SELECT COUNT(*) FROM messages;');
            const totalCount = parseInt(countResult.rows[0].count);
    
            const pageCount = Math.ceil(totalCount / limit);
    
            res.send({
              messages: messagesResult.rows.map(msg => ({
                ...msg,
                content: msg.type === 'text' ? msg.content : undefined,
                file_path: msg.type === 'file' ? msg.file_path : undefined
              })),
              totalCount,
              pageCount,
              currentPage: page,
              perPage: limit
            });
          } catch (err: any) {
            fastify.log.error(err);
            res.code(500).send({ message: 'Internal Server Error', error: err.message });
          }
        },
    });
}