import { TRPCError } from "@trpc/server";
import { inngest } from "@/inngest/client";
import prisma from "@/lib/db";
import {
  baseProcedure,
  createTRPCRouter,
  premiumProcedure,
  protectedProcedure,
} from "../init";

export const appRouter = createTRPCRouter({
  // 예제 - AI 테스트
  testAi: premiumProcedure.mutation(async () => {
    await inngest.send({
      name: "execute/ai",
    });

    return { success: true, message: "Job queued" };
  }),

  getUsers: protectedProcedure.query(({ ctx }) => {
    // 예제 - 사용자 조회
    return prisma.user.findMany({
      where: {
        id: ctx.auth.user.id,
      },
    });
  }),

  // 예제 - Background job Workflow 조회
  getWorkflows: protectedProcedure.query(() => {
    return prisma.workflow.findMany();
  }),

  // 예제 - Background job Workflow 생성
  createWorkflow: protectedProcedure.mutation(async () => {
    await inngest.send({
      name: "app/task.created",
      data: {
        email: "insu@abc.com",
      },
    });

    return { success: true, message: "Job queued" };
  }),
});
// export type definition of API
export type AppRouter = typeof appRouter;
