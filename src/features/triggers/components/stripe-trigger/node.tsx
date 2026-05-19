import { memo, useState } from "react";
import { NodeProps } from "@xyflow/react";

import { stripeTriggerChannel } from "@/inngest/channels/stripe-trigger";
import { useNodeStatus } from "@/features/executions/hooks/use-node-status";

import { StripeTriggerDialog } from "./dialog";
import { BaseTriggerNode } from "../base-trigger-node";
import { fetchStripeTriggerRealtimeToken } from "./actions";

export const StripeTriggerNode = memo((props: NodeProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    topic: "status",
    channel: stripeTriggerChannel,
    refreshToken: fetchStripeTriggerRealtimeToken,
  });

  const handleOpenSettings = () => setDialogOpen(true);

  return (
    <>
      <StripeTriggerDialog open={dialogOpen} onOpenChange={setDialogOpen} />

      <BaseTriggerNode
        {...props}
        icon="/logos/stripe.svg"
        name="Stripe"
        description="When stripe event is captured"
        status={nodeStatus}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
    </>
  );
});
