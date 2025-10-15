import { NextRequest, NextResponse } from 'next/server';
import { getExchangeRate } from '@/lib/payment-provider-wrapper';

export async function GET(request: NextRequest) {
	try {
		const rate = await getExchangeRate();
		if (rate) {
			return NextResponse.json({ rate });
		} else {
			console.error('Error fetching exchange rates:', rate);
		}
	} catch (error) {
		console.error('Error fetching exchange rates:', error);
	}
	return NextResponse.json(
		{ error: 'Failed to fetch exchange rates' },
		{ status: 500 }
	);
}
