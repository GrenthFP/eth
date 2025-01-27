import { Transaction } from '../models/transaction';

export interface IEthereumService {
    getTransaction(txHash: string): Promise<any>;  // Update return type based on your implementation
}

export interface ITransactionRepository {
    findOrCreate(transaction: Transaction): Promise<Transaction>;
    findAll(): Promise<Transaction[]>;
    findByHash(hash: string): Promise<Transaction | null>;
}

export interface ITransactionService {
    getTransactions(hashes: string[]): Promise<Transaction[]>;
    getAllTransactions(): Promise<Transaction[]>;
}

