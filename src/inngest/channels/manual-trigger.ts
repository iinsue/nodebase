import { realtime, staticSchema } from "inngest";

export const manualTriggerChannel = realtime.channel({
  name: "manual-trigger-execution",
  topics: {
    status: {
      schema: staticSchema<{
        nodeId: string;
        status: "loading" | "success" | "error";
      }>(),
    },
  },
});
