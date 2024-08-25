import db from '../db';

export async function createTextMessage(user_login: string, content: string) {
    await db.query(
        'INSERT INTO messages (user_id, type, content) \
        SELECT u.id, $type, $content \
        FROM users u \
        WHERE u.login = $user_login;',
        { type: 'text', content, user_login }
    );
}

export async function createFileMessage(user_login: string, file_path: string) {
    await db.query(
        'INSERT INTO messages (user_id, type, file_path) \
        SELECT u.id, $type, $file_path \
        FROM users u \
        WHERE u.login = $user_login;',
        { type: 'file', file_path, user_login }
    );
}

export async function getMessages(page: number, limit: number) {
    const offset = (page - 1) * limit;

    const messagesResult = await db.query(
        'SELECT m.*, u.login as user_login \
        FROM messages m \
        JOIN users u ON m.user_id = u.id \
        ORDER BY m.created_at DESC \
        LIMIT $limit OFFSET $offset;',
        { limit, offset }
    );

    const countResult = await db.query('SELECT COUNT(*) FROM messages;');
    const totalCount = parseInt(countResult.rows[0].count);
    const pageCount = Math.ceil(totalCount / limit);

    return {
        messages: messagesResult.rows.map(msg => ({
            ...msg,
            content: msg.type === 'text' ? msg.content : undefined,
            file_path: msg.type === 'file' ? msg.file_path : undefined
        })),
        totalCount,
        pageCount,
        currentPage: page,
        perPage: limit
    };
}

export async function getMessageById(id: number) {
    const messageResult = await db.query(
        'SELECT type, content, file_path FROM messages WHERE id = $id',
        { id }
    );

    return messageResult.rows[0];
}