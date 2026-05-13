import { realtime, staticSchema } from "inngest";

export const httpRequestChannel = realtime.channel({
  name: "http-request-execution",
  topics: {
    status: {
      schema: staticSchema<{
        nodeId: string;
        status: "loading" | "success" | "error";
      }>(),
    },
  },
});
