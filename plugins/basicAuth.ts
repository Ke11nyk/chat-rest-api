import bcrypt from 'bcrypt';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import db from '../db';

export default async function basicAuth(fastify: FastifyInstance) {
    fastify.decorate('authenticate', async (req: FastifyRequest, res: FastifyReply) => {
        try {
            const auth = req.headers.authorization;
            if (!auth || !auth.startsWith('Basic ')) {
                throw new Error('No credentials provided');
            }

            const [login, password] = Buffer.from(auth.split(' ')[1], 'base64').toString().split(':');

            const result = await db.query('SELECT * FROM users WHERE login = $login', { login });
            const user = result.rows[0];
            if (!user) {
                throw new Error('Authentication failed');
            }

            const isValid = await bcrypt.compare(password, user.password);
            if (!isValid) {
                throw new Error('Authentication failed');
            }

            req.user = user; // Attach user to request
        } catch (err) {
            res.code(401).send({ error: 'Authentication required' });
        }
    });
}

declare module 'fastify' {
    interface FastifyInstance {
        authenticate: (req: FastifyRequest, res: FastifyReply) => Promise<void>;
    }
    interface FastifyRequest {
        user?: any; 
    }
}