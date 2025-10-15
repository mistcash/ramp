// Dynamic import wrapper that falls back to example implementation

let paymentProvider: any = null;

async function getPaymentProvider() {
	if (paymentProvider) return paymentProvider;

	try {
		// Try to import the real payment provider
		paymentProvider = await import('@/lib/payment-provider');
		console.log('Using real payment provider');
	} catch (error) {
		// Fall back to example implementation
		console.log('Using example payment provider');
		paymentProvider = await import('@/lib/payment-provider-example');
	}

	return paymentProvider;
}

export async function getExchangeRate(amount: number = 100): Promise<string> {
	const provider = await getPaymentProvider();
	return provider.getExchangeRate(amount);
}

export async function createPaymentOrder(params: {
	amount: number;
	accountId: string;
	accountName?: string;
}) {
	const provider = await getPaymentProvider();
	return provider.createPaymentOrder(params);
}