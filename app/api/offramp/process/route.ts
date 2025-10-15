import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Request validation schema
const ProcessOfframpSchema = z.object({
	phoneNumber: z.string().regex(/^[0-9]{9}$/, 'Invalid Kenyan phone number format'),
	salt: z.string().min(1, 'Salt is required'),
	amount: z.string().regex(/^\d+(\.\d{1,6})?$/, 'Invalid amount format'),
	txSecret: z.string().min(1, 'Transaction secret is required')
});

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const validatedData = ProcessOfframpSchema.parse(body);

		// Generate a simple transaction ID
		const transactionId = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

		// Log the request for development
		console.log('Processing offramp:', {
			transactionId,
			phoneNumber: validatedData.phoneNumber,
			amount: validatedData.amount
		});

		return NextResponse.json({
			success: true,
			transactionId,
			estimatedDelivery: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
			status: 'processing',
			message: 'Offramp request received and is being processed'
		});

	} catch (error) {
		console.error('Offramp processing error:', error);

		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ success: false, error: 'Invalid request data', details: error.issues },
				{ status: 400 }
			);
		}

		return NextResponse.json(
			{ success: false, error: 'Internal server error' },
			{ status: 500 }
		);
	}
}

export async function OPTIONS() {
	return new Response(null, {
		status: 200,
		headers: {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'POST, OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type, Authorization',
		},
	});
}