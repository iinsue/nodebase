"use client";

import { useState, memo } from "react";
import { PlusIcon } from "lucide-react";
import type { NodeProps } from "@xyflow/react";

import { WorkflowNode } from "./workflow-node";
import { NodeSelector } from "./node-selector";
import { PlaceholderNode } from "./react-flow/placeholder-node";

export const InitialNode = memo((props: NodeProps) => {
  const [selectorOpen, setSelectorOpen] = useState(false);

  return (
    <NodeSelector open={selectorOpen} onOpenChange={setSelectorOpen}>
      <WorkflowNode showToolbar={false}>
        <PlaceholderNode {...props} onClick={() => setSelectorOpen(true)}>
          <div className="flex cursor-pointer items-center justify-center">
            <PlusIcon className="size-4" />
          </div>
        </PlaceholderNode>
      </WorkflowNode>
    </NodeSelector>
  );
});
