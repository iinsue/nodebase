import { realtime, staticSchema } from "inngest";

export const slackChannel = realtime.channel({
  name: "slack-execution",
  topics: {
    status: {
      schema: staticSchema<{
        nodeId: string;
        status: "loading" | "success" | "error";
      }>(),
    },
  },
});
