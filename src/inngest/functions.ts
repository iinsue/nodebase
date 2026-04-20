// src/inngest/functions.ts
import prisma from "@/lib/db";
import { inngest } from "./client";

export const processTask = inngest.createFunction(
  { id: "process-task", triggers: { event: "app/task.created" }, retries: 2 },
  async ({ event, step }) => {
    const result = await step.run("handle-task", async () => {
      return { processed: true, email: event.data.email };
    });

    // Fetching the video
    await step.sleep("pause-fetching", "5s");

    // Transcribing
    await step.sleep("pause-transcribing", "5s");

    // Sending transcription to AI
    await step.sleep("pause-sending", "5s");

    await step.run("create-workflow", () => {
      return prisma.workflow.create({
        data: {
          name: "workflow-from-inngest",
        },
      });
    });

    return { message: `Task ${event.data.email} complete`, result };
  },
);
