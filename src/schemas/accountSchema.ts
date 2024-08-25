export const registerSchema = {
    body: {
        type: 'object',
        required: ['login', 'password'],
        properties: {
            login: { type: 'string' },
            password: { type: 'string' }
        }
    }
};