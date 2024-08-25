import { FastifyInstance } from 'fastify';
import {
    getMessageContent,
    getMessageList,
    sendFileMessage,
    sendTextMessage
} from '../controllers/messageController';
import { messageListSchema, textMessageSchema } from '../schemas/messageSchemas';

export default async function messageRoutes(fastify: FastifyInstance) {
    fastify.route({
        method: 'POST',
        url: '/message/text',
        schema: textMessageSchema,
        handler: sendTextMessage
    });

    fastify.route({
        method: 'POST',
        url: '/message/file',
        handler: sendFileMessage
    });

    fastify.route({
        method: 'GET',
        url: '/message/list',
        schema: messageListSchema,
        handler: getMessageList
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
        handler: getMessageContent
    });
}