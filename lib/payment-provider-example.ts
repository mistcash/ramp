// Example/mock payment provider implementation
// This is used when the real payment-provider.ts doesn't exist

import { CreateOrderParams, OrderResult } from "./types";

/**
 * Mock exchange rate - returns a fake rate
 */
export async function getExchangeRate(amount: number = 100): Promise<string> {
	console.warn('🚨 Using mock exchange rate - set up real payment provider!');
	return '125';
}

/**
 * Mock payment order creation - returns fake data
 */
export async function handleOffRamp(params: CreateOrderParams): Promise<OrderResult> {
	console.warn('🚨 Using mock payment order - set up real payment provider!');

	// Simulate API delay
	await new Promise(resolve => setTimeout(resolve, 200));

	console.log('📝 Mock order created:', params);

	return {
		id: `mock_order_${Date.now()}`,
		success: 'true',
	};
}