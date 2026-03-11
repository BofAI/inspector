/**
 * X402 Payment Input panel for MCP Inspector.
 *
 * Allows users to configure and attach x402 payment metadata to tool calls
 * for debugging paid MCP tool interactions.
 */

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { ChevronDown, ChevronUp } from "lucide-react";
import { MCP_PAYMENT_META_KEY } from "@/utils/x402Utils";

interface X402PaymentInputProps {
  /** Called when x402 payment config changes. Returns metadata entries to merge. */
  onPaymentMetaChange: (meta: Record<string, unknown> | null) => void;
}

/**
 * Collapsible panel for configuring x402 payment metadata on tool calls.
 */
export function X402PaymentInput({
  onPaymentMetaChange,
}: X402PaymentInputProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [paymentJson, setPaymentJson] = useState(
    JSON.stringify(
      {
        x402Version: 2,
        payload: {
          signature: "0x...",
          scheme: "exact",
          network: "eip155:84532",
          authorization: {},
        },
      },
      null,
      2,
    ),
  );
  const [jsonError, setJsonError] = useState<string | null>(null);

  const handleToggle = (checked: boolean) => {
    setEnabled(checked);
    if (checked) {
      try {
        const parsed = JSON.parse(paymentJson);
        onPaymentMetaChange({ [MCP_PAYMENT_META_KEY]: parsed });
        setJsonError(null);
      } catch (e) {
        setJsonError(e instanceof Error ? e.message : "Invalid JSON");
        onPaymentMetaChange(null);
      }
    } else {
      onPaymentMetaChange(null);
    }
  };

  const handleJsonChange = (value: string) => {
    setPaymentJson(value);
    if (enabled) {
      try {
        const parsed = JSON.parse(value);
        onPaymentMetaChange({ [MCP_PAYMENT_META_KEY]: parsed });
        setJsonError(null);
      } catch (e) {
        setJsonError(e instanceof Error ? e.message : "Invalid JSON");
        onPaymentMetaChange(null);
      }
    }
  };

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm">💳</span>
          <span className="text-sm font-medium">x402 Payment</span>
          {enabled && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300">
              Active
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-gray-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-400" />
        )}
      </button>

      {isExpanded && (
        <div className="px-3 pb-3 space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="x402-enable"
              checked={enabled}
              onCheckedChange={handleToggle}
            />
            <Label
              htmlFor="x402-enable"
              className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
            >
              Attach x402 payment to tool calls
            </Label>
          </div>

          <div>
            <Label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">
              Payment Payload JSON (sent as{" "}
              <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">
                _meta[&quot;x402/payment&quot;]
              </code>
              )
            </Label>
            <Textarea
              value={paymentJson}
              onChange={(e) => handleJsonChange(e.target.value)}
              className={`font-mono text-xs min-h-[120px] ${
                jsonError ? "border-red-500 focus-visible:ring-red-500" : ""
              }`}
              placeholder="Enter x402 PaymentPayload JSON..."
              disabled={!enabled}
            />
            {jsonError && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                {jsonError}
              </p>
            )}
          </div>

          <p className="text-xs text-gray-400">
            Paste a valid x402 PaymentPayload object. This will be sent as{" "}
            <code>_meta[&quot;x402/payment&quot;]</code> with the tool call,
            allowing you to test paid tool execution on x402-enabled MCP
            servers.
          </p>
        </div>
      )}
    </div>
  );
}
