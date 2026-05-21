import { realtime, staticSchema } from "inngest";

export const geminiChannel = realtime.channel({
  name: "gemini-execution",
  topics: {
    status: {
      schema: staticSchema<{
        nodeId: string;
        status: "loading" | "success" | "error";
      }>(),
    },
  },
});
