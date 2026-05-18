import type { NodeExecutor } from "@/features/executions/types";
import { googleFormTriggerChannel } from "@/inngest/channels/google-form-trigger";

type GoogleFormTriggerData = Record<string, unknown>;

export const googleFormTriggerExecutor: NodeExecutor<
  GoogleFormTriggerData
> = async ({ nodeId, context, step }) => {
  // Publish "loading" state for google form trigger
  await step.realtime.publish(
    "google-form-trigger-loading",
    googleFormTriggerChannel.status,
    {
      nodeId,
      status: "loading",
    },
  );

  try {
    const result = await step.run(
      "google-form-trigger-success",
      async () => context,
    );

    // Publish "success" state for google form trigger
    await step.realtime.publish(
      "google-form-trigger-success",
      googleFormTriggerChannel.status,
      {
        nodeId,
        status: "success",
      },
    );

    return result;
  } catch (error) {
    // Publish "error" state for google form trigger
    await step.realtime.publish(
      "google-form-trigger-error",
      googleFormTriggerChannel.status,
      { nodeId, status: "error" },
    );

    throw error;
  }
};
