import prisma from "@/lib/db";
import { createTRPCRouter, protectedProcedure } from "../init";

export const appRouter = createTRPCRouter({
  getUsers: protectedProcedure.query(({ ctx }) => {
    // 사용자 조회
    return prisma.user.findMany({
      where: {
        id: ctx.auth.user.id,
      },
    });
  }),

  getWorkflows: protectedProcedure.query(() => {
    return prisma.workflow.findMany();
  }),

  createWorkflow: protectedProcedure.mutation(async () => {
    // Fetch the video
    await new Promise((resolve) => setTimeout(resolve, 5_000));

    // Transcribe the video
    await new Promise((resolve) => setTimeout(resolve, 5_000));

    // Send the transcription to OpenAI
    await new Promise((resolve) => setTimeout(resolve, 5_000));

    return prisma.workflow.create({
      data: {
        name: "test-workflow",
      },
    });
  }),
});
// export type definition of API
export type AppRouter = typeof appRouter;
