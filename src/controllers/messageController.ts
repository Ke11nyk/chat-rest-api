import { FastifyReply, FastifyRequest } from 'fastify';
import {
    FileNotFoundError,
    MessageNotFoundError,
    NoFileUploadedError,
    UnsupportedMessageTypeError
} from '../errors/customErrors';
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

    await createTextMessage(user_login, content);
    res.code(201).send({ message: 'Message registered successfully' });
}

export async function sendFileMessage(req: FastifyRequest, res: FastifyReply) {
    const user_login = req.user.login;
    const data = await req.file();

    if (!data) {
        throw new NoFileUploadedError();
    }

    const file_path = await handleFileUpload(data);
    await createFileMessage(user_login, file_path);
    res.code(201).send({ message: 'File message registered successfully' });
}

export async function getMessageList(req: FastifyRequest<{ Querystring: MessageListQuery }>, res: FastifyReply) {
    const { page = 1, limit = 20 } = req.query;

    const result = await getMessages(page, limit);
    res.send(result);
}

export async function getMessageContent(req: FastifyRequest<{ Params: MessageContentParams }>, res: FastifyReply) {
    const { id } = req.params;

    const message = await getMessageById(id);
    if (!message) {
        throw new MessageNotFoundError();
    }

    if (message.type === 'text') {
        res.header('Content-Type', 'text/plain');
        return res.code(200).send(message.content);
    } else if (message.type === 'file') {
        try {
            await sendFileContent(res, message.file_path);
        } catch (err: any) {
            if (err.code === 'ENOENT') {
                throw new FileNotFoundError();
            }
            throw err;
        }
    } else {
        throw new UnsupportedMessageTypeError();
    }
}