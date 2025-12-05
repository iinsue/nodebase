import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

import prisma from "@/lib/db";
import { inngest } from "./client";

const openai = createOpenAI();
const anthropic = createAnthropic();
const google = createGoogleGenerativeAI();

export const execute = inngest.createFunction(
  { id: "execute-ai" },
  { event: "execute/ai" },
  async ({ event, step }) => {
    await step.sleep("pretend", "5s");

    const { steps: geminiSteps } = await step.ai.wrap(
      "gemini-generate-test",
      generateText,
      {
        model: google("gemini-2.5-flash"),
        system: "You are a helpful assistant",
        prompt: "What is 2 + 2?",
      },
    );

    const { steps: openaiSteps } = await step.ai.wrap(
      "openai-generate-test",
      generateText,
      {
        model: openai("gpt-4.1-mini"),
        system: "You are a helpful assistant",
        prompt: "What is 2 + 2?",
      },
    );

    const { steps: anthropicSteps } = await step.ai.wrap(
      "anthropic-generate-test",
      generateText,
      {
        model: anthropic("claude-sonnet-4-0"),
        system: "You are a helpful assistant",
        prompt: "What is 2 + 2?",
      },
    );

    return {
      geminiSteps,
      openaiSteps,
      anthropicSteps,
    };
  },
);
