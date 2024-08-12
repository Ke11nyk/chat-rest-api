import bcrypt from 'bcrypt';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import db from '../db';
import { registerSchema } from '../schemas/accountSchema.json';

export default async function accountRoutes(fastify: FastifyInstance) {
    fastify.route({
        method: 'POST',
        url: '/account/register',
        schema: registerSchema,
        handler: async (req: FastifyRequest, res: FastifyReply) => {
            const { login, password } = req.body as { login: string; password: string };

            try {
                // Check if user already exists
                const existingUser = await db.query('SELECT * FROM users WHERE login = $login', { login });
                if (existingUser.rows.length > 0) {
                    res.code(400).send({ message: 'User already exists' });
                    return;
                }

                // Hash the password
                const saltRounds = 10;
                const hashedPassword = await bcrypt.hash(password, saltRounds);

                // Create new user
                await db.query(
                    'INSERT INTO users (login, password) VALUES ($login, $password)',
                    { login, password: hashedPassword }
                );

                res.send({ message: 'User registered successfully' });
            } catch (err: any) {
                fastify.log.error(err);
                res.code(500).send({ message: 'Internal Server Error', error: err.message });
            }
        },
    });
}