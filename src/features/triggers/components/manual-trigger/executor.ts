import type { NodeExecutor } from "@/features/executions/types";
import { manualTriggerChannel } from "@/inngest/channels/manual-trigger";

type ManualTriggerData = Record<string, unknown>;

export const manualTriggerExecutor: NodeExecutor<ManualTriggerData> = async ({
  nodeId,
  context,
  step,
}) => {
  // Publish "loading" state for manual trigger
  await step.realtime.publish(
    "manual-trigger-loading",
    manualTriggerChannel.status,
    {
      nodeId,
      status: "loading",
    },
  );

  try {
    const result = await step.run(
      "manual-trigger-success",
      async () => context,
    );

    // Publish "success" state for manual trigger
    await step.realtime.publish(
      "manual-trigger-success",
      manualTriggerChannel.status,
      {
        nodeId,
        status: "success",
      },
    );

    return result;
  } catch (error) {
    // Publish "error" state for manual trigger
    await step.realtime.publish(
      "manual-trigger-error",
      manualTriggerChannel.status,
      { nodeId, status: "error" },
    );

    throw error;
  }
};
