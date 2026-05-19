import { realtime, staticSchema } from "inngest";

export const stripeTriggerChannel = realtime.channel({
  name: "stripe-trigger-execution",
  topics: {
    status: {
      schema: staticSchema<{
        nodeId: string;
        status: "loading" | "success" | "error";
      }>(),
    },
  },
});
