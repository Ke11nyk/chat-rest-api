import { FastifyReply, FastifyRequest } from 'fastify';
import { InternalServerError, UserExistsError } from '../errors/customErrors';
import { createUser, findUserByLogin } from '../services/userService';
import { RegisterRequestBody } from '../types/account';

export async function registerUser(req: FastifyRequest, res: FastifyReply) {
    const { login, password } = req.body as RegisterRequestBody;

    try {
        const existingUser = await findUserByLogin(login);
        if (existingUser) throw new UserExistsError('User already exists');

        await createUser(login, password);
        return res.code(200).send({ message: 'User registered successfully' });
    } catch (err: any) {
        if (err instanceof UserExistsError) throw err; // Let Fastify handle this error
        req.log.error(err);
        throw new InternalServerError('An unexpected error occurred');
    }
}