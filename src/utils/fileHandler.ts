import { FastifyReply } from 'fastify';
import fs, { promises as fsp } from 'fs';
import mime from 'mime-types';
import path from 'path';
import util from 'util';

const pump = util.promisify(require('stream').pipeline);

export async function handleFileUpload(data: any) {
    const file_name = `${Date.now()}-${data.filename}`;
    const dir = './uploads';

    if (!fs.existsSync(dir)) fs.mkdirSync(dir);

    const file_path = path.join(dir, file_name);

    await pump(data.file, fs.createWriteStream(file_path));

    return file_path;
}

export async function sendFileContent(res: FastifyReply, filePath: string) {
    const resolvedPath = path.resolve(filePath);
    
    try {
        await fsp.access(resolvedPath);
    } catch (error) {
        throw new Error('File not found');
    }

    const fileContent = await fsp.readFile(resolvedPath);
    const mimeType = mime.lookup(resolvedPath) || 'application/octet-stream';

    res.header('Content-Type', mimeType);
    return res.send(fileContent);
}