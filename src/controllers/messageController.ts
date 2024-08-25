import { FastifyReply, FastifyRequest } from 'fastify';
import {
    createFileMessage,
    createTextMessage,
    getMessageById,
    getMessages
} from '../services/messageService';
import { MessageContentParams, MessageListQuery, TextMessageBody } from '../types/message';
import { handleFileUpload, sendFileContent } from '../utils/fileHandler';

export async function sendTextMessage(req: FastifyRequest, res: FastifyReply) {
    const user_login = req.user.login;
    const { content } = req.body as TextMessageBody;

    try {
        await createTextMessage(user_login, content);
        res.code(201).send({ message: 'Message registered successfully' });
    } catch (error) {
        req.log.error(error);
        res.code(500).send({ message: 'Internal Server Error' });
    }
}

export async function sendFileMessage(req: FastifyRequest, res: FastifyReply) {
    const user_login = req.user.login;
    const data = await req.file();
    
    if (!data) {
        return res.code(400).send({ error: 'No file uploaded' });
    }

    try {
        const file_path = await handleFileUpload(data);
        await createFileMessage(user_login, file_path);
        res.code(201).send({ message: 'File message registered successfully' });
    } catch (err: any) {
        req.log.error(err);
        res.code(500).send({ message: 'Internal Server Error', error: err.message });
    }
}

export async function getMessageList(req: FastifyRequest<{ Querystring: MessageListQuery }>, res: FastifyReply) {
    const { page = 1, limit = 20 } = req.query;

    try {
        const result = await getMessages(page, limit);
        res.send(result);
    } catch (err: any) {
        req.log.error(err);
        res.code(500).send({ message: 'Internal Server Error', error: err.message });
    }
}

export async function getMessageContent(req: FastifyRequest<{ Params: MessageContentParams }>, res: FastifyReply) {
    const { id } = req.params;

    try {
        const message = await getMessageById(id);
        if (!message) {
            return res.code(404).send({ message: 'Message not found' });
        }

        if (message.type === 'text') {
            res.header('Content-Type', 'text/plain');
            return res.code(200).send(message.content);
        } else if (message.type === 'file') {
            await sendFileContent(res, message.file_path);
        } else {
            return res.code(400).send({ message: 'Unsupported message type' });
        }
    } catch (err: any) {
        req.log.error(err);
        if (err.code === 'ENOENT') {
            return res.code(404).send({ message: 'File not found' });
        }
        res.code(500).send({ message: 'Internal Server Error', error: err.message });
    }
}