import type { Realtime } from "inngest";
import { useRealtime } from "inngest/react";
import { useState, useEffect } from "react";

import { manualTriggerChannel } from "@/inngest/channels/manual-trigger";
import type { NodeStatus } from "@/components/react-flow/node-status-indicator";

interface UseNodeStatusOptions {
  nodeId: string;
  channel: string;
  topic: string;
  refreshToken: () => Promise<Realtime.Subscribe.ClientToken>;
}

export function useNodeStatus({
  nodeId,
  channel,
  topic,
  refreshToken,
}: UseNodeStatusOptions) {
  const [status, setStatus] = useState<NodeStatus>("initial");

  const { messages } = useRealtime({
    channel: manualTriggerChannel,
    topics: [topic],
    token: refreshToken,
    enabled: true,
  });

  useEffect(() => {
    const latestForNode = [...messages.all].reverse().find((msg) => {
      if (msg.kind === "run") return false;
      if (msg.topic !== "status") return false;
      return msg.data.nodeId === nodeId;
    });

    if (!latestForNode || latestForNode.kind === "run") return;

    setStatus(latestForNode.data.status);
  }, [messages.all, nodeId, channel, topic]);

  return status;
}
