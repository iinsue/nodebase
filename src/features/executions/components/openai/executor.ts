import { generateText } from "ai";
import Handlebars from "handlebars";
import { NonRetriableError } from "inngest";
import { createOpenAI } from "@ai-sdk/openai";

import { openAiChannel } from "@/inngest/channels/openai";
import type { NodeExecutor } from "@/features/executions/types";

type OpenAiData = {
  variableName?: string;
  systemPrompt?: string;
  userPrompt?: string;
};

Handlebars.registerHelper("json", (context) => {
  const jsonString = JSON.stringify(context, null, 2);
  const safeString = new Handlebars.SafeString(jsonString);

  return safeString;
});

export const openAiExecutor: NodeExecutor<OpenAiData> = async ({
  data,
  nodeId,
  context,
  step,
}) => {
  const publishOpenAiNodeError = async () => {
    await step.realtime.publish("openai-node-error", openAiChannel.status, {
      nodeId,
      status: "error",
    });
  };

  // Publish "loading" state for openai
  await step.realtime.publish("openai-node-loading", openAiChannel.status, {
    nodeId,
    status: "loading",
  });

  if (!data.variableName) {
    await publishOpenAiNodeError();

    throw new NonRetriableError("OpenAI node: Variable name is missing");
  }

  if (!data.userPrompt) {
    await publishOpenAiNodeError();

    throw new NonRetriableError("OpenAI node: User prompt is missing");
  }

  // TODO: Throw if credential is missing

  const systemPrompt = data.systemPrompt
    ? Handlebars.compile(data.systemPrompt)(context)
    : "You are a helpful assistant.";

  const userPrompt = Handlebars.compile(data.userPrompt)(context);

  // TODO: Fetch credential that user selected

  const credentialValue = process.env.OPENAI_API_KEY!;

  const openai = createOpenAI({
    apiKey: credentialValue,
  });

  try {
    const { text } = await step.ai.wrap("openai-generate-text", generateText, {
      model: openai("gpt-5.4-nano"),
      system: systemPrompt,
      prompt: userPrompt,
      experimental_telemetry: {
        isEnabled: true,
        recordInputs: true,
        recordOutputs: true,
      },
    });

    await step.realtime.publish("openai-node-success", openAiChannel.status, {
      nodeId,
      status: "success",
    });

    return {
      ...context,
      [data.variableName]: {
        text,
      },
    };
  } catch (error) {
    await publishOpenAiNodeError();

    throw error;
  }
};
