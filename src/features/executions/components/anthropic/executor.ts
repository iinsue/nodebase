import { generateText } from "ai";
import Handlebars from "handlebars";
import { NonRetriableError } from "inngest";
import { createAnthropic } from "@ai-sdk/anthropic";

import type { NodeExecutor } from "@/features/executions/types";
import { anthropicChannel } from "@/inngest/channels/anthropic";

type AnthropicData = {
  variableName?: string;
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
    publishAnthropicNodeError();

    throw new NonRetriableError("Anthropic node: Variable name is missing");
  }

  if (!data.userPrompt) {
    publishAnthropicNodeError();

    throw new NonRetriableError("Anthropic node: User prompt is missing");
  }

  // TODO: Throw if credential is missing

  const systemPrompt = data.systemPrompt
    ? Handlebars.compile(data.systemPrompt)(context)
    : "You are a helpful assistant.";

  const userPrompt = Handlebars.compile(data.userPrompt)(context);

  // TODO: Fetch credential that user selected

  const credentialValue = process.env.ANTHROPIC_API_KEY!;

  const anthropic = createAnthropic({
    apiKey: credentialValue,
  });

  try {
    const { steps } = await step.ai.wrap(
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

    const text =
      steps[0].content[0].type === "text" ? steps[0].content[0].text : "";

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
    publishAnthropicNodeError();

    throw error;
  }
};
