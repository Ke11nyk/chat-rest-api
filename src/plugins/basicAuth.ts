import * as bcrypt from 'bcryptjs';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';
import db from '../db';

async function basicAuth(fastify: FastifyInstance) {
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
                throw new Error('Incorrect login or password');
            }

            const isValid = await bcrypt.compare(password, user.password);
            if (!isValid) {
                throw new Error('Incorrect login or password');
            }

            req.user = user; // Attach user to request
        } catch (err: any) {
            res.code(401).send({ error: 'Authentication failed', message: err.message });
        }
    });
}

export default fp(basicAuth, { name: 'basicAuth' });

declare module 'fastify' {
    interface FastifyInstance {
        authenticate: (req: FastifyRequest, res: FastifyReply) => Promise<void>;
    }
    interface FastifyRequest {
        user?: any;
    }
}