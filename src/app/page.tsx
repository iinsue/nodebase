"use client";

import { Button } from "@/components/ui/button";
import { LogoutButton } from "./logout";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const Page = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { data } = useQuery(trpc.getWorkflows.queryOptions());

  const create = useMutation(
    trpc.createWorkflow.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(trpc.getWorkflows.queryOptions());
      },
    }),
  );

  return (
    <>
      <div className="flex min-h-screen min-w-screen flex-col items-center justify-center gap-y-6">
        <div>protected server component</div>
        <div>{JSON.stringify(data, null, 2)}</div>

        <Button disabled={create.isPending} onClick={() => create.mutate()}>
          Create workflow
        </Button>

        <LogoutButton />
      </div>
    </>
  );
};

export default Page;
