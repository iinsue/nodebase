import z from "zod";

import prisma from "@/lib/db";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { PAGINATION } from "@/config/constants";

export const executionsRouter = createTRPCRouter({
  // Execution 불러오기
  getOne: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return prisma.execution.findUniqueOrThrow({
        where: { id: input.id, workflow: { userId: ctx.auth.user.id } },
        include: { workflow: { select: { id: true, name: true } } },
      });
    }),

  // Execution 리스트 불러오기
  getMany: protectedProcedure
    .input(
      z.object({
        page: z
          .number()
          .int()
          .min(PAGINATION.DEFAULT_PAGE)
          .default(PAGINATION.DEFAULT_PAGE),
        pageSize: z
          .number()
          .int()
          .min(PAGINATION.MIN_PAGE_SIZE)
          .max(PAGINATION.MAX_PAGE_SIZE)
          .default(PAGINATION.DEFAULT_PAGE_SIZE),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { page, pageSize } = input;

      const [items, totalCount] = await Promise.all([
        // 검색
        prisma.execution.findMany({
          skip: (page - 1) * pageSize,
          take: pageSize,
          where: {
            workflow: {
              userId: ctx.auth.user.id,
            },
          },
          orderBy: {
            startedAt: "desc",
          },
          include: {
            workflow: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        }),

        // 총 페이지 개수
        prisma.execution.count({
          where: {
            workflow: {
              userId: ctx.auth.user.id,
            },
          },
        }),
      ]);

      const totalPages = Math.ceil(totalCount / pageSize);
      const hasNextPage = page < totalPages;
      const hasPreviousPage = page > 1;

      return {
        items,
        page,
        pageSize,
        totalCount,
        totalPages,
        hasNextPage,
        hasPreviousPage,
      };
    }),
});
