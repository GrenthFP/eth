import { pool } from '../config/database';
import { ITransactionRepository } from '../interfaces/transaction.interface';
import { Transaction } from '../models/transaction';

export class TransactionRepository implements ITransactionRepository {
   async findOrCreate(transaction: Transaction): Promise<Transaction> {
    const existingTransaction = await this.findByHash(transaction.transactionHash);
        if (existingTransaction) {
            return existingTransaction;
        }

        // If it doesn't exist, save it
        return this.save(transaction);
    }   

    async save (transaction: Transaction): Promise<Transaction> {
       const query = `
           INSERT INTO transactions (
                "transactionHash",
                "transactionStatus",
                "blockHash",
                "blockNumber",
                "from",
                "to",
                "contractAddress",
                "logsCount",
                input,
                value
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *;
       `;

       const values = [
           transaction.transactionHash,
           transaction.transactionStatus,
           transaction.blockHash,
           transaction.blockNumber,
           transaction.from,
           transaction.to,
           transaction.contractAddress,
           transaction.logsCount,
           transaction.input,
           transaction.value
       ];

       const result = await pool.query(query, values);
       return result.rows[0];
    }

   async findAll(): Promise<Transaction[]> {
       const result = await pool.query('SELECT * FROM transactions ORDER BY id DESC');
       return result.rows;
   }

   async findByHash(hash: string): Promise<Transaction | null> {
       const query = 'SELECT * FROM transactions WHERE "transactionHash" = $1';
       const result = await pool.query(query, [hash]);
       return result.rows[0] || null;
   }

   async trackUserTransaction(userId: number, transactionHash: string): Promise<void> {
    const query = `
        INSERT INTO user_transactions (user_id, transaction_hash)
        VALUES ($1, $2)
        ON CONFLICT (user_id, transaction_hash) DO NOTHING
    `;
    
    await pool.query(query, [userId, transactionHash]);
}

    async getUserTransactions(userId: number): Promise<Transaction[]> {
        const query = `
            SELECT t.*
            FROM transactions t
            JOIN user_transactions ut ON t."transactionHash" = ut.transaction_hash
            WHERE ut.user_id = $1
            ORDER BY ut.created_at DESC
        `;
        
        const result = await pool.query(query, [userId]);
        return result.rows;
    }

}