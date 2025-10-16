import { NextRequest, NextResponse } from 'next/server';
import { handleOffRamp } from '@/lib/payment-provider-wrapper';
import { z } from 'zod';
import { checkTxExists, getChamber } from '@mistcash/sdk';
import { SN_CONTRACT_ADDRESS, starknetProvider, USDC_ADDRESS } from '@/lib/config';
import { OrderData } from '@/lib/types';
import { uint256 } from 'starknet';

// Schema for the nested 'amount' object inside 'asset'
const U256Schema = z.object({
	low: z.string().regex(/^0x[0-9a-fA-F]+$/, "Invalid hex format for low"),
	high: z.string().regex(/^0x[0-9a-fA-F]+$/, "Invalid hex format for high"),
});

// Schema for the 'asset' object
const AssetSchema = z.object({
	amount: U256Schema,
	addr: z.string().regex(/^0x[0-9a-fA-F]+$/, "Invalid hex format for addr"),
});

// The main schema for the entire transaction object
const OfframpTransactionSchema = z.object({
	accountName: z.string().min(1, "Account name cannot be empty"),
	amount: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid amount format"),
	asset: AssetSchema,
	phoneNumber: z.string().regex(/^\d+$/, "Phone number must contain only digits"),
	salt: z.string().regex(/^0x[0-9a-fA-F]+$/, "Invalid hex format for salt"),
	// Validates a string of digits, which can then be safely converted to a BigInt
	secretInput: z.string().regex(/^\d+$/, "Secret input must be a string of digits"),
});

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const req: OrderData = OfframpTransactionSchema.parse(body);
		const { phoneNumber, amount, accountName } = req;

		console.log('Processing offramp:', { phoneNumber, amount });

		const amountUSDC = uint256.uint256ToBN(req.asset.amount);

		const txExists = await checkTxExists(getChamber(starknetProvider), req.secretInput, SN_CONTRACT_ADDRESS, USDC_ADDRESS, amountUSDC.toString())

		if (txExists) {

			// Create payment order
			return NextResponse.json(
				await handleOffRamp({
					amount: parseFloat(amount),
					accountId: phoneNumber,
					accountName,
					amountUSDC,
					mistTxId: req.secretInput,
				})
			);
		} else {
			return NextResponse.json(
				{ error: "Transaction does not exist" },
				{ status: 500 }
			);

		}

	} catch (error) {
		console.error('Offramp error:', error);

		const message = error instanceof Error ? error.message : 'Internal server error';

		return NextResponse.json(
			{ error: message },
			{ status: 500 }
		);
	}
}