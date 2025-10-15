// Example/mock payment provider implementation
// This is used when the real payment-provider.ts doesn't exist

interface PaymentOrder {
	id: string;
	receiveAddress: string;
	totalAmount: number;
	rate: string;
}

interface CreateOrderParams {
	amount: number;
	accountId: string;
	accountName?: string;
}

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
export async function createPaymentOrder(params: CreateOrderParams): Promise<PaymentOrder> {
	console.warn('🚨 Using mock payment order - set up real payment provider!');

	// Simulate API delay
	await new Promise(resolve => setTimeout(resolve, 200));

	// Generate fake order data
	const mockOrder: PaymentOrder = {
		id: `mock_order_${Date.now()}`,
		receiveAddress: '0x1234567890abcdef1234567890abcdef12345678',
		totalAmount: params.amount * 1.025, // Add 2.5% fees
		rate: await getExchangeRate(params.amount),
	};

	console.log('📝 Mock order created:', mockOrder);

	return mockOrder;
}