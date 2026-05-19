"use client";

import { toast } from "sonner";
import { CopyIcon } from "lucide-react";
import { useParams } from "next/navigation";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const StripeTriggerDialog = ({ open, onOpenChange }: Props) => {
  const params = useParams();
  const workflowId = params.workflowId as string;

  // Construct the webhook URL
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const webhookUrl = `${baseUrl}/api/webhooks/stripe?workflowId=${workflowId}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(webhookUrl);
      toast.success("Webhook URL copied to clipboard");
    } catch {
      toast.error("Failed to copy URL");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Stripe Trigger Configuration</DialogTitle>

          <DialogDescription>
            Configure this webhook URL in your Stripe Dashboard to trigger this
            workflow on payment events.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="webhook-url">Webhook URL</Label>
            <div className="flex gap-2">
              <Input
                readOnly
                id="webhook-url"
                value={webhookUrl}
                className="font-mono text-sm"
              />
              <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={copyToClipboard}
              >
                <CopyIcon className="size-4" />
              </Button>
            </div>
          </div>

          <div className="bg-muted space-y-2 rounded-lg p-4">
            <h4 className="text-sm font-medium">Setup instructions:</h4>
            <ol className="text-muted-foreground list-inside list-decimal space-y-1 text-sm">
              <li>Open your Stripe Dashboard</li>
              <li>Go to Developers &rarr; Webhooks</li>
              <li>Click "Add endpoint"</li>
              <li>Paste the webhook URL above</li>
              <li>
                Select events to listen for (e.g., payment_intent.succeeded)
              </li>
              <li>Save and copy the signing secret</li>
            </ol>
          </div>

          <div className="bg-muted space-y-2 rounded-lg p-4">
            <h4 className="text-sm font-medium">Available Variables</h4>
            <ul className="text-muted-foreground space-y-1 text-sm">
              <li>
                <code className="bg-background rounded px-1 py-0.5">
                  {"{{stripe.amount}}"}
                </code>
                <span> - Payment amount</span>
              </li>

              <li>
                <code className="bg-background rounded px-1 py-0.5">
                  {"{{stripe.currency}}"}
                </code>
                <span> - Currency code</span>
              </li>

              <li>
                <code className="bg-background rounded px-1 py-0.5">
                  {"{{json stripe}}"}
                </code>
                <span> - Full event data as JSON</span>
              </li>

              <li>
                <code className="bg-background rounded px-1 py-0.5">
                  {"{{stripe.eventType}}"}
                </code>
                <span> - Event type (e.g., payment_intent.succeeded)</span>
              </li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
