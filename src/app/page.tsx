import { caller } from "@/trpc/server";

const Page = async () => {
  const users = await caller.getUsers();

  return (
    <div className="flex min-h-screen min-w-screen items-center justify-center">
      {JSON.stringify(users)}
    </div>
  );
};

export default Page;
