import { ethers } from 'ethers';
import { environment } from '../config/environment';

export interface Transaction {
    transactionHash: string;
    transactionStatus: number;
    blockHash: string;
    blockNumber: number;
    from: string;
    to: string | null;
    contractAddress: string | null;
    logsCount: number;
    input: string;
    value: string;
}

export class EthereumService {
    private provider: ethers.InfuraProvider;

    constructor() {
        if (!environment.ETH_NODE_URL) {
            throw new Error('ETH_NODE_URL environment variable is not set');
        }
        this.provider = new ethers.InfuraProvider('sepolia', environment.ETH_NODE_URL);
    }

    private async ensureConnection() {
        try {
            await this.provider.getNetwork();
        } catch (error) {
            console.error('Provider connection failed, reinitializing...', error);
            this.provider = new ethers.InfuraProvider('sepolia', environment.ETH_NODE_URL);
            await this.provider.getNetwork(); // Verify the new connection
        }
    }

    async getTransaction(txHash: string): Promise<Transaction> {
        await this.ensureConnection();
        
        try {
            // Get transaction data
            const tx = await this.provider.getTransaction(txHash);
            if (!tx) {
                throw new Error(`Transaction ${txHash} not found`);
            }

            // Get transaction receipt for additional info
            const receipt = await this.provider.getTransactionReceipt(txHash);
            if (!receipt) {
                throw new Error(`Receipt for transaction ${txHash} not found`);
            }
            // Format the transaction data according to the required structure
            return {
                transactionHash: tx.hash,
                transactionStatus: receipt.status ? 1 : 0,
                blockHash: receipt.blockHash,
                blockNumber: Number(receipt.blockNumber),
                from: tx.from,
                to: tx.to,
                contractAddress: receipt.contractAddress,
                logsCount: receipt.logs.length,
                input: tx.data,
                value: tx.value.toString()
            };
        } catch (error) {
            console.error(`Error fetching transaction ${txHash}:`, error);
            throw error;
        }
    }

    async getMultipleTransactions(txHashes: string[]): Promise<Transaction[]> {
        await this.ensureConnection();
        
        try {
            // Fetch all transactions in parallel
            const transactions = await Promise.all(
                txHashes.map(hash => this.getTransaction(hash))
            );
            return transactions;
        } catch (error) {
            console.error('Error fetching multiple transactions:', error);
            throw error;
        }
    }

    async isConnected(): Promise<boolean> {
        try {
            await this.provider.getNetwork();
            return true;
        } catch (error) {
            return false;
        }
    }
}