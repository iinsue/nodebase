import { generateText } from "ai";
import Handlebars from "handlebars";
import { NonRetriableError } from "inngest";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

import prisma from "@/lib/db";
import { geminiChannel } from "@/inngest/channels/gemini";
import type { NodeExecutor } from "@/features/executions/types";

type GeminiData = {
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

export const geminiExecutor: NodeExecutor<GeminiData> = async ({
  data,
  nodeId,
  context,
  step,
}) => {
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
    await publishGeminiNodeError();

    throw new NonRetriableError("Gemini node: Variable name is missing");
  }

  if (!data.userPrompt) {
    await publishGeminiNodeError();

    throw new NonRetriableError("Gemini node: User prompt is missing");
  }

  if (!data.credentialId) {
    await publishGeminiNodeError();

    throw new NonRetriableError("Gemini node: Credential is required");
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
        },
      });
    });

    if (!credential) {
      throw new NonRetriableError("Gemini node: Credential not found");
    }

    const google = createGoogleGenerativeAI({
      apiKey: credential.value,
    });

    const { text } = await step.ai.wrap("gemini-generate-text", generateText, {
      model: google("gemini-2.5-flash"),
      system: systemPrompt,
      prompt: userPrompt,
      experimental_telemetry: {
        isEnabled: true,
        recordInputs: true,
        recordOutputs: true,
      },
    });

    await step.realtime.publish("gemini-node-success", geminiChannel.status, {
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
    await publishGeminiNodeError();

    throw error;
  }
};
