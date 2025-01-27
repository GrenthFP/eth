import { Request, Response } from 'express';
import { EthereumService } from '../services/ethereum-service';
import { TransactionRepository } from '../repositories/transaction-repository';
import { AuthService } from '../services/auth-service';
import { Transaction } from '../models/transaction';
import { UserRepository } from '../repositories';
import { decodeRlpTransactionHashes } from '../utils/rlp';

export class TransactionController {
    private ethereumService: EthereumService;
    private transactionRepository: TransactionRepository;
    private userRepository = new UserRepository();
    private authService: AuthService;

    constructor() {
        this.ethereumService = new EthereumService();
        this.transactionRepository = new TransactionRepository();
        this.authService = new AuthService(this.userRepository);
    }

    private async processTransaction(hash: string, userId?: number): Promise<Transaction | null> {
        try {
            const existingTransaction = await this.transactionRepository.findByHash(hash);
            if (existingTransaction) {
                if (userId) {
                    await this.transactionRepository.trackUserTransaction(userId, hash);
                }
                return existingTransaction;
            }

            const ethTransaction = await this.ethereumService.getTransaction(hash);
            const savedTransaction = await this.transactionRepository.findOrCreate(ethTransaction);
            
            if (userId) {
                await this.transactionRepository.trackUserTransaction(userId, hash);
            }

            return savedTransaction;
        } catch (error) {
            console.error(`Error processing transaction ${hash}:`, error);
            return null;
        }
    }

    getTransactions = async (req: Request, res: Response) => {
        try {
            // Handle optional authentication
            const authToken = req.headers.auth_token as string;
            let userId: number | null = null;
            
            if (authToken) {
                const decoded = this.authService.verifyToken(authToken);
                if (decoded) {
                    userId = decoded.userId;
                }
            }

            const transactionHashes = req.query.transactionHashes;
            
            if (!transactionHashes) {
                res.status(400).json({ 
                    error: 'Missing required query parameter: transactionHashes' 
                });
                return;
            }

            const hashes: string[] = (Array.isArray(transactionHashes) 
                ? transactionHashes 
                : [transactionHashes]).map(hash => String(hash));

            const validHashes = hashes.every(hash => 
                typeof hash === 'string' && 
                hash.match(/^0x[0-9a-fA-F]{64}$/)
            );

            if (!validHashes) {
                res.status(400).json({ 
                    error: 'Invalid transaction hash format. Must be a hex string starting with 0x' 
                });
                return;
            }

            const transactions = await Promise.all(
                hashes.map(hash => this.processTransaction(hash, userId ? userId : undefined))
            );

            const validTransactions = transactions.filter((t): t is Transaction => t !== null);
            res.json({ transactions: validTransactions });

        } catch (error) {
            console.error('Error in getTransactions:', error);
            if (!res.headersSent) {
                res.status(500).json({ 
                    error: 'An unexpected error occurred' 
                });
            }
        }
    };

    getUserTransactions = async (req: Request, res: Response) => {
        try {
            // req.user is guaranteed by middleware
            const transactions = await this.transactionRepository.getUserTransactions(req.user!.userId);
            res.json({ transactions });
        } catch (error) {
            if (!res.headersSent) {
                res.status(500).json({ error: 'An unexpected error occurred' });
            }
        }
    };

    getAllTransactions = async (_req: Request, res: Response) => {
        try {
            const transactions = await this.transactionRepository.findAll();
            if (!transactions.length) {
                res.status(404).json({ message: 'No transactions found' });
                return;
            }
            res.json({ transactions });
        } catch (error) {
            console.error('Error in getAllTransactions:', error);
            if (!res.headersSent) {
                res.status(500).json({ 
                    error: 'An unexpected error occurred' 
                });
            }
        }
    };

    getRlpTransactions = async (req: Request, res: Response) => {
        try {            const { rlphex } = req.params;

            const authToken = req.headers.auth_token as string;
            let userId: number | null = null;
            
            if (authToken) {
                const decoded = this.authService.verifyToken(authToken);
                if (decoded) {
                    userId = decoded.userId;
                }
            }

            if (!rlphex) {
                res.status(400).json({ error: 'Missing RLP hex data' });
                return;
            }
            const transactionHashes = decodeRlpTransactionHashes(rlphex);
            const transactions = await Promise.all(
                transactionHashes.map(hash => this.processTransaction(hash, userId ? userId : undefined))
            );

            const validTransactions = transactions.filter((t): t is Transaction => t !== null);
            res.json({ transactions: validTransactions });
        } catch (error) {
            res.status(400).json({ error: 'Invalid RLP data' });
        }
    };
}