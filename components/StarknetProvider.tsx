'use client';

import { publicProvider, StarknetConfig, voyager } from '@starknet-react/core';
import { mainnet, sepolia } from "@starknet-react/chains"
import { ReactNode } from 'react';

interface ProviderProps {
	children: ReactNode;
}

export default function StarknetProvider({ children }: ProviderProps) {
	return (
		<StarknetConfig
			chains={[mainnet, sepolia]}
			provider={publicProvider()}
			explorer={voyager}
			autoConnect={true}
		>
			{children}
		</StarknetConfig>
	);
}
