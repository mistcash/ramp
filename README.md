# Mist Ramp - USDC to M-Pesa

A Next.js application that allows users to deposit USDC and receive Kenyan Shillings directly to their M-Pesa account using Starknet blockchain technology.

## Features

- **M-Pesa Integration**: Users can provide their M-Pesa phone number to receive funds
- **USDC Deposits**: Deposit USDC from your Starknet wallet
- **Real-time Conversion**: See the exact amount of Kenyan Shillings you'll receive (1 USDC = 130 KES)
- **Wallet Connection**: Seamless wallet integration using StarknetKit
- **API Integration**: Calls external API (example.com) to process transactions
- **User-friendly UI**: Clean, modern interface with dark theme

## Screenshots

### Initial UI
![Initial UI](https://github.com/user-attachments/assets/dea23847-06c8-4a76-87a7-a79c0da3f18c)

### Form with Values
![Form Filled](https://github.com/user-attachments/assets/c5b9f1c4-e5e9-4fab-a9f2-4e9a991bb257)

## Tech Stack

- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS 4
- **Blockchain**: Starknet with @starknet-react/core
- **Wallet**: StarknetKit for wallet connections
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/mistcash/mist-ramp.git
cd mist-ramp
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
mist-ramp/
├── app/
│   ├── layout.tsx          # Root layout with StarknetProvider
│   ├── page.tsx            # Home page with MPesaDepositUI
│   └── globals.css         # Global styles
├── components/
│   ├── MPesaDepositUI.tsx  # Main deposit interface
│   ├── StarknetProvider.tsx # Starknet configuration
│   ├── StarknetWalletGate.tsx # Wallet connection component
│   └── UI.tsx              # Reusable UI components
└── public/                 # Static assets
```

## Components

### MPesaDepositUI
The main component that handles:
- M-Pesa phone number input with validation
- USDC amount input
- Real-time KES conversion display
- Wallet balance display
- Transaction submission
- API calls to example.com

### StarknetWalletGate
Handles wallet connection/disconnection:
- Shows "Connect Wallet" button when disconnected
- Displays connected address with disconnect option
- Wraps protected content that requires wallet connection

### UI Components
Reusable components based on the provided gists:
- `Button`: Styled button with loading states
- `Field`: Form field wrapper with label and subtitle
- `InputField`: Input with icon and optional action button
- `Dropdown`: Custom dropdown component
- `LoadingSpinner`: Animated loading indicator

## Configuration

### USDC Contract
The app uses the Starknet USDC contract:
```typescript
const USDC_ADDRESS = "0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8";
```

### Exchange Rate
Current exchange rate is set to:
```typescript
const EXCHANGE_RATE = 130; // 1 USDC = 130 KES
```

## API Integration

When the user submits a deposit, the app makes a POST request to:
```
https://example.com/api/deposit
```

With the following payload:
```json
{
  "mpesaPhone": "254712345678",
  "usdcAmount": "100",
  "kesAmount": "13000.00",
  "walletAddress": "0x..."
}
```

## Phone Number Validation

The app validates Kenyan phone numbers in the following formats:
- `0712345678` (starts with 0)
- `254712345678` (country code without +)
- `+254712345678` (with + prefix)

Valid prefixes: `07` or `01` followed by 8 digits

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.