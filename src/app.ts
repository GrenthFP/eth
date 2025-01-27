import express from 'express';
import { authRoutes, transactionRoutes } from './routes';

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use('/lime', authRoutes);
app.use('/lime', transactionRoutes);

export default app