import { realtime, staticSchema } from "inngest";

export const discordChannel = realtime.channel({
  name: "discord-execution",
  topics: {
    status: {
      schema: staticSchema<{
        nodeId: string;
        status: "loading" | "success" | "error";
      }>(),
    },
  },
});
