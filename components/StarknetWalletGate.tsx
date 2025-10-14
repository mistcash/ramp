'use client';

import { useStarknetkitConnectModal } from "starknetkit";
import { useConnect, useDisconnect, useAccount } from '@starknet-react/core';
import { useState } from 'react';
import { Button } from "./UI";

interface StarknetWalletGateProps {
	children: React.ReactNode;
	label?: string | React.ReactNode;
	connectedClass?: string;
}

export default function StarknetWalletGate({ children, label, connectedClass = 'text-right' }: StarknetWalletGateProps) {
	const [isConnecting, setIsConnecting] = useState(false);
	const { connect, connectors } = useConnect();
	const { disconnect } = useDisconnect();
	const { address } = useAccount();
	const { starknetkitConnectModal } = useStarknetkitConnectModal({
		connectors: connectors
	})

	async function connectWallet() {
		setIsConnecting(true)
		try {
			const { connector } = await starknetkitConnectModal()
			if (connector) {
				connect({ connector })
			}
		} catch (error) {
			console.error("Failed to connect wallet:", error)
		} finally {
			setIsConnecting(false)
		}
	}

	function handleDisconnect(e: React.MouseEvent<HTMLButtonElement>) {
		e.preventDefault();
		disconnect();
		return false;
	}

	return address ?
		<>
			<div className={`text-sm ${connectedClass}`}>
				<span className="opacity-50 mr-2">
					Connected:
				</span>
				<span className="opacity-80 mr-2">
					{address.replace('0x0', '0x').slice(0, 4)}...{address.slice(-3)}
				</span>
				<button onClick={handleDisconnect}>Disconnect</button>
			</div >
			{children}
		</> :
		<Button isLoading={isConnecting} onClick={connectWallet}>
			{label || 'Connect Wallet'}
		</Button>;
}
