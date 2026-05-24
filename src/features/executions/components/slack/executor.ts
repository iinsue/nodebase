import ky from "ky";
import Handlebars from "handlebars";
import { decode } from "html-entities";
import { NonRetriableError } from "inngest";

import { slackChannel } from "@/inngest/channels/slack";
import type { NodeExecutor } from "@/features/executions/types";

type SlackData = {
  variableName?: string;
  webhookUrl?: string;
  content?: string;
};

Handlebars.registerHelper("json", (context) => {
  const jsonString = JSON.stringify(context, null, 2);
  const safeString = new Handlebars.SafeString(jsonString);

  return safeString;
});

export const slackExecutor: NodeExecutor<SlackData> = async ({
  data,
  nodeId,
  context,
  step,
}) => {
  const publishSlackNodeError = async () => {
    await step.realtime.publish("slack-node-error", slackChannel.status, {
      nodeId,
      status: "error",
    });
  };

  // Publish "loading" state for slack
  await step.realtime.publish("slack-node-loading", slackChannel.status, {
    nodeId,
    status: "loading",
  });

  if (!data.content) {
    await publishSlackNodeError();

    throw new NonRetriableError("Slack node: Message content is required");
  }

  const rawContent = Handlebars.compile(data.content)(context);
  const content = decode(rawContent);

  try {
    const result = await step.run("slack-webhook", async () => {
      if (!data.webhookUrl) {
        await publishSlackNodeError();

        throw new NonRetriableError("Slack node: Webhook URL is required");
      }

      await ky.post(data.webhookUrl, {
        json: {
          content: content, // The key depends on workflow config
        },
      });

      if (!data.variableName) {
        await publishSlackNodeError();

        throw new NonRetriableError("Slack node: Variable name is missing");
      }

      return {
        ...context,
        [data.variableName]: {
          messageContent: content.slice(0, 2000),
        },
      };
    });

    await step.realtime.publish("Slack-node-success", slackChannel.status, {
      nodeId,
      status: "success",
    });

    return result;
  } catch (error) {
    await publishSlackNodeError();

    throw error;
  }
};
