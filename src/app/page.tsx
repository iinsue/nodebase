"use client";

import { Button } from "@/components/ui/button";
import { LogoutButton } from "./logout";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

const Page = () => {
  const trpc = useTRPC();
  const { data } = useQuery(trpc.getWorkflows.queryOptions());

  const create = useMutation(
    trpc.createWorkflow.mutationOptions({
      onSuccess: () => {
        toast.success("Job queued");
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
