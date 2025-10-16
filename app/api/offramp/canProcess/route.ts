// This entrypoint confirms if an order can be processed (enough liquidity for the requested amount)

import { NextRequest, NextResponse } from 'next/server';
import { handleOffRamp } from '@/lib/payment-provider-wrapper';
import { z } from 'zod';

// Request validation schema
const ProcessOfframpSchema = z.object({
	salt: z.string().min(1, 'Salt is required'),
	amount: z.string().regex(/^\d+(\.\d{1,6})?$/, 'Invalid amount format'),
	txSecret: z.string().min(40, 'Transaction secret is required'),
	accountName: z.string().min(3, 'Account name is required'),
	phoneNumber: z.string().regex(/^[0-9]{9}$/, 'Invalid Kenyan phone number format'),
	memo: z.string().optional(),
});

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const validatedData = ProcessOfframpSchema.parse(body);
		const { phoneNumber, amount, accountName } = validatedData;

		console.log('Processing offramp:', { phoneNumber, amount });

		// Create payment order
		const order = await handleOffRamp({
			amount: parseFloat(amount),
			accountId: phoneNumber,
			accountName
		});

		return NextResponse.json({
			success: true,
			orderId: order.id,
			receiveAddress: order.receiveAddress,
			totalAmount: order.totalAmount,
			rate: order.rate,
			validUntil: order.validUntil,
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