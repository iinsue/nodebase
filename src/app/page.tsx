import { requireAuth } from "@/lib/auth-utils";

const Page = async () => {
  await requireAuth();

  return (
    <>
      <div className="flex min-h-screen min-w-screen items-center justify-center">
        protected server component
      </div>
    </>
  );
};

export default Page;
