import prisma from "@/lib/db";

import { baseProcedure, createTRPCRouter, protectProcedure } from "../init";

export const appRouter = createTRPCRouter({
  getUsers: protectProcedure.query(({ ctx }) => {
    return prisma.user.findMany({
      where: {
        id: ctx.auth.user.id,
      },
    });
  }),
});
// export type definition of API
export type AppRouter = typeof appRouter;
