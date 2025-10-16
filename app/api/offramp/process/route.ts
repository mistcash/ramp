import { NextRequest, NextResponse } from 'next/server';
import { handleOffRamp } from '@/lib/payment-provider-wrapper';
import { z } from 'zod';

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
export const OfframpTransactionSchema = z.object({
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
		const validatedData = OfframpTransactionSchema.parse(body);
		const { phoneNumber, amount, accountName } = validatedData;

		console.log('Processing offramp:', { phoneNumber, amount });

		// Create payment order
		const order = await handleOffRamp({
			amount: parseFloat(amount),
			accountId: phoneNumber,
			accountName,
		});

		return NextResponse.json({
			success: true,
			orderId: order.id,
			receiveAddress: order.receiveAddress,
			totalAmount: order.totalAmount,
			rate: order.rate,
			message: `Send ${order.totalAmount} USDT to ${order.receiveAddress}`
		});

	} catch (error) {
		console.error('Offramp error:', error);

		const message = error instanceof Error ? error.message : 'Internal server error';

		return NextResponse.json(
			{ error: message },
			{ status: 500 }
		);
	}
}