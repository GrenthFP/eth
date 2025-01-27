import { pool } from '../config/database';

const createTablesQuery = `
    CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        "transactionHash" VARCHAR(66) UNIQUE NOT NULL,
        "transactionStatus" INTEGER NOT NULL,
        "blockHash" VARCHAR(66) NOT NULL,
        "blockNumber" BIGINT NOT NULL,
        "from" VARCHAR(42) NOT NULL,
        "to" VARCHAR(42),
        "contractAddress" VARCHAR(42),
        "logsCount" INTEGER NOT NULL,
        input TEXT NOT NULL,
        value VARCHAR NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS user_transactions (
        user_id INTEGER REFERENCES users(id),
        transaction_hash VARCHAR(66) REFERENCES transactions("transactionHash"),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, transaction_hash)
    );

    MERGE INTO users AS target
    USING (
        VALUES
            ('alice', 'alice'),
            ('bob', 'bob'),
            ('carol', 'carol'),
            ('dave', 'dave')
    ) AS source ("username", "password")
    ON target."username" = source."username"
    WHEN NOT MATCHED THEN
        INSERT ("username", "password")
        VALUES (source."username", source."password");

`;

export async function initializeDatabase() {
    try {
        await pool.query(createTablesQuery);
        console.log('Database tables initialized successfully');
    } catch (error) {
        console.error('Error initializing database tables:', error);
        throw error;
    }
}