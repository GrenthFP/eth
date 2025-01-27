import { Pool } from 'pg';
import { environment } from './environment';

export const pool = new Pool({
    connectionString: environment.DB_CONNECTION_URL
});

// Test the connection
pool.connect()
    .then(() => console.log('Connected to PostgreSQL database'))
    .catch(err => console.error('Database connection error:', err));