import { generateText } from "ai";
import Handlebars from "handlebars";
import { NonRetriableError } from "inngest";
import { createAnthropic } from "@ai-sdk/anthropic";

import prisma from "@/lib/db";
import type { NodeExecutor } from "@/features/executions/types";
import { anthropicChannel } from "@/inngest/channels/anthropic";

type AnthropicData = {
  variableName?: string;
  credentialId?: string;
  systemPrompt?: string;
  userPrompt?: string;
};

Handlebars.registerHelper("json", (context) => {
  const jsonString = JSON.stringify(context, null, 2);
  const safeString = new Handlebars.SafeString(jsonString);

  return safeString;
});

export const anthropicExecutor: NodeExecutor<AnthropicData> = async ({
  data,
  userId,
  nodeId,
  context,
  step,
}) => {
  const publishAnthropicNodeError = async () => {
    await step.realtime.publish(
      "anthropic-node-error",
      anthropicChannel.status,
      {
        nodeId,
        status: "error",
      },
    );
  };

  // Publish "loading" state for anthropic
  await step.realtime.publish(
    "anthropic-node-loading",
    anthropicChannel.status,
    {
      nodeId,
      status: "loading",
    },
  );

  if (!data.variableName) {
    await publishAnthropicNodeError();

    throw new NonRetriableError("Anthropic node: Variable name is missing");
  }

  if (!data.userPrompt) {
    await publishAnthropicNodeError();

    throw new NonRetriableError("Anthropic node: User prompt is missing");
  }

  if (!data.credentialId) {
    await publishAnthropicNodeError();

    throw new NonRetriableError("Anthropic node: Credential is required");
  }

  const systemPrompt = data.systemPrompt
    ? Handlebars.compile(data.systemPrompt)(context)
    : "You are a helpful assistant.";

  const userPrompt = Handlebars.compile(data.userPrompt)(context);

  try {
    const credential = await step.run("get-credential", () => {
      return prisma.credential.findUnique({
        where: {
          id: data.credentialId,
          userId,
        },
      });
    });

    if (!credential) {
      await publishAnthropicNodeError();

      throw new NonRetriableError("Anthropic node: Credential not found");
    }

    const anthropic = createAnthropic({
      apiKey: credential.value,
    });

    const { text } = await step.ai.wrap(
      "anthropic-generate-text",
      generateText,
      {
        model: anthropic("claude-sonnet-4-5"),
        system: systemPrompt,
        prompt: userPrompt,
        experimental_telemetry: {
          isEnabled: true,
          recordInputs: true,
          recordOutputs: true,
        },
      },
    );

    await step.realtime.publish(
      "anthropic-node-success",
      anthropicChannel.status,
      {
        nodeId,
        status: "success",
      },
    );

    return {
      ...context,
      [data.variableName]: {
        text,
      },
    };
  } catch (error) {
    await publishAnthropicNodeError();

    throw error;
  }
};
