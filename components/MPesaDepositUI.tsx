'use client';

import React, { useState, useEffect } from 'react';
import { Field, InputField, Button, baseUIBoxClasses } from './UI';
import { DollarSign, Smartphone, Send, WalletMinimal, Icon, User2 } from 'lucide-react';
import StarknetWalletGate from './StarknetWalletGate';
import { useAccount, useContract, useSendTransaction, useProvider } from '@starknet-react/core';
import { uint256 } from "starknet"
import Image from "next/image";
import { useMist } from '@mistcash/react';
import { hash, txSecret } from '@mistcash/crypto';
import { ERC20_ABI, Token, tokensData, tokensMap } from '@mistcash/config';
import { fmtAmount, fmtAmtToBigInt } from '@mistcash/sdk';
import { OrderData } from '@/lib/types';

const USDC_TOKEN = tokensData.find(token => token.name === 'USDC') as Token;

const USDC_ADDRESS = USDC_TOKEN.id;
const SN_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_SN_CONTRACT as string;

if (!SN_CONTRACT_ADDRESS) {
	throw new Error('Starknet contract address not configured');
}

function icon(bg: string, Icon: React.ElementType): { bg: string; content: React.ReactElement } {
	return {
		bg, content: <Icon className="w-4 h-4 text-white" />
	};
}

