import { generateText } from "ai";
import Handlebars from "handlebars";
import { NonRetriableError } from "inngest";
import ky, { type Options as KyOptions } from "ky";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

import { geminiChannel } from "@/inngest/channels/gemini";
import type { NodeExecutor } from "@/features/executions/types";

type GeminiData = {
  variableName?: string;
  model?: string;
  systemPrompt?: string;
  userPrompt?: string;
};

Handlebars.registerHelper("json", (context) => {
  const jsonString = JSON.stringify(context, null, 2);
  const safeString = new Handlebars.SafeString(jsonString);

  return safeString;
});

export const geminiExecutor: NodeExecutor<GeminiData> = async ({
  data,
  nodeId,
  context,
  step,
}) => {
  let publishedValidationError = false;

  const publishGeminiNodeError = async () => {
    await step.realtime.publish("gemini-node-error", geminiChannel.status, {
      nodeId,
      status: "error",
    });
  };

  // Publish "loading" state for gemini
  await step.realtime.publish("gemini-node-loading", geminiChannel.status, {
    nodeId,
    status: "loading",
  });

  if (!data.variableName) {
    publishGeminiNodeError();

    throw new NonRetriableError("Gemini node: Variable name is missing");
  }

  if (!data.userPrompt) {
    publishGeminiNodeError();

    throw new NonRetriableError("Gemini node: User prompt is missing");
  }

  // TODO: Throw if credential is missing

  const systemPrompt = data.systemPrompt
    ? Handlebars.compile(data.systemPrompt)(context)
    : "You are a helpful assistant.";

  const userPrompt = Handlebars.compile(data.userPrompt)(context);

  // TODO: Fetch credential that user selected

  const credentialValue = process.env.GOOGLE_GENERATIVE_AI_API_KEY!;

  const google = createGoogleGenerativeAI({
    apiKey: credentialValue,
  });

  try {
    const { steps } = await step.ai.wrap("gemini-generate-text", generateText, {
      model: google(data.model || "gemini-2.5-flash"),
      system: systemPrompt,
      prompt: userPrompt,
      experimental_telemetry: {
        isEnabled: true,
        recordInputs: true,
        recordOutputs: true,
      },
    });

    const text =
      steps[0].content[0].type === "text" ? steps[0].content[0].text : "";

    await step.realtime.publish("gemini-node-success", geminiChannel.status, {
      nodeId,
      status: "success",
    });

    return {
      ...context,
      [data.variableName]: {
        aiResponse: text,
      },
    };
  } catch (error) {
    await step.realtime.publish("gemini-node-error", geminiChannel.status, {
      nodeId,
      status: "error",
    });

    throw error;
  }
};
