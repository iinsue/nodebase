import ky from "ky";
import Handlebars from "handlebars";
import { decode } from "html-entities";
import { NonRetriableError } from "inngest";

import type { NodeExecutor } from "@/features/executions/types";
import { discordChannel } from "@/inngest/channels/discord";

type DiscordData = {
  variableName?: string;
  webhookUrl?: string;
  content?: string;
  username?: string;
};

Handlebars.registerHelper("json", (context) => {
  const jsonString = JSON.stringify(context, null, 2);
  const safeString = new Handlebars.SafeString(jsonString);

  return safeString;
});

export const discordExecutor: NodeExecutor<DiscordData> = async ({
  data,
  nodeId,
  context,
  step,
}) => {
  const publishDiscordNodeError = async () => {
    await step.realtime.publish("discord-node-error", discordChannel.status, {
      nodeId,
      status: "error",
    });
  };

  // Publish "loading" state for discord
  await step.realtime.publish("discord-node-loading", discordChannel.status, {
    nodeId,
    status: "loading",
  });

  if (!data.content) {
    await publishDiscordNodeError();

    throw new NonRetriableError("Discord node: Message content is required");
  }

  try {
    const rawContent = Handlebars.compile(data.content)(context);
    const content = decode(rawContent);
    const username = data.username
      ? decode(Handlebars.compile(data.username)(context))
      : undefined;

    const result = await step.run("discord-webhook", async () => {
      if (!data.webhookUrl) {
        await publishDiscordNodeError();

        throw new NonRetriableError("Discord node: Webhook URL is required");
      }

      await ky.post(data.webhookUrl, {
        json: {
          content: content.slice(0, 2000), // Discord's max message length
          username,
        },
      });

      if (!data.variableName) {
        await publishDiscordNodeError();

        throw new NonRetriableError("Discord node: Variable name is missing");
      }

      return {
        ...context,
        [data.variableName]: {
          messageContent: content.slice(0, 2000),
        },
      };
    });

    await step.realtime.publish("discord-node-success", discordChannel.status, {
      nodeId,
      status: "success",
    });

    return result;
  } catch (error) {
    await publishDiscordNodeError();

    throw error;
  }
};
