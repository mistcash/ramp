import type { Metadata } from "next";
import "./globals.css";
import StarknetProvider from "@/components/StarknetProvider";

export const metadata: Metadata = {
  title: "Mist Ramp - USDC to M-Pesa",
  description: "Convert USDC to Kenyan Shillings via M-Pesa",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <StarknetProvider>
          {children}
        </StarknetProvider>
      </body>
    </html>
  );
}
