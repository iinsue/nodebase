import type { Realtime } from "inngest";
import { useRealtime } from "inngest/react";
import { useState, useEffect } from "react";

import type { NodeStatus } from "@/components/react-flow/node-status-indicator";

interface UseNodeStatusOptions {
  nodeId: string;
  topic: string;
  channel: Realtime.ChannelInput;
  refreshToken: () => Promise<Realtime.Subscribe.ClientToken>;
}

export function useNodeStatus({
  nodeId,
  topic,
  refreshToken,
  channel,
}: UseNodeStatusOptions) {
  const [status, setStatus] = useState<NodeStatus>("initial");

  const { messages } = useRealtime({
    channel: channel,
    topics: [topic],
    token: refreshToken,
    enabled: true,
  });

  useEffect(() => {
    const latestForNode = [...messages.all].reverse().find((msg) => {
      if (msg.kind === "run") return false;
      if (msg.topic !== topic) return false;

      // unknown Type Error로 인한 타입설정
      const msgData = msg.data as { nodeId: string };
      return msgData.nodeId === nodeId;
    });

    if (!latestForNode || latestForNode.kind === "run") return;

    // unknown Type Error로 인한 타입설정
    const latestForNodeData = latestForNode.data as { status: NodeStatus };

    setStatus(latestForNodeData.status);
  }, [messages.all, nodeId, topic]);

  return status;
}
