import { User } from "../models/user";

export interface IUserRepository {
    findByUsername(username: string): Promise<User | null>;
    createUser(username: string, password: string): Promise<User>;
}

export interface IAuthService {
    authenticate(username: string, password: string): Promise<string | null>;
    verifyToken(token: string): any;
    createUser(username: string, password: string): Promise<User | null>;
}