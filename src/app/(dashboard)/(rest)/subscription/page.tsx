"use client";

import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";

import { useTRPC } from "@/trpc/client";
import { Button } from "@/components/ui/button";

// Example Page - http://localhost:3000/subscription
const Page = () => {
  const trpc = useTRPC();
  const testAI = useMutation(
    trpc.testAi.mutationOptions({
      onSuccess: () => {
        toast.success("Success");
      },
      onError: ({ message }) => {
        toast.error(message);
      },
    }),
  );

  return (
    <Button onClick={() => testAI.mutate()}>Click to test subscription</Button>
  );
};

export default Page;
