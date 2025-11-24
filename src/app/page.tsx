import { caller } from "@/trpc/server";
import { requireAuth } from "@/lib/auth-utils";
import { LogoutButton } from "./logout";

const Page = async () => {
  await requireAuth();

  const data = await caller.getUsers();

  return (
    <>
      <div className="flex min-h-screen min-w-screen flex-col items-center justify-center gap-y-6">
        protected server component
        <div>{JSON.stringify(data, null, 2)}</div>
        <LogoutButton />
      </div>
    </>
  );
};

export default Page;
