'use client';

import React, { useState, useEffect } from 'react';
import { Field, InputField, Button, baseUIBoxClasses } from './UI';
import { DollarSign, Smartphone, Send, WalletMinimal } from 'lucide-react';
import StarknetWalletGate from './StarknetWalletGate';
import { useAccount, useContract, useSendTransaction } from '@starknet-react/core';
import { uint256 } from "starknet"
import Image from "next/image";

const USDC_ADDRESS = "0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8"; // Starknet Mainnet USDC
const EXCHANGE_RATE = 130; // 1 USDC = 130 KES (example rate)

// ERC20 ABI subset for approve and transfer
const ERC20_ABI = [
	{
		"name": "approve",
		"type": "function",
		"inputs": [
			{ "name": "spender", "type": "felt" },
			{ "name": "amount", "type": "Uint256" }
		],
		"outputs": [{ "name": "success", "type": "felt" }],
		"state_mutability": "external"
	},
	{
		"name": "transfer",
		"type": "function",
		"inputs": [
			{ "name": "recipient", "type": "felt" },
			{ "name": "amount", "type": "Uint256" }
		],
		"outputs": [{ "name": "success", "type": "felt" }],
		"state_mutability": "external"
	},
	{
		"name": "balanceOf",
		"type": "function",
		"inputs": [{ "name": "account", "type": "felt" }],
		"outputs": [{ "name": "balance", "type": "Uint256" }],
		"state_mutability": "view"
	}
] as const;

function icon(bg: string, Icon: React.ElementType): { bg: string; content: React.ReactElement } {
	return {
		bg, content: <Icon className="w-4 h-4 text-white" />
	};
}

const MPesaDepositUI: React.FC = () => {
	const [mpesaPhone, setMpesaPhone] = useState<string>('');
	const [usdcAmount, setUsdcAmount] = useState<string>('');
	const [kesAmount, setKesAmount] = useState<string>('0.00');
	const { address } = useAccount();
	const { sendAsync, isPending, error } = useSendTransaction({});
	const { contract: usdcContract } = useContract({ abi: ERC20_ABI, address: USDC_ADDRESS as `0x${string}` });
	const [balance, setBalance] = useState<string>('0');

	// Calculate KES amount when USDC amount changes
	useEffect(() => {
		if (usdcAmount) {
			const kes = (parseFloat(usdcAmount) * EXCHANGE_RATE).toFixed(2);
			setKesAmount(kes);
		} else {
			setKesAmount('0.00');
		}
	}, [usdcAmount]);

	// Fetch USDC balance
	useEffect(() => {
		(async () => {
			if (usdcContract && address) {
				try {
					const bal = await usdcContract.balanceOf(address as string);
					const balanceValue = uint256.uint256ToBN(bal as any).toString();
					// Convert from wei (6 decimals for USDC)
					const formattedBalance = (parseInt(balanceValue) / 1e6).toFixed(6);
					setBalance(formattedBalance);
				} catch (error) {
					console.error("Failed to fetch balance:", error);
				}
			}
		})();
	}, [address, usdcContract]);

	// Handle deposit submission
	const handleDeposit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (!mpesaPhone || !usdcAmount || !address || !usdcContract) {
			console.error("Missing required fields");
			return;
		}

		// Validate phone number format (Kenyan format)
		const phoneRegex = /^(?:\+254|254|0)?([17]\d{8})$/;
		if (!phoneRegex.test(mpesaPhone)) {
			alert("Please enter a valid Kenyan phone number");
			return;
		}

		try {
			// Convert USDC amount to wei (6 decimals)
			const amount = parseFloat(usdcAmount) * 1e6;
			const amountUint256 = uint256.bnToUint256(BigInt(Math.floor(amount)));

			// Call API to example.com
			const apiResponse = await fetch('https://example.com/api/deposit', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					mpesaPhone: mpesaPhone.replace(/^(\+254|254|0)/, '254'),
					usdcAmount: usdcAmount,
					kesAmount: kesAmount,
					walletAddress: address,
				}),
			});

			if (!apiResponse.ok) {
				throw new Error('API call failed');
			}

			const apiData = await apiResponse.json();
			console.log('API Response:', apiData);

			// Execute the transfer transaction
			await sendAsync([
				usdcContract.populate('transfer', [apiData.recipientAddress || address, amountUint256])
			]);

			alert(`Deposit successful! You will receive KES ${kesAmount} to ${mpesaPhone}`);

			// Reset form
			setMpesaPhone('');
			setUsdcAmount('');
			setKesAmount('0.00');
		} catch (error) {
			console.error("Failed to process deposit:", error);
			alert(`Deposit failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
		}
	};

	const waiting = isPending;

	return (
		<form onSubmit={handleDeposit} className="w-full">
			<div className="mt-8 mb-12 text-center max-w-6xl mx-auto px-4 black-shadow text-xl flex items-center justify-center">
				<Image
					className="mr-2"
					src="/mist-logo.svg"
					alt="Mist logo"
					width={40}
					height={40}
					priority
					style={{ filter: 'brightness(0) invert(1)' }}
				/>
				MIST Ramp
			</div>

			<h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-8">
				Off-Ramp with Privacy
			</h2>
			<p className="text-md text-gray-300 text-center mb-12 max-w-2xl mx-auto">
				Private USDC transfer to Kenyan Shillings in your M-Pesa account.
			</p>

			{/* MPesa Phone Number */}
			<Field
				label="M-Pesa Phone Number"
				subtitle="Enter your Kenyan phone number (e.g., 0712345678 or +254712345678)"
			>
				<InputField
					required={true}
					icon={icon('#10B981', Smartphone)}
					placeholder='0712345678'
					value={mpesaPhone}
					onChange={e => setMpesaPhone(e.target.value)}
					type="tel"
				/>
			</Field>

			{/* USDC Amount */}
			<Field label="USDC Amount">
				<InputField
					required={true}
					icon={icon('#3B82F6', DollarSign)}
					placeholder='Enter USDC amount'
					value={usdcAmount}
					type="number"
					min="0"
					step='0.01'
					onChange={e => setUsdcAmount(e.target.value)}
				/>
			</Field>

			{/* KES Amount Display */}
			<Field
				label="You Will Receive"
				subtitle={`Exchange rate: 1 USDC = ${EXCHANGE_RATE} KES`}
			>
				<div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
					<div className="flex items-center justify-between">
						<span className="text-gray-400">KES Amount:</span>
						<span className="text-white text-2xl font-bold">
							{kesAmount} KES
						</span>
					</div>
				</div>
			</Field>

			{/* Wallet Balance */}
			{address && (
				<div className="mb-6">
					<div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
						<div className="flex items-center justify-between">
							<span className="text-gray-400 text-sm">Your USDC Balance:</span>
							<span className="text-white font-medium">{balance} USDC</span>
						</div>
					</div>
				</div>
			)}

			{/* Submit Button */}
			<div>
				<StarknetWalletGate label={<><WalletMinimal className="w-5 h-5" />Connect Wallet</>}>
					<Button disabled={waiting} type="submit">
						<Send className="w-5 h-5" />
						{waiting ? 'Processing...' : 'Deposit & Receive KES'}
					</Button>
				</StarknetWalletGate>
				{error && (
					<div className={baseUIBoxClasses + " bg-red-800 px-3 py-2 mt-2"}>
						{error.message}
					</div>
				)}
			</div>
		</form>
	);
};

export default MPesaDepositUI;