const MPesaDepositUI: React.FC = () => {
	const [mpesaPhone, setMpesaPhone] = useState<string>('');
	const [recipientName, setRecipientName] = useState<string>('');
	const [usdcAmount, setUsdcAmount] = useState<string>('');
	const [kesAmount, setKesAmount] = useState<string>('0.00');
	const [salt, setSalt] = useState<string>('');
	const { address } = useAccount();

	const amountWithFees = parseFloat(usdcAmount) * 1.01 + 0.2;

	// Use Mist hook for transaction management (exactly like TransferUI)
	const {
		contract, send, isPending, txError: error,
		chamberAddress,
	} = useMist(useProvider(), useSendTransaction({}));

	const { sendAsync } = useSendTransaction({});

	const { contract: usdcContract } = useContract({ abi: ERC20_ABI, address: USDC_ADDRESS as `0x${string}` });
	const [balance, setBalance] = useState<string>('0');
	const [rate, setRate] = useState<number>(0);

	// Generate random salt on component mount
	useEffect(() => {
		setSalt(genSalt());
	}, []);

	// Calculate KES amount when USDC amount changes
	useEffect(() => {
		(async () => {
			let appliedRate = rate;
			if (!appliedRate) {
				const { rate: appliedRate } = await (await fetch('/api/rates')).json();
				setRate(appliedRate);
			}
			if (usdcAmount) {
				const kes = (parseFloat(usdcAmount) * appliedRate).toFixed(2);
				setKesAmount(kes);
			} else {
				setKesAmount('0.00');
			}
		})();
	}, [usdcAmount]);

	// Fetch USDC balance
	useEffect(() => {
		(async () => {
			if (usdcContract && address) {
				try {
					const bal = await usdcContract.balanceOf(address as string);
					const balanceValue = uint256.uint256ToBN(bal as any);
					console.log("Balance value (bigint):", balanceValue, fmtAmount(balanceValue, 6));
					setBalance(parseFloat(fmtAmount(balanceValue, 6)).toFixed(2));
				} catch (error) {
					console.error("Failed to fetch balance:", error);
				}
			}
		})();
	}, [address, usdcContract]);

	const prepareOrderData = async (): Promise<OrderData | undefined> => {
		if (!mpesaPhone || !usdcAmount || !address || !usdcContract || !salt || !contract) {
			console.error("Missing required fields");
			return;
		}

		// Validate phone number format (Kenyan format)
		const phoneRegex = /^(?:\+254|254|0)?([17]\d{8})$/;
		if (!phoneRegex.test(mpesaPhone)) {
			alert("Please enter a valid Kenyan phone number");
			return;
		}

		// Normalize phone number
		const normalizedPhone = mpesaPhone.replace(/^(\+254|254|0)/, '254');

		// Create transaction secret from salt + phone number + currency ID 'KES'
		const secretInput = await hash(BigInt(normalizedPhone), BigInt(salt));

		// Convert USDC amount to wei (6 decimals for USDC)
		const amount_bi = fmtAmtToBigInt(amountWithFees.toFixed(2), USDC_TOKEN.decimals || 18);
		const amountCharged = uint256.bnToUint256(amount_bi);

		// Set up the USDC contract
		usdcContract.address = USDC_ADDRESS;

		const asset = {
			amount: amountCharged,
			addr: USDC_ADDRESS
		};

		return {
			salt,
			phoneNumber: normalizedPhone,
			amount: kesAmount,
			accountName: recipientName,
			asset,
			secretInput: secretInput.toString(), // Include the secret input for the backend
		};
	}

	const makePrivateTx = async (orderData: OrderData) => {
		if (!usdcContract) return;

		const txSecretValue = await txSecret(orderData.secretInput, SN_CONTRACT_ADDRESS);

		// Execute the Mist deposit transaction (exactly like TransferUI)
		sendAsync([
			usdcContract.populate('approve', [chamberAddress, orderData.asset.amount]),
			contract.populate('deposit', [txSecretValue, orderData.asset])
		]);
	}

	const callAPI = async (orderData: OrderData) => {
		const apiResponse = await fetch('/api/offramp/process', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(orderData),
		});

		if (!apiResponse.ok) {
			throw new Error('API call failed');
		}

		const apiData = await apiResponse.json();
		console.log('API Response:', apiData);

		return apiData;
	}

	// Handle deposit submission
	const handleDeposit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		try {
			const orderData = await prepareOrderData();

			if (!orderData) {
				return;
			}

			console.log("Processing Order Data:", orderData);

			// Create a private transaction for order
			await makePrivateTx(orderData);

			// Call API to process the deposit request
			const apiData = await callAPI(orderData);
			console.log('API Response:', apiData);

			alert(`Deposit successful! You will receive KES ${kesAmount} to ${mpesaPhone}`);

			// Reset form and generate new salt
			setMpesaPhone('');
			setUsdcAmount('');
			setKesAmount('0.00');
			setSalt(genSalt());
		} catch (error) {
			console.error("Failed to send transaction:", error);
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
			<Field label="Full name">
				<InputField
					required={true}
					icon={icon('#c80', User2)}
					placeholder='John Doe'
					value={recipientName}
					onChange={e => setRecipientName(e.target.value)}
					type="text"
				/>
			</Field>

			<Field label="M-Pesa Phone Number">
				<InputField
					required={true}
					icon={icon('#10B981', Smartphone)}
					placeholder='712345678'
					value={'+254' + mpesaPhone.replace(/\+25?4?/, '')}
					onChange={e => setMpesaPhone(e.target.value)}
					type="tel"
					pattern="^\+254\d{9}$"
				/>
			</Field>

			{/* USDC Amount */}
			<Field label="USDC Amount" subtitle={!!amountWithFees ? `${amountWithFees.toFixed(2)} USDC after fees (1% + 20¢)` : ''}>
				<InputField
					after={address && <span className="text-sm -mt-1 mb-auto text-gray-400">Max: {balance}</span>} required={true}
					icon={icon('#3B82F6', DollarSign)}
					placeholder='Enter USDC amount'
					value={usdcAmount}
					type="number"
					min="0"
					max="100"
					step='0.01'
					onChange={e => setUsdcAmount(e.target.value)}
				/>
			</Field>

			{/* KES Amount Display */}
			<Field
				// label="You Will Receive"
				label={`1 USDC = ${rate} KES`}
			>

				<div className="bg-gray-800 rounded-lg p-2 border border-gray-700">
					<div className="flex items-center justify-between">
						<span className="text-gray-400">KES Amount:</span>
						<span className="text-white text-2xl font-bold">
							<span>
								{kesAmount}
							</span>
							KES
						</span>
					</div>
				</div>
			</Field>

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
function genSalt(): string {
	// 200bit salt + KES currency ID
	return '0x' +
		Math.random().toString(16).substring(2, 12) +
		Math.random().toString(16).substring(2, 12) +
		Math.random().toString(16).substring(2, 12) +
		Math.random().toString(16).substring(2, 12) +
		Math.random().toString(16).substring(2, 12) +
		parseInt('KES', 36).toString(16);
}

