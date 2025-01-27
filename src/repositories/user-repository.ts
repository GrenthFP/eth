import { pool } from '../config/database';
import { User } from '../models/user';

export class UserRepository {
    async findByUsername(username: string): Promise<User | null> {
        const query = 'SELECT * FROM users WHERE username = $1';
        const result = await pool.query(query, [username]);
        return result.rows[0] || null;
    }

    async findById(id: number): Promise<User | null> {
        const query = 'SELECT * FROM users WHERE id = $1';
        const result = await pool.query(query, [id]);
        return result.rows[0] || null;
    }

    async createUser(username: string, password: string): Promise<User> {
        const query = `
            INSERT INTO users (username, password)
            VALUES ($1, $2)
            RETURNING *
        `;
        const result = await pool.query(query, [username, password]);
        return result.rows[0];
    }
}