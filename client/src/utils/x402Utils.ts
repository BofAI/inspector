/**
 * x402 Payment Protocol utilities for MCP Inspector.
 *
 * Detects x402 payment-required responses and payment-response metadata
 * in MCP tool call results, enabling debugging of x402-enabled MCP servers.
 *
 * Protocol reference: https://github.com/coinbase/x402
 */

/** Meta key where x402 payment payload is sent (client -> server) */
export const MCP_PAYMENT_META_KEY = "x402/payment";

/** Meta key where x402 payment response is returned (server -> client) */
export const MCP_PAYMENT_RESPONSE_META_KEY = "x402/payment-response";

/** x402 PaymentRequirements entry (single accepted payment option) */
export interface PaymentRequirements {
  scheme: string;
  network: string;
  maxAmountRequired: string;
  resource: string;
  description?: string;
  mimeType?: string;
  maxTimeoutSeconds?: number;
  asset?: string;
  extra?: Record<string, unknown>;
  [key: string]: unknown;
}

/** x402 PaymentRequired response envelope */
export interface PaymentRequired {
  x402Version: number;
  accepts: PaymentRequirements[];
  error?: string;
  [key: string]: unknown;
}

/** x402 SettleResponse from server after payment */
export interface SettleResponse {
  success: boolean;
  transaction?: string;
  network?: string;
  scheme?: string;
  payer?: string;
  [key: string]: unknown;
}

/**
 * Check if an object looks like an x402 PaymentRequired response.
 */
export function isPaymentRequired(obj: unknown): obj is PaymentRequired {
  if (typeof obj !== "object" || obj === null) return false;
  const o = obj as Record<string, unknown>;
  return "x402Version" in o && "accepts" in o && Array.isArray(o.accepts);
}

/**
 * Check if an object looks like an x402 SettleResponse.
 */
export function isSettleResponse(obj: unknown): obj is SettleResponse {
  if (typeof obj !== "object" || obj === null) return false;
  return "success" in (obj as Record<string, unknown>);
}

/**
 * Try to extract PaymentRequired from an error tool result.
 *
 * x402 MCP servers embed PaymentRequired in tool results as:
 * 1. structuredContent with direct PaymentRequired object
 * 2. content[0].text with JSON-encoded PaymentRequired
 */
export function extractPaymentRequiredFromResult(result: {
  content?: Array<{ type: string; text?: string; [key: string]: unknown }>;
  isError?: boolean;
  structuredContent?: Record<string, unknown>;
}): PaymentRequired | null {
  if (!result.isError) return null;

  // Check structuredContent first
  if (result.structuredContent && isPaymentRequired(result.structuredContent)) {
    return result.structuredContent as PaymentRequired;
  }

  // Check first text content block
  const content = result.content;
  if (!content || content.length === 0) return null;

  const first = content[0];
  if (first.type !== "text" || typeof first.text !== "string") return null;

  try {
    const parsed = JSON.parse(first.text);
    if (isPaymentRequired(parsed)) return parsed;
  } catch {
    // not JSON
  }

  return null;
}

/**
 * Extract x402 payment response (SettleResponse) from result _meta.
 */
export function extractPaymentResponseFromMeta(
  meta: Record<string, unknown> | undefined,
): SettleResponse | null {
  if (!meta) return null;
  const response = meta[MCP_PAYMENT_RESPONSE_META_KEY];
  if (isSettleResponse(response)) return response;
  return null;
}

/**
 * Format a token amount for display.
 * Attempts to show human-readable values for common stablecoin amounts.
 */
export function formatAmount(amount: string): string {
  // Try to format as a dollar amount if it looks like USDC (6 decimals)
  try {
    const num = BigInt(amount);
    // USDC/USDT use 6 decimals
    const decimals = 6;
    const divisor = BigInt(10 ** decimals);
    const whole = num / divisor;
    const frac = num % divisor;
    const fracStr = frac.toString().padStart(decimals, "0").replace(/0+$/, "");
    if (fracStr) {
      return `${whole}.${fracStr}`;
    }
    return whole.toString();
  } catch {
    return amount;
  }
}

/**
 * Get a human-readable network name from a CAIP-2 identifier.
 */
export function networkName(network: string): string {
  const names: Record<string, string> = {
    "eip155:1": "Ethereum Mainnet",
    "eip155:84532": "Base Sepolia",
    "eip155:8453": "Base",
    "eip155:137": "Polygon",
    "eip155:42161": "Arbitrum One",
    "eip155:10": "Optimism",
    "eip155:11155111": "Sepolia",
    "solana:mainnet": "Solana Mainnet",
    "solana:devnet": "Solana Devnet",
  };
  return names[network] || network;
}
