import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import fs, { promises as fsp } from 'fs';
import mime from 'mime-types';
import path from 'path';
import util from 'util';
import db from '../db';

const pump = util.promisify(require('stream').pipeline);

import { messageListSchema } from '../schemas/messageListSchema.json';
import { textMessageSchema } from '../schemas/textMessageSchema.json';

export default async function messageRoutes(fastify: FastifyInstance) {
    fastify.route({
        method: 'POST',
        url: '/message/text',
        schema: textMessageSchema,
        /**
         * Можна винести як хук а не навішувати на кожний контроллер
         * Почитай про register
         */
        preHandler: fastify.authenticate,
        handler: async (req: FastifyRequest, res: FastifyReply) => {
            const type = "text";
            const user_login = req.user.login;
            const { content } = req.body as { content: string };

            try {
                // Create new message
                await db.query(
                    'INSERT INTO messages (user_id, type, content)\
                    SELECT u.id, $type, $content\
                    FROM users u\
                    WHERE u.login = $user_login;',
                    { type, content, user_login }
                );

                res.code(201).send({ message: 'Message registered successfully' });
            } catch (error) {
                fastify.log.error(error);
                res.code(500).send({ message: 'Internal Server Error' });
            }
        },
    });

    fastify.route({
        method: 'POST',
        url: '/message/file',
        preHandler: fastify.authenticate,
        handler: async (req: FastifyRequest, res: FastifyReply) => {
            const type = "file";
            const user_login = req.user.login;
            const data = await req.file();
            
            if (!data) {
                res.code(400).send({ error: 'No file uploaded' });
                return;
            }

            try {
                const file_name = `${Date.now()}-${data.filename}`;
                const file_path = path.join('./uploads', file_name);
        
                // Save the file to the specified path
                await pump(data.file, fs.createWriteStream(file_path));
        
                // Create new message
                await db.query(
                    'INSERT INTO messages (user_id, type, file_path)\
                    SELECT u.id, $type, $file_path\
                    FROM users u\
                    WHERE u.login = $user_login;',
                    { type, file_path, user_login }
                );

                res.code(201).send({ message: 'File message registered successfully' });
            } catch (err: any) {
                fastify.log.error(err);
                res.code(500).send({ message: 'Internal Server Error', error: err.message });
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

    
    fastify.route({
        method: 'GET',
        url: '/message/content/:id',
        schema: {
            params: {
                type: 'object',
                properties: {
                    id: { type: 'integer' }
                },
                required: ['id']
            }
        },
        preHandler: fastify.authenticate,
        handler: async (req: FastifyRequest<{
            Params: { id: number }
        }>, res: FastifyReply) => {
            const { id } = req.params;
    
            try {
                const messageResult = await db.query(
                    'SELECT type, content, file_path FROM messages WHERE id = $id',
                    { id }
                );
    
                if (messageResult.rows.length === 0) {
                    return res.code(404).send({ message: 'Message not found' });
                }
    
                const message = messageResult.rows[0];
    
                if (message.type === 'text') {
                    res.header('Content-Type', 'text/plain');
                    return res.code(200).send(message.content);
                } else if (message.type === 'file') {
                    const filePath = path.resolve(message.file_path);
                    
                    // Check if file exists before trying to read it
                    try {
                        await fsp.access(filePath);
                    } catch (error) {
                        fastify.log.error(`File not found: ${filePath}`);
                        return res.code(404).send({ message: 'File not found' });
                    }
    
                    const fileContent = await fsp.readFile(filePath);
                    const mimeType = mime.lookup(filePath) || 'application/octet-stream';
    
                    res.header('Content-Type', mimeType);
                    return res.send(fileContent);
                } else {
                    return res.code(400).send({ message: 'Unsupported message type' });
                }
            } catch (err: any) {
                fastify.log.error(err);
                if (err.code === 'ENOENT') {
                    return res.code(404).send({ message: 'File not found' });
                }
                res.code(500).send({ message: 'Internal Server Error', error: err.message });
            }
        },
    });
}