import { NextResponse } from 'next/server';

export async function GET() {
	try {
		const response = await (await fetch('https://api.paycrest.io/v1/rates/USDC/100/KES?network=base')).json();

		console.log('Paycrest response status:', response);
		if (response && response.status === 'success' && response.data) {

			return NextResponse.json({
				rate: response.data
			});
		} else {
			console.error('Error fetching exchange rates:', response);
		}
	} catch (error) {
		console.error('Error fetching exchange rates:', error);
	}
	return NextResponse.json(
		{ error: 'Failed to fetch exchange rates' },
		{ status: 500 }
	);
}
