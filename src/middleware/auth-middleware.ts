import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth-service';
import { UserRepository } from '../repositories/user-repository';

export const authMiddleware = (optional: boolean = false) => {
   const userRepository = new UserRepository();
   const authService = new AuthService(userRepository);

   return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
       try {
           const token = req.headers.auth_token as string;

           if (!token && optional) {
               next();
               return;
           }

           if (!token) {
               res.status(401).json({
                   error: 'Authentication token is required' 
               });
               return;
           }

           const decoded = authService.verifyToken(token);
           if (!decoded && !optional) {
               res.status(401).json({
                   error: 'Invalid authentication token'
               });
               return;
           }

           if (decoded) {
               req.user = decoded;
           }

           next();
       } catch (error) {
           next(error);
       }
   };
};