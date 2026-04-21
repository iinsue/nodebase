import { generateText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

import { inngest } from "./client";
import prisma from "@/lib/db";

const google = createGoogleGenerativeAI();

// Test - AI Provider
export const execute = inngest.createFunction(
  { id: "execute-ai", triggers: { event: "execute/ai" } },

  async ({ event, step }) => {
    await step.sleep("pretend", "5s");

    const { steps } = await step.ai.wrap("gemini-generate-text", generateText, {
      model: google("gemini-2.5-flash"),
      system: "You are a helpful assistant.",
      prompt: "What is 2+2 ?",
    });

    return steps;
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
