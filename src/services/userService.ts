import * as bcrypt from 'bcryptjs';
import db from '../db';

export async function findUserByLogin(login: string) {
    const result = await db.query('SELECT * FROM users WHERE login = $login', { login });
    return result.rows[0];
}

export async function createUser(login: string, password: string) {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    await db.query(
        'INSERT INTO users (login, password) VALUES ($login, $password)',
        { login, password: hashedPassword }
    );
}