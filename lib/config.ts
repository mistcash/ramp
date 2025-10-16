// Simple environment helpers

import { Token, tokensData } from "@mistcash/config";
import { mainnet } from "@starknet-react/chains";
import { constants, ProviderInterface, RpcProvider } from "starknet";

export const isDevelopment = () => process.env.NODE_ENV === 'development';

export const USDC_TOKEN = tokensData.find(token => token.name === 'USDC') as Token;
export const USDC_ADDRESS = USDC_TOKEN.id;
export const SN_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_SN_CONTRACT as string;

export const starknetProvider = new RpcProvider({ nodeUrl: constants.NetworkName.SN_MAIN });
