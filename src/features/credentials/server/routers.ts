import z from "zod";

import prisma from "@/lib/db";
import {
  createTRPCRouter,
  premiumProcedure,
  protectedProcedure,
} from "@/trpc/init";
import { encrypt } from "@/lib/encryption";
import { PAGINATION } from "@/config/constants";
import { CredentialType } from "@/generated/prisma/enums";

export const credentialsRouter = createTRPCRouter({
  // Credential 생성
  create: premiumProcedure
    .input(
      z.object({
        name: z.string().min(1, "Name is required"),
        type: z.enum(CredentialType),
        value: z.string().min(1, "Value is required"),
      }),
    )
    .mutation(({ ctx, input }) => {
      const { name, value, type } = input;

      return prisma.credential.create({
        data: {
          name,
          userId: ctx.auth.user.id,
          type,
          value: encrypt(value),
        },
      });
    }),

  // Credential 제거
  remove: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) => {
      return prisma.credential.delete({
        where: {
          id: input.id,
          userId: ctx.auth.user.id,
        },
      });
    }),

  // Credential 수정
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1, "Name is required"),
        type: z.enum(CredentialType),
        value: z.string().min(1, "Value is required"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, name, type, value } = input;

      return prisma.credential.update({
        where: {
          id,
          userId: ctx.auth.user.id,
        },
        data: {
          name,
          type,
          value: encrypt(value),
        },
      });
    }),

  // Credential 불러오기
  getOne: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return prisma.credential.findUniqueOrThrow({
        where: { id: input.id, userId: ctx.auth.user.id },
      });
    }),

  // Credential 리스트 불러오기
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
        search: z.string().default(""),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { page, pageSize, search } = input;

      const [items, totalCount] = await Promise.all([
        // 검색
        prisma.credential.findMany({
          skip: (page - 1) * pageSize,
          take: pageSize,
          where: {
            userId: ctx.auth.user.id,
            name: {
              contains: search,
              mode: "insensitive",
            },
          },
          orderBy: {
            updatedAt: "desc",
          },
        }),

        // 총 페이지 개수
        prisma.credential.count({
          where: {
            userId: ctx.auth.user.id,
            name: {
              contains: search,
              mode: "insensitive",
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

  getByType: protectedProcedure
    .input(
      z.object({
        type: z.enum(CredentialType),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { type } = input;

      return await prisma.credential.findMany({
        where: { type, userId: ctx.auth.user.id },
        orderBy: { updatedAt: "desc" },
      });
    }),
});
