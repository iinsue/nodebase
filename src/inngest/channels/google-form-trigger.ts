import { realtime, staticSchema } from "inngest";

export const googleFormTriggerChannel = realtime.channel({
  name: "google-form-trigger-execution",
  topics: {
    status: {
      schema: staticSchema<{
        nodeId: string;
        status: "loading" | "success" | "error";
      }>(),
    },
  },
});
