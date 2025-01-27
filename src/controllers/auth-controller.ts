import { Request, Response } from 'express';
import { AuthService } from '../services/auth-service';
import { UserRepository } from '../repositories/user-repository';

export class AuthController {
    private authService: AuthService;

    constructor() {
        const userRepository = new UserRepository();
        this.authService = new AuthService(userRepository);
    }

    authenticate = async (req: Request, res: Response) => {
        try {
            const { username, password } = req.body;

            if (!username || !password) {
                res.status(400).json({
                    error: 'Username and password are required'
                });
                return;
            }

            const token = await this.authService.authenticate(username, password);

            if (!token) {
                res.status(401).json({
                    error: 'Invalid credentials'
                });
                return;
            }

            res.json({ token });

        } catch (error) {
            console.error('Authentication error:', error);
            if (!res.headersSent) {
                res.status(500).json({
                    error: 'Authentication failed'
                });
            }
        }
    };

    createUser = async (req: Request, res: Response) => {
        try {
            const { username, password } = req.body;

            if (!username || !password) {
                res.status(400).json({
                    error: 'Username and password are required'
                });
                return;
            }

            const user = await this.authService.createUser(username, password);

            if (!user) {
                res.status(409).json({
                    error: 'Username already exists'
                });
                return;
            }

            const token = await this.authService.authenticate(username, password);
            
            res.status(201).json({ 
                message: 'User created successfully',
                token 
            });

        } catch (error) {
            console.error('User creation error:', error);
            if (!res.headersSent) {
                res.status(500).json({
                    error: 'Failed to create user'
                });
            }
        }
    };
}