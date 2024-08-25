export const textMessageSchema = {
    body: {
        type: 'object',
        required: ['content'],
        properties: {
            content: { type: 'string' }
        }
    }
};

export const messageListSchema = {
    querystring: {
        type: 'object',
        properties: {
            page: { type: 'number' },
            limit: { type: 'number' }
        }
    }
};