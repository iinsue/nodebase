import type { NodeExecutor } from "@/features/executions/types";
import { stripeTriggerChannel } from "@/inngest/channels/stripe-trigger";

type StripeTriggerData = Record<string, unknown>;

export const stripeTriggerExecutor: NodeExecutor<StripeTriggerData> = async ({
  nodeId,
  context,
  step,
}) => {
  // Publish "loading" state for stripe trigger
  await step.realtime.publish(
    "stripe-trigger-loading",
    stripeTriggerChannel.status,
    {
      nodeId,
      status: "loading",
    },
  );

  try {
    const result = await step.run(
      "stripe-trigger-success",
      async () => context,
    );

    // Publish "success" state for stripe trigger
    await step.realtime.publish(
      "stripe-trigger-success",
      stripeTriggerChannel.status,
      {
        nodeId,
        status: "success",
      },
    );

    return result;
  } catch (error) {
    // Publish "error" state for stripe trigger
    await step.realtime.publish(
      "stripe-trigger-error",
      stripeTriggerChannel.status,
      { nodeId, status: "error" },
    );

    throw error;
  }
};
