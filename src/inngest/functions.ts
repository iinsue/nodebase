import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

import { inngest } from "./client";
import prisma from "@/lib/db";

const openai = createOpenAI();
const anthropic = createAnthropic();
const google = createGoogleGenerativeAI();

// Test - AI Provider
export const execute = inngest.createFunction(
  { id: "execute-ai", triggers: { event: "execute/ai" } },

  async ({ event, step }) => {
    await step.sleep("pretend", "5s");

    const { steps: geminiSteps } = await step.ai.wrap(
      "gemini-generate-text",
      generateText,
      {
        model: google("gemini-2.5-flash"),
        system: "You are a helpful assistant.",
        prompt: "What is 2+2 ?",
        experimental_telemetry: {
          isEnabled: true,
          recordInputs: true,
          recordOutputs: true,
        },
      },
    );

    const { steps: openaiSteps } = await step.ai.wrap(
      "gpt-generate-text",
      generateText,
      {
        model: openai("gpt-5-nano"),
        system: "You are a helpful assistant",
        prompt: "What is 2+2 ?",
        experimental_telemetry: {
          isEnabled: true,
          recordInputs: true,
          recordOutputs: true,
        },
      },
    );

    const { steps: anthropicSteps } = await step.ai.wrap(
      "anthropic-generate-text",
      generateText,
      {
        model: anthropic("claude-sonnet-4-5"),
        system: "You are a helpful assistant",
        prompt: "What is 2+2 ?",
        experimental_telemetry: {
          isEnabled: true,
          recordInputs: true,
          recordOutputs: true,
        },
      },
    );

    return {
      geminiSteps,
      openaiSteps,
      anthropicSteps,
    };
  },
);

// Test - Create Workflow
export const processTask = inngest.createFunction(
  {
    id: "process-task",
    triggers: {
      event: "app/task.created",
    },
    retries: 2,
  },

  async ({ event, step }) => {
    // TODO: Fetching the video
    await step.sleep("pause-fetching", "5s");

    // TODO: Transcribing
    await step.sleep("pause-transcribing", "5s");

    // TODO: Sending transcripton to AI
    await step.sleep("pause-sending", "5s");

    await step.run("create-workflow", () => {
      return prisma.workflow.create({
        data: {
          name: "workflow-from-inngest",
        },
      });
    });

    return { message: "Process Task complete" };
  },
);
