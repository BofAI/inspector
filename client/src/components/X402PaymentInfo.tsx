/**
 * X402 Payment Information display components for MCP Inspector.
 *
 * Shows x402 payment requirements (402 responses) and payment settlement
 * responses in a structured, debugger-friendly format.
 */

import {
  PaymentRequired,
  SettleResponse,
  formatAmount,
  networkName,
} from "@/utils/x402Utils";
import JsonView from "./JsonView";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";

/**
 * Renders x402 PaymentRequired information from a 402 tool response.
 */
export function X402PaymentRequired({
  paymentRequired,
}: {
  paymentRequired: PaymentRequired;
}) {
  const [showRaw, setShowRaw] = useState(false);

  return (
    <div className="border border-yellow-400 dark:border-yellow-600 rounded-lg p-4 bg-yellow-50 dark:bg-yellow-950">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">💳</span>
        <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">
          x402 Payment Required
        </h4>
        <span className="text-xs px-2 py-0.5 rounded bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200">
          v{paymentRequired.x402Version}
        </span>
      </div>

      {paymentRequired.error && (
        <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-3">
          {paymentRequired.error}
        </p>
      )}

      <div className="space-y-3">
        {paymentRequired.accepts.map((req, i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-900 rounded p-3 border border-yellow-200 dark:border-yellow-800"
          >
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
              <div className="text-gray-500 dark:text-gray-400">Scheme</div>
              <div className="font-mono">{req.scheme}</div>

              <div className="text-gray-500 dark:text-gray-400">Network</div>
              <div className="font-mono" title={req.network}>
                {networkName(req.network)}
                <span className="text-xs text-gray-400 ml-1">
                  ({req.network})
                </span>
              </div>

              <div className="text-gray-500 dark:text-gray-400">Amount</div>
              <div className="font-mono font-semibold">
                {formatAmount(req.maxAmountRequired)}
                {req.asset && (
                  <span
                    className="text-xs text-gray-400 ml-1 font-normal"
                    title={req.asset}
                  >
                    ({req.asset.slice(0, 6)}...{req.asset.slice(-4)})
                  </span>
                )}
              </div>

              {req.resource && (
                <>
                  <div className="text-gray-500 dark:text-gray-400">
                    Resource
                  </div>
                  <div className="font-mono text-xs break-all">
                    {req.resource}
                  </div>
                </>
              )}

              {req.description && (
                <>
                  <div className="text-gray-500 dark:text-gray-400">
                    Description
                  </div>
                  <div className="text-xs">{req.description}</div>
                </>
              )}

              {req.maxTimeoutSeconds && (
                <>
                  <div className="text-gray-500 dark:text-gray-400">
                    Timeout
                  </div>
                  <div className="font-mono">{req.maxTimeoutSeconds}s</div>
                </>
              )}
            </div>

            {req.extra && Object.keys(req.extra).length > 0 && (
              <div className="mt-2 pt-2 border-t border-yellow-100 dark:border-yellow-900">
                <span className="text-xs text-gray-500">
                  Scheme-specific extra:
                </span>
                <JsonView data={req.extra} />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-3 flex justify-end">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setShowRaw(!showRaw)}
          className="h-6 px-2 text-xs"
        >
          {showRaw ? (
            <>
              <ChevronUp className="h-3 w-3 mr-1" /> Hide Raw
            </>
          ) : (
            <>
              <ChevronDown className="h-3 w-3 mr-1" /> Show Raw
            </>
          )}
        </Button>
      </div>
      {showRaw && (
        <div className="mt-2 bg-gray-50 dark:bg-gray-900 p-2 rounded">
          <JsonView data={paymentRequired} />
        </div>
      )}
    </div>
  );
}

/**
 * Renders x402 payment settlement response.
 */
export function X402PaymentResponse({
  settleResponse,
}: {
  settleResponse: SettleResponse;
}) {
  const [showRaw, setShowRaw] = useState(false);

  return (
    <div
      className={`border rounded-lg p-4 ${
        settleResponse.success
          ? "border-green-400 dark:border-green-600 bg-green-50 dark:bg-green-950"
          : "border-red-400 dark:border-red-600 bg-red-50 dark:bg-red-950"
      }`}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">{settleResponse.success ? "✅" : "❌"}</span>
        <h5 className="font-semibold text-sm">
          x402 Payment {settleResponse.success ? "Settled" : "Failed"}
        </h5>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
        {settleResponse.transaction && (
          <>
            <div className="text-gray-500 dark:text-gray-400">Transaction</div>
            <div className="font-mono text-xs break-all">
              {settleResponse.transaction}
            </div>
          </>
        )}

        {settleResponse.network && (
          <>
            <div className="text-gray-500 dark:text-gray-400">Network</div>
            <div className="font-mono">
              {networkName(settleResponse.network)}
            </div>
          </>
        )}

        {settleResponse.scheme && (
          <>
            <div className="text-gray-500 dark:text-gray-400">Scheme</div>
            <div className="font-mono">{settleResponse.scheme}</div>
          </>
        )}

        {settleResponse.payer && (
          <>
            <div className="text-gray-500 dark:text-gray-400">Payer</div>
            <div className="font-mono text-xs break-all">
              {settleResponse.payer}
            </div>
          </>
        )}
      </div>

      <div className="mt-3 flex justify-end">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setShowRaw(!showRaw)}
          className="h-6 px-2 text-xs"
        >
          {showRaw ? (
            <>
              <ChevronUp className="h-3 w-3 mr-1" /> Hide Raw
            </>
          ) : (
            <>
              <ChevronDown className="h-3 w-3 mr-1" /> Show Raw
            </>
          )}
        </Button>
      </div>
      {showRaw && (
        <div className="mt-2 bg-gray-50 dark:bg-gray-900 p-2 rounded">
          <JsonView data={settleResponse} />
        </div>
      )}
    </div>
  );
}
