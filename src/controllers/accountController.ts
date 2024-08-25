import { FastifyReply, FastifyRequest } from 'fastify';
import { createUser, findUserByLogin } from '../services/userService';
import { RegisterRequestBody } from '../types/account';

export async function registerUser(req: FastifyRequest, res: FastifyReply) {
    const { login, password } = req.body as RegisterRequestBody;

    try {
        const existingUser = await findUserByLogin(login);
        if (existingUser) {
            return res.code(400).send({ message: 'User already exists' });
        }

        await createUser(login, password);
        return res.code(200).send({ message: 'User registered successfully' });
    } catch (err: any) {
        req.log.error(err);
        return res.code(500).send({ message: 'Internal Server Error', error: err.message });
    }
}