// Simple types for the API

export type TransactionStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface ProcessedTransaction {
	id: string;
	txHash: string;
	phoneNumberHash: string;
	amount: string;
	status: TransactionStatus;
	createdAt: Date;
}
