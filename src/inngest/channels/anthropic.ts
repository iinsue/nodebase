import { realtime, staticSchema } from "inngest";

export const anthropicChannel = realtime.channel({
  name: "anthropic-execution",
  topics: {
    status: {
      schema: staticSchema<{
        nodeId: string;
        status: "loading" | "success" | "error";
      }>(),
    },
  },
});
