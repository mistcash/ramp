import { Uint256 } from "starknet";

export interface OrderData {
	accountName: string;
	amount: string; // string, as it was in quotes
	phoneNumber: string;
	salt: string;
	secretInput: string; // The 'n' suffix in the JS object indicates a BigInt
	asset: {
		amount: Uint256;
		addr: string;
	};
};

export interface OrderResult {
	id: string;
	success: string;
}

export interface CreateOrderParams {
	accountId: string;
	accountName?: string;
	amount: number;
	mistTxId?: string;
	amountUSDC?: bigint;
}
