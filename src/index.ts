import app from './app';
import { initializeDatabase, environment } from './config';

const port = parseInt(environment.API_PORT);

async function startServer() {
    try {
        // Initialize database tables
        await initializeDatabase();

        // Start the server
        app.listen(port, () => {
            console.log(`Server running on port ${port}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();