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