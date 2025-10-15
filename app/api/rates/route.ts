import { NextResponse } from 'next/server';
import { MOCK_EXCHANGE_RATE } from '../../../lib/config';

export async function GET() {
	try {
		const rate = {
			rate: MOCK_EXCHANGE_RATE,
			timestamp: new Date().toISOString(),
			expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
			source: 'mock'
		};

		return NextResponse.json(rate, {
			headers: {
				'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
				'Content-Type': 'application/json'
			}
		});
	} catch (error) {
		console.error('Error fetching exchange rates:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch exchange rates' },
			{ status: 500 }
		);
	}
}