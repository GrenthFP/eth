import jwt from 'jsonwebtoken';
import { User } from '../models/user';
import { IAuthService, IUserRepository } from '../interfaces/auth.interface';
import { environment } from '../config/environment';

export class AuthService implements IAuthService {
    constructor(private readonly userRepository: IUserRepository) {}

    async authenticate(username: string, password: string): Promise<string | null> {
        const user = await this.userRepository.findByUsername(username);

        if (!user || user.password !== password) {
            return null;
        }

        return this.generateToken(user);
    }

    verifyToken(token: string): any {
        try {
            return jwt.verify(token, environment.JWT_SECRET);
        } catch (error) {
            return null;
        }
    }

    async createUser(username: string, password: string): Promise<User | null> {
        const existingUser = await this.userRepository.findByUsername(username);
        if (existingUser) {
            return null;
        }

        return this.userRepository.createUser(username, password);
    }

    private generateToken(user: User): string {
        return jwt.sign(
            { 
                userId: user.id,
                username: user.username 
            },
            environment.JWT_SECRET,
            { expiresIn: '24h' }
        );
    }
}