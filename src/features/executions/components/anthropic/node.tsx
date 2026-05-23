"use client";

import { memo, useState } from "react";
import { useReactFlow, type Node, type NodeProps } from "@xyflow/react";

import { fetchAnthropicRealtimeToken } from "./actions";
import { BaseExecutionNode } from "../base-execution-node";
import { useNodeStatus } from "../../hooks/use-node-status";
import { AnthropicDialog, AnthropicFormValues } from "./dialog";
import { anthropicChannel } from "@/inngest/channels/anthropic";

type AnthropicNodeData = {
  credentialId?: string;
  variableName?: string;
  systemPrompt?: string;
  userPrompt?: string;
};

type AnthropicNodeType = Node<AnthropicNodeData>;

export const AnthropicNode = memo((props: NodeProps<AnthropicNodeType>) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { setNodes } = useReactFlow();

  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    topic: "status",
    channel: anthropicChannel,
    refreshToken: fetchAnthropicRealtimeToken,
  });

  const nodeData = props.data as AnthropicNodeData;
  const description = nodeData?.userPrompt
    ? `"claude-sonnet-4-5": ${nodeData.userPrompt.slice(0, 50)}...`
    : "Not configured";

  const handleOpenSettings = () => setDialogOpen(true);

  const handleSubmit = (values: AnthropicFormValues) => {
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === props.id) {
          return {
            ...node,
            data: {
              ...node.data,
              ...values,
            },
          };
        }

        return node;
      }),
    );
  };

  return (
    <>
      <AnthropicDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={nodeData}
      />

      <BaseExecutionNode
        {...props}
        id={props.id}
        icon="/logos/anthropic.svg"
        name="Anthropic"
        status={nodeStatus}
        description={description}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
    </>
  );
});

AnthropicNode.displayName = "AnthropicNode";
