import dotenv from 'dotenv';

dotenv.config();

export const environment = {
    API_PORT: process.env.API_PORT || '3000',
    ETH_NODE_URL: process.env.ETH_NODE_URL || '',
    DB_CONNECTION_URL: process.env.DB_CONNECTION_URL || '',
    JWT_SECRET: process.env.JWT_SECRET || 'default-secret-key-do-not-use-in-production'
};